import { useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import {
  getRiskLevelLabel,
  getRiskTypeLabel,
  getStatusLabel,
} from '@/utils/helpers';
import type { PreShiftFormData, DailyRisk, RiskCardData } from '@/types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Users,
  Plane,
  Calendar,
  Wrench,
  Cloud,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

interface WorkCardDetailProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string | null;
  onGoToTracking?: (riskId: string) => void;
}

export default function WorkCardDetail({
  isOpen,
  onClose,
  formId,
  onGoToTracking,
}: WorkCardDetailProps) {
  const {
    getPreShiftFormById,
    getDailyRisksByFormId,
    getRiskBySourceFormId,
  } = useRiskStore();

  const form = formId ? getPreShiftFormById(formId) : null;
  const dailyRisks = formId ? getDailyRisksByFormId(formId) : [];
  const trackingRisks = formId ? getRiskBySourceFormId(formId) : [];

  const stats = useMemo(() => {
    const checked = dailyRisks.filter((r) => r.isChecked).length;
    const promoted = dailyRisks.filter((r) => r.promotedRiskId).length;
    const inTracking = trackingRisks.filter((r) => r.status !== 'closed').length;
    const closed = trackingRisks.filter((r) => r.status === 'closed').length;
    return { checked, promoted, total: dailyRisks.length, inTracking, closed };
  }, [dailyRisks, trackingRisks]);

  if (!form) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="来源工卡详情" size="xl">
      <div className="space-y-5">
        <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <div className="text-xs text-dashboard-muted mb-0.5">工卡号</div>
                <h3 className="text-xl font-bold font-mono text-white">
                  {form.workCardNo}
                </h3>
              </div>
            </div>
            <Badge variant="risk" level="medium">班前确认</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoItem icon={Plane} label="机型" value={form.aircraftType} />
            <InfoItem icon={Users} label="作业班组" value={form.team} />
            <InfoItem icon={Users} label="作业人数" value={`${form.workerCount}人`} />
            <InfoItem icon={Calendar} label="创建时间" value={form.createdAt} mono />
          </div>

          <div className="mt-3 pt-3 border-t border-dashboard-border grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-dashboard-muted mb-1.5 flex items-center gap-1">
                <Wrench size={12} />
                特殊工具
              </div>
              <div className="flex flex-wrap gap-1">
                {form.specialTools.length > 0 ? (
                  form.specialTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 bg-dashboard-bg text-dashboard-text text-xs rounded border border-dashboard-border"
                    >
                      {tool}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-dashboard-muted">无</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-dashboard-muted mb-1.5 flex items-center gap-1">
                <Cloud size={12} />
                天气条件
              </div>
              <span className="text-sm text-white">{form.weather}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard label="当班风险" value={stats.total} color="text-accent-blue" bg="bg-accent-blue/15" />
          <StatCard label="已确认" value={stats.checked} color="text-risk-low" bg="bg-risk-lowBg" />
          <StatCard label="跟踪中" value={stats.inTracking} color="text-risk-medium" bg="bg-risk-mediumBg" />
          <StatCard label="已闭环" value={stats.closed} color="text-risk-low" bg="bg-risk-lowBg" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-risk-high" />
            当班风险清单
          </h4>
          <div className="bg-dashboard-surface border border-dashboard-border rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
            {dailyRisks.length === 0 ? (
              <div className="py-8 text-center text-dashboard-muted text-sm">
                暂无当班风险
              </div>
            ) : (
              <div className="divide-y divide-dashboard-border/50">
                {dailyRisks.map((risk) => (
                  <DailyRiskItem
                    key={risk.id}
                    risk={risk}
                    promotedRisk={trackingRisks.find((r) => r.id === risk.promotedRiskId)}
                    onGoToTracking={onGoToTracking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {trackingRisks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              转入闭环跟踪的风险
            </h4>
            <div className="bg-dashboard-surface border border-dashboard-border rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
              <div className="divide-y divide-dashboard-border/50">
                {trackingRisks.map((risk) => (
                  <TrackingRiskItem
                    key={risk.id}
                    risk={risk}
                    onGoToTracking={onGoToTracking}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-dashboard-border">
        <Button variant="secondary" onClick={onClose}>
          关闭
        </Button>
      </div>
    </Modal>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-0.5">
        <Icon size={12} />
        <span>{label}</span>
      </div>
      <div className={cn('text-sm font-medium text-white', mono && 'font-mono')}>
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
      <div className="text-xs text-dashboard-muted mb-1">{label}</div>
      <div className={cn('text-2xl font-bold font-mono', color)}>{value}</div>
    </div>
  );
}

function DailyRiskItem({
  risk,
  promotedRisk,
  onGoToTracking,
}: {
  risk: DailyRisk;
  promotedRisk?: RiskCardData;
  onGoToTracking?: (riskId: string) => void;
}) {
  const levelColor =
    risk.level === 'high' ? 'text-risk-high bg-risk-highBg' :
    risk.level === 'medium' ? 'text-risk-medium bg-risk-mediumBg' :
    'text-risk-low bg-risk-lowBg';

  return (
    <div className="p-3 flex items-center gap-3 hover:bg-dashboard-card/30 transition-colors">
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
          risk.isChecked ? 'bg-risk-low text-white' : 'bg-dashboard-border text-dashboard-muted'
        )}
      >
        {risk.isChecked ? (
          <CheckCircle2 size={14} />
        ) : (
          <Circle size={14} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-white">{risk.description}</span>
          <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', levelColor)}>
            {getRiskLevelLabel(risk.level)}
          </span>
        </div>
        {promotedRisk && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-accent-blue">
            <ExternalLink size={10} />
            <span>已转入跟踪 · {getStatusLabel(promotedRisk.status)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {promotedRisk && promotedRisk.isOverdue && (
          <span className="px-1.5 py-0.5 bg-risk-high text-white text-[10px] font-medium rounded">
            超时
          </span>
        )}
        {promotedRisk && onGoToTracking && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGoToTracking(promotedRisk.id);
            }}
            className="text-xs text-accent-blue hover:text-accent-blue/80 flex items-center gap-0.5"
          >
            查看
            <ArrowRight size={10} />
          </button>
        )}
        {!promotedRisk && (
          <span className="text-xs text-dashboard-muted">未转入</span>
        )}
      </div>
    </div>
  );
}

function TrackingRiskItem({
  risk,
  onGoToTracking,
}: {
  risk: RiskCardData;
  onGoToTracking?: (riskId: string) => void;
}) {
  const location = LOCATIONS.find((l) => l.id === risk.locationId);
  const isEscalated = risk.escalationLevel && risk.escalationLevel !== 'none';

  return (
    <div className="p-3 flex items-center gap-3 hover:bg-dashboard-card/30 transition-colors">
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          risk.level === 'high' ? 'bg-risk-highBg' :
          risk.level === 'medium' ? 'bg-risk-mediumBg' : 'bg-risk-lowBg'
        )}
      >
        <AlertTriangle
          className={cn(
            'w-4 h-4',
            risk.level === 'high' ? 'text-risk-high' :
            risk.level === 'medium' ? 'text-risk-medium' : 'text-risk-low'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">
            {getRiskTypeLabel(risk.type)}
          </span>
          <Badge status={risk.status} size="sm" />
          {risk.isOverdue && (
            <span className="px-1.5 py-0.5 bg-risk-high text-white text-[10px] font-medium rounded">
              超时
            </span>
          )}
          {isEscalated && (
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-medium rounded flex items-center gap-0.5">
              <ShieldAlert size={10} />
              {risk.escalationLevel === 'manager' ? '值班经理' : '质量安全主管'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-dashboard-muted">
          <span>{location?.name || '-'}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {risk.releaseDeadline}
          </span>
        </div>
      </div>
      {onGoToTracking && (
        <button
          onClick={() => onGoToTracking(risk.id)}
          className="text-xs text-accent-blue hover:text-accent-blue/80 flex items-center gap-0.5"
        >
          处理
          <ArrowRight size={10} />
        </button>
      )}
    </div>
  );
}
