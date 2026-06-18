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
  GitBranch,
  PlayCircle,
  CheckSquare,
  Share2,
  XCircle,
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
    getRecordsByRiskId,
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

  const trackingRisksWithTimeline = useMemo(() => {
    return trackingRisks.map((risk) => {
      const dailyRisk = dailyRisks.find((d) => d.promotedRiskId === risk.id);
      const records = getRecordsByRiskId(risk.id);
      const timeline: Array<{
        stage: 'confirmed' | 'promoted' | 'processing' | 'closed';
        time: string;
        title: string;
        description: string;
        icon: any;
        color: string;
        completed: boolean;
      }> = [];

      if (dailyRisk) {
        timeline.push({
          stage: 'confirmed',
          time: form?.createdAt || risk.createdAt,
          title: '班前确认',
          description: dailyRisk.isChecked ? '已确认' : '未确认',
          icon: CheckSquare,
          color: dailyRisk.isChecked ? 'text-risk-low' : 'text-dashboard-muted',
          completed: dailyRisk.isChecked,
        });
      }

      timeline.push({
        stage: 'promoted',
        time: risk.createdAt,
        title: '转入跟踪',
        description: '从班前确认转入闭环跟踪',
        icon: Share2,
        color: 'text-accent-blue',
        completed: true,
      });

      const processingRecord = records.find((r) => r.reviewResult.includes('处理中') || r.reviewResult.includes('跟进'));
      const closedRecord = records.find((r) => r.reviewResult.includes('合格') || r.reviewResult.includes('闭环'));

      if (processingRecord || risk.status === 'processing' || risk.status === 'closed') {
        timeline.push({
          stage: 'processing',
          time: processingRecord?.handledAt || risk.createdAt,
          title: '处理中',
          description: processingRecord
            ? `${processingRecord.handler}：${processingRecord.reviewResult}`
            : '正在跟进处理',
          icon: PlayCircle,
          color: 'text-risk-medium',
          completed: risk.status === 'processing' || risk.status === 'closed',
        });
      }

      if (closedRecord || risk.status === 'closed') {
        timeline.push({
          stage: 'closed',
          time: closedRecord?.handledAt || risk.releaseDeadline,
          title: '已闭环',
          description: closedRecord
            ? `${closedRecord.handler}：${closedRecord.reviewResult}`
            : '已完成闭环',
          icon: CheckCircle2,
          color: 'text-risk-low',
          completed: risk.status === 'closed',
        });
      }

      return { risk, dailyRisk, records, timeline };
    });
  }, [trackingRisks, dailyRisks, form, getRecordsByRiskId]);

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
              <GitBranch className="w-4 h-4 text-accent-blue" />
              风险处理完整链路
            </h4>
            <div className="space-y-4">
              {trackingRisksWithTimeline.map(({ risk, dailyRisk, records, timeline }) => (
                <RiskTimelineCard
                  key={risk.id}
                  risk={risk}
                  dailyRisk={dailyRisk}
                  timeline={timeline}
                  onGoToTracking={onGoToTracking}
                />
              ))}
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

function RiskTimelineCard({
  risk,
  dailyRisk,
  timeline,
  onGoToTracking,
}: {
  risk: RiskCardData;
  dailyRisk?: DailyRisk;
  timeline: Array<{
    stage: string;
    time: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    completed: boolean;
  }>;
  onGoToTracking?: (riskId: string) => void;
}) {
  const location = LOCATIONS.find((l) => l.id === risk.locationId);
  const isEscalated = risk.escalationLevel && risk.escalationLevel !== 'none';

  return (
    <div className="bg-dashboard-card rounded-lg border border-dashboard-border overflow-hidden">
      <div className="p-4 border-b border-dashboard-border/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="risk" level={risk.level} size="sm" />
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
            <div className="text-sm font-medium text-white mb-1">
              {getRiskTypeLabel(risk.type)}
              {risk.aircraftNo && <span className="text-dashboard-muted ml-2">· {risk.aircraftNo}</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-dashboard-muted flex-wrap">
              <span>{location?.name || '-'}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {risk.releaseDeadline}
              </span>
              {risk.team && <span>班组：{risk.team}</span>}
            </div>
            {dailyRisk && (
              <div className="mt-2 pt-2 border-t border-dashboard-border/30 text-xs text-dashboard-muted">
                <span className="text-dashboard-text font-medium">来源风险描述：</span>
                {dailyRisk.description}
              </div>
            )}
          </div>
          {onGoToTracking && (
            <button
              onClick={() => onGoToTracking(risk.id)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs bg-accent-blue/10 text-accent-blue rounded-md hover:bg-accent-blue/20 transition-colors"
            >
              去处理
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs text-dashboard-muted mb-3 flex items-center gap-1.5">
          <GitBranch size={12} />
          处理链路时间线
        </div>
        <div className="relative pl-5">
          {timeline.map((step, idx) => (
            <div key={step.stage} className="relative pb-4 last:pb-0">
              {idx < timeline.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[9px] top-5 w-0.5 h-full',
                    step.completed ? 'bg-dashboard-border' : 'bg-dashboard-border/30'
                  )}
                />
              )}
              <div className="relative">
                <div
                  className={cn(
                    'absolute -left-5 top-0 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2',
                    step.completed
                      ? 'bg-dashboard-card border-current'
                      : 'bg-dashboard-bg border-dashed border-dashboard-border'
                  )}
                >
                  <step.icon size={10} className={step.color} />
                </div>
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-xs font-medium', step.color)}>
                      {step.title}
                    </span>
                    {step.completed ? (
                      <CheckCircle2 size={12} className="text-risk-low" />
                    ) : (
                      <XCircle size={12} className="text-dashboard-muted" />
                    )}
                  </div>
                  <div className="text-xs text-dashboard-text/80 mb-0.5">
                    {step.description}
                  </div>
                  <div className="text-[10px] text-dashboard-muted font-mono">
                    {step.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
