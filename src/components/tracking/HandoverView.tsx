import { useState } from 'react';
import { useRiskStore } from '@/store/useRiskStore';
import { BASES, LOCATIONS, LOCATION_TYPE_META } from '@/data/mockData';
import { getLocationTypeLabel, getRiskTypeLabel } from '@/utils/helpers';
import type { LocationType } from '@/types';
import { cn } from '@/lib/utils';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Building2,
  MapPin,
  Route,
  Filter,
  Download,
  RefreshCw,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  MapPin,
  Route,
};

interface HandoverViewProps {
  onExport?: () => void;
}

export default function HandoverView({ onExport }: HandoverViewProps) {
  const { getTeamSummary, selectedBaseId, selectedLocationType, setSelectedBaseId, setSelectedLocationType } = useRiskStore();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamLocType, setSelectedTeamLocType] = useState<LocationType | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const teamSummary = getTeamSummary();

  const handleTeamClick = (teamName: string, locType: LocationType) => {
    setSelectedTeam(teamName);
    setSelectedTeamLocType(locType);
    setIsTeamModalOpen(true);
  };

  const totalEscalated = teamSummary.reduce((s, t) => s + t.escalated, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dashboard-muted" />
            <span className="text-sm text-dashboard-muted">筛选：</span>
          </div>
          <select
            value={selectedBaseId}
            onChange={(e) => setSelectedBaseId(e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            {BASES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 p-1 bg-dashboard-card rounded-lg border border-dashboard-border">
            <button
              onClick={() => setSelectedLocationType('all')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                selectedLocationType === 'all'
                  ? 'bg-accent-blue text-white'
                  : 'text-dashboard-muted hover:text-white'
              )}
            >
              全部区域
            </button>
            {LOCATION_TYPE_META.map((meta) => {
              const Icon = iconMap[meta.icon] || MapPin;
              return (
                <button
                  key={meta.key}
                  onClick={() => setSelectedLocationType(meta.key as LocationType)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    selectedLocationType === meta.key
                      ? 'bg-accent-blue text-white'
                      : 'text-dashboard-muted hover:text-white'
                  )}
                >
                  <Icon size={14} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onExport}>
            <Download size={16} />
            <span>导出交接单</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="涉及班组"
          value={teamSummary.length}
          icon={Users}
          color="text-accent-blue"
          bgColor="bg-accent-blue/15"
        />
        <StatCard
          label="待处理"
          value={teamSummary.reduce((s, t) => s + t.open, 0)}
          icon={Clock}
          color="text-risk-high"
          bgColor="bg-risk-highBg"
          highlight={teamSummary.reduce((s, t) => s + t.open, 0) > 0}
        />
        <StatCard
          label="处理中"
          value={teamSummary.reduce((s, t) => s + t.processing, 0)}
          icon={RefreshCw}
          color="text-risk-medium"
          bgColor="bg-risk-mediumBg"
        />
        <StatCard
          label="已超时"
          value={teamSummary.reduce((s, t) => s + t.overdue, 0)}
          icon={AlertTriangle}
          color="text-risk-high"
          bgColor="bg-risk-highBg"
          highlight={teamSummary.reduce((s, t) => s + t.overdue, 0) > 0}
        />
        <StatCard
          label="已升级"
          value={totalEscalated}
          icon={ShieldAlert}
          color="text-orange-400"
          bgColor="bg-orange-500/15"
          highlight={totalEscalated > 0}
        />
      </div>

      <div className="bg-dashboard-surface border border-dashboard-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dashboard-border flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-white">班组交接汇总</h3>
          <span className="text-xs text-dashboard-muted">
            点击班组查看该区域未交接清楚的风险项
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
          {teamSummary.length === 0 ? (
            <div className="col-span-full py-12 text-center text-dashboard-muted">
              暂无班组数据
            </div>
          ) : (
            teamSummary.map((team, idx) => {
              const locType = LOCATION_TYPE_META.find((m) => m.key === team.locationType);
              const Icon = iconMap[locType?.icon || 'MapPin'] || MapPin;
              const base = BASES.find((b) => b.id === team.baseId);

              return (
                <button
                  key={`${team.team}-${team.locationType}`}
                  onClick={() => handleTeamClick(team.team, team.locationType)}
                  className="text-left bg-dashboard-card border border-dashboard-border rounded-xl p-4 hover:border-accent-blue/50 hover:shadow-lg transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white text-lg">{team.team}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-dashboard-muted">
                        <Icon size={12} />
                        <span>{base?.name} · {getLocationTypeLabel(team.locationType)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {team.overdue > 0 && (
                        <span className="px-2 py-0.5 bg-risk-high text-white text-xs font-bold rounded-full animate-pulse">
                          超时 {team.overdue}
                        </span>
                      )}
                      {team.escalated > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full flex items-center gap-1">
                          <ShieldAlert size={10} />
                          升级 {team.escalated}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <MiniStat
                      label="总数"
                      value={team.total}
                      color="text-dashboard-text"
                    />
                    <MiniStat
                      label="待处理"
                      value={team.open}
                      color={team.open > 0 ? 'text-risk-high' : 'text-dashboard-muted'}
                    />
                    <MiniStat
                      label="处理中"
                      value={team.processing}
                      color={team.processing > 0 ? 'text-risk-medium' : 'text-dashboard-muted'}
                    />
                    <MiniStat
                      label="已闭环"
                      value={team.closed}
                      color="text-risk-low"
                    />
                  </div>

                  {team.high > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-risk-high">
                      <AlertTriangle size={12} />
                      <span>高风险 {team.high} 项需重点关注</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-dashboard-border/50 flex items-center justify-between">
                    <span className="text-xs text-dashboard-muted">查看该区域详情</span>
                    <ChevronRight
                      size={16}
                      className="text-dashboard-muted group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <TeamDetailModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamName={selectedTeam}
        locationType={selectedTeamLocType}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-dashboard-surface border rounded-xl p-4 transition-all',
        highlight ? 'border-risk-high/50 animate-pulse-slow' : 'border-dashboard-border'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-dashboard-muted">{label}</div>
          <div
            className={cn(
              'text-3xl font-bold font-mono mt-1 animate-count-up',
              color
            )}
          >
            {value}
          </div>
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={cn('text-xl font-bold font-mono', color)}>{value}</div>
      <div className="text-xs text-dashboard-muted mt-0.5">{label}</div>
    </div>
  );
}

function TeamDetailModal({
  isOpen,
  onClose,
  teamName,
  locationType,
}: {
  isOpen: boolean;
  onClose: () => void;
  teamName: string | null;
  locationType: LocationType | null;
}) {
  const { getRisksByTeam, openRiskDetail } = useRiskStore();
  const risks = teamName ? getRisksByTeam(teamName, locationType || undefined) : [];

  const handleViewDetail = (riskId: string) => {
    onClose();
    setTimeout(() => {
      openRiskDetail(riskId);
    }, 200);
  };

  const unclosedRisks = risks.filter((r) => r.status !== 'closed');
  const overdueRisks = risks.filter((r) => r.isOverdue && r.status !== 'closed');
  const escalatedRisks = risks.filter(
    (r) => r.escalationLevel && r.escalationLevel !== 'none' && r.status !== 'closed'
  );

  const locTypeLabel = locationType ? getLocationTypeLabel(locationType) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${teamName || ''} - ${locTypeLabel}未交接风险`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-dashboard-card rounded-lg border border-dashboard-border flex-wrap">
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">{unclosedRisks.length}</div>
            <div className="text-xs text-dashboard-muted">未闭环</div>
          </div>
          <div className="w-px h-10 bg-dashboard-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-risk-high font-mono">{overdueRisks.length}</div>
            <div className="text-xs text-dashboard-muted">已超时</div>
          </div>
          <div className="w-px h-10 bg-dashboard-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 font-mono">{escalatedRisks.length}</div>
            <div className="text-xs text-dashboard-muted">已升级</div>
          </div>
          <div className="w-px h-10 bg-dashboard-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-risk-medium font-mono">
              {risks.filter((r) => r.level === 'high' && r.status !== 'closed').length}
            </div>
            <div className="text-xs text-dashboard-muted">高风险</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-risk-high" />
            待交接风险项（按优先级，仅当前{locTypeLabel}范围）
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {unclosedRisks.length === 0 ? (
              <div className="py-8 text-center text-dashboard-muted text-sm">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-risk-low" />
                所有风险已闭环完成，交接顺利！
              </div>
            ) : (
              unclosedRisks.map((risk, idx) => {
                const location = LOCATIONS.find((l) => l.id === risk.locationId);
                const isEscalated = risk.escalationLevel && risk.escalationLevel !== 'none';
                return (
                  <div
                    key={risk.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border transition-all animate-fade-in-up',
                      risk.isOverdue
                        ? 'bg-risk-highBg/30 border-risk-high/40'
                        : 'bg-dashboard-card border-dashboard-border hover:border-accent-blue/40'
                    )}
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <div
                      className={cn(
                        'w-1 h-10 rounded-full flex-shrink-0',
                        risk.level === 'high'
                          ? 'bg-risk-high'
                          : risk.level === 'medium'
                          ? 'bg-risk-medium'
                          : 'bg-risk-low'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm">
                          {getRiskTypeLabel(risk.type)}
                        </span>
                        <Badge variant="risk" level={risk.level} />
                        {risk.isOverdue && (
                          <span className="px-2 py-0.5 bg-risk-high text-white text-xs font-medium rounded animate-pulse">
                            超时
                          </span>
                        )}
                        {isEscalated && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded flex items-center gap-1">
                            <ShieldAlert size={10} />
                            {risk.escalationLevel === 'manager' ? '值班经理' : '质量安全主管'}
                          </span>
                        )}
                        {risk.sourceWorkCardNo && (
                          <span className="flex items-center gap-1 text-xs text-accent-blue font-mono">
                            <FileText size={10} />
                            {risk.sourceWorkCardNo}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-dashboard-muted">
                        <span>{location?.name || '-'}</span>
                        <span>时限：{risk.releaseDeadline}</span>
                      </div>
                    </div>
                    <Badge status={risk.status} />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDetail(risk.id)}
                    >
                      查看
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
