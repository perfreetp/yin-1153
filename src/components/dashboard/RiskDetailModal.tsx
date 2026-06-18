import { useNavigate } from 'react-router-dom';
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
  History,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskDetailModal() {
  const navigate = useNavigate();
  const {
    isDetailModalOpen,
    selectedRiskId,
    riskCards,
    getMeasuresByRiskId,
    getRecordsByRiskId,
    closeRiskDetail,
  } = useRiskStore();

  const risk = riskCards.find((r) => r.id === selectedRiskId);
  const measures = selectedRiskId ? getMeasuresByRiskId(selectedRiskId) : [];
  const records = selectedRiskId ? getRecordsByRiskId(selectedRiskId) : [];

  if (!risk) return null;

  const location = LOCATIONS.find((l) => l.id === risk.locationId);
  const colors = getRiskLevelColor(risk.level);
  const openMeasures = measures.filter((m) => !m.isClosed);
  const closedMeasures = measures.filter((m) => m.isClosed);

  const handleGoToTracking = () => {
    closeRiskDetail();
    navigate('/tracking');
  };

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={closeRiskDetail}
      title="风险详情"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center',
                  colors.bg
                )}
              >
                <AlertTriangle className={cn('w-7 h-7', colors.text)} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  {getRiskTypeLabel(risk.type)}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                <div className="flex items-center gap-2 text-dashboard-muted justify-end">
                  <Plane size={14} />
                  <span className="text-xs">飞机注册号</span>
                </div>
                <div className="text-xl font-mono font-bold text-white mt-0.5">
                  {risk.aircraftNo}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={Users} label="责任班组" value={risk.team} />
            <InfoCard
              icon={MapPin}
              label="作业位置"
              value={location ? `${getLocationTypeLabel(location.type)} · ${location.name}` : '-'}
            />
            <InfoCard
              icon={Clock}
              label="放行时限"
              value={risk.releaseDeadline}
              highlight={risk.isOverdue}
            />
            <InfoCard icon={Calendar} label="创建时间" value={risk.createdAt} />
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
        </div>

        <div className="lg:col-span-2">
          <div className="bg-dashboard-card rounded-xl border border-dashboard-border p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-accent-blue" />
              <h4 className="font-semibold text-white">处理时间线</h4>
            </div>

            <div className="relative pl-5 space-y-0 max-h-[380px] overflow-y-auto pr-1">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-dashboard-border" />

              <TimelineItem
                icon={AlertTriangle}
                iconColor="text-risk-high"
                iconBg="bg-risk-highBg"
                title="风险创建"
                time={risk.createdAt}
                content={`初始状态：${getStatusLabel(risk.status)}`}
                isFirst
              />

              {records.length > 0 ? (
                records
                  .slice()
                  .reverse()
                  .map((record, idx) => (
                    <TimelineItem
                      key={record.id}
                      icon={User}
                      iconColor="text-risk-medium"
                      iconBg="bg-risk-mediumBg"
                      title={record.handler}
                      time={record.handledAt}
                      content={record.reviewResult}
                    />
                  ))
              ) : null}

              {risk.status !== 'closed' && (
                <div className="relative -ml-1.5 pb-1">
                  <div className="w-3 h-3 rounded-full bg-accent-blue animate-pulse absolute -left-[1px] top-1.5" />
                  <div className="ml-6 text-sm text-accent-blue font-medium">
                    {risk.status === 'processing' ? '处理进行中...' : '待处理'}
                  </div>
                </div>
              )}

              {risk.status === 'closed' && (
                <div className="relative -ml-1.5 pb-1">
                  <div className="w-3 h-3 rounded-full bg-risk-low absolute -left-[1px] top-1.5" />
                  <div className="ml-6 text-sm text-risk-low font-medium">
                    已闭环
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-dashboard-border">
        <Button variant="secondary" onClick={closeRiskDetail}>
          关闭
        </Button>
        <Button variant="primary" onClick={handleGoToTracking}>
          <span>前往闭环处理</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </Modal>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-dashboard-card rounded-lg p-3 border',
        highlight ? 'border-risk-high/50' : 'border-dashboard-border'
      )}
    >
      <div className="flex items-center gap-2 text-dashboard-muted text-xs mb-1">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div
        className={cn(
          'text-base font-semibold',
          highlight ? 'text-risk-high font-mono' : 'text-white'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  time,
  content,
  isFirst,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  time: string;
  content: string;
  isFirst?: boolean;
}) {
  return (
    <div className="relative pb-4">
      <div
        className={cn(
          'absolute -left-[7px] w-4 h-4 rounded-full flex items-center justify-center',
          iconBg
        )}
      >
        <Icon className={cn('w-2.5 h-2.5', iconColor)} />
      </div>
      <div className="ml-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="text-xs text-dashboard-muted font-mono">{time}</span>
        </div>
        <p className="text-sm text-dashboard-text mt-0.5">{content}</p>
      </div>
    </div>
  );
}
