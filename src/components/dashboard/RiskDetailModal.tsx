import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import {
  getRiskLevelLabel,
  getRiskLevelColor,
  getRiskTypeLabel,
  getLocationTypeLabel,
  getStatusLabel,
} from '@/utils/helpers';
import {
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Plane,
  Calendar,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskDetailModal() {
  const {
    isDetailModalOpen,
    selectedRiskId,
    riskCards,
    getMeasuresByRiskId,
    closeRiskDetail,
  } = useRiskStore();

  const risk = riskCards.find((r) => r.id === selectedRiskId);
  const measures = selectedRiskId ? getMeasuresByRiskId(selectedRiskId) : [];

  if (!risk) return null;

  const location = LOCATIONS.find((l) => l.id === risk.locationId);
  const colors = getRiskLevelColor(risk.level);
  const openMeasures = measures.filter((m) => !m.isClosed);
  const closedMeasures = measures.filter((m) => m.isClosed);

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={closeRiskDetail}
      title="风险详情"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center',
                colors.bg
              )}
            >
              <AlertTriangle className={cn('w-8 h-8', colors.text)} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                {getRiskTypeLabel(risk.type)}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="risk" level={risk.level}>
                  {getRiskLevelLabel(risk.level)}
                </Badge>
                <Badge status={risk.status} />
                {risk.isOverdue && (
                  <span className="px-2.5 py-0.5 bg-risk-high text-white text-xs font-medium rounded-full animate-pulse">
                    已超时
                  </span>
                )}
              </div>
            </div>
          </div>
          {risk.aircraftNo && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-dashboard-muted">
                <Plane size={16} />
                <span className="text-sm">飞机注册号</span>
              </div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {risk.aircraftNo}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-center gap-2 text-dashboard-muted text-sm mb-2">
              <Users size={16} />
              <span>责任班组</span>
            </div>
            <div className="text-lg font-semibold text-white">{risk.team}</div>
          </div>
          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-center gap-2 text-dashboard-muted text-sm mb-2">
              <MapPin size={16} />
              <span>作业位置</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {location ? (
                <>
                  {getLocationTypeLabel(location.type)} · {location.name}
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div
            className={cn(
              'bg-dashboard-card rounded-lg p-4 border',
              risk.isOverdue ? 'border-risk-high/50' : 'border-dashboard-border'
            )}
          >
            <div className="flex items-center gap-2 text-dashboard-muted text-sm mb-2">
              <Clock size={16} />
              <span>放行时限</span>
            </div>
            <div
              className={cn(
                'text-lg font-semibold font-mono',
                risk.isOverdue ? 'text-risk-high' : 'text-white'
              )}
            >
              {risk.releaseDeadline}
            </div>
          </div>
          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-center gap-2 text-dashboard-muted text-sm mb-2">
              <Calendar size={16} />
              <span>创建时间</span>
            </div>
            <div className="text-lg font-semibold text-white font-mono">
              {risk.createdAt}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-dashboard-muted" />
              <h4 className="text-base font-semibold text-white">风险控制措施</h4>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-dashboard-muted">
                已关闭 <span className="text-risk-low font-semibold">{closedMeasures.length}</span>
              </span>
              <span className="text-dashboard-muted">/</span>
              <span className="text-dashboard-muted">
                未关闭 <span className="text-risk-high font-semibold">{openMeasures.length}</span>
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {measures.length === 0 ? (
              <div className="bg-dashboard-card rounded-lg p-6 text-center border border-dashboard-border">
                <p className="text-dashboard-muted text-sm">暂无控制措施</p>
              </div>
            ) : (
              measures.map((measure) => (
                <div
                  key={measure.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all',
                    measure.isClosed
                      ? 'bg-risk-lowBg/30 border-risk-low/30'
                      : 'bg-dashboard-card border-dashboard-border'
                  )}
                >
                  {measure.isClosed ? (
                    <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-risk-high flex-shrink-0 animate-pulse" />
                  )}
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      measure.isClosed ? 'text-dashboard-muted line-through' : 'text-white'
                    )}
                  >
                    {measure.content}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      measure.isClosed
                        ? 'bg-risk-lowBg text-risk-low'
                        : 'bg-risk-highBg text-risk-high'
                    )}
                  >
                    {measure.isClosed ? '已完成' : '待落实'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashboard-border">
          <Button variant="secondary" onClick={closeRiskDetail}>
            关闭
          </Button>
          <Button variant="primary">
            <span>前往处理</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
