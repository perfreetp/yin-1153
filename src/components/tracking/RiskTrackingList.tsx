import { useState } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import {
  getRiskLevelColor,
  getRiskLevelLabel,
  getRiskTypeLabel,
  getStatusLabel,
} from '@/utils/helpers';
import type { RiskStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Filter,
  Clock,
  Users,
  MapPin,
  Camera,
  FileText,
  CheckCircle2,
  ChevronDown,
  Search,
  ShieldAlert,
  Circle,
  PlayCircle,
} from 'lucide-react';

interface RiskTrackingListProps {
  onSelectRisk: (riskId: string) => void;
}

const statusFilters: Array<{ value: RiskStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'open', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'closed', label: '已闭环' },
];

export default function RiskTrackingList({ onSelectRisk }: RiskTrackingListProps) {
  const { riskCards, updateRiskStatus } = useRiskStore();
  const [statusFilter, setStatusFilter] = useState<RiskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'overdue' | 'level' | 'time'>('overdue');
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const filteredRisks = riskCards
    .filter((r) => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'overdue') {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      }
      if (sortBy === 'level') {
        const levelOrder = { high: 0, medium: 1, low: 2 };
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: riskCards.length,
    open: riskCards.filter((r) => r.status === 'open').length,
    processing: riskCards.filter((r) => r.status === 'processing').length,
    closed: riskCards.filter((r) => r.status === 'closed').length,
    overdue: riskCards.filter((r) => r.isOverdue).length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="风险总数"
          value={stats.total}
          icon={AlertTriangle}
          color="text-accent-blue"
          bgColor="bg-accent-blue/15"
        />
        <StatCard
          label="待处理"
          value={stats.open}
          icon={Clock}
          color="text-risk-high"
          bgColor="bg-risk-highBg"
          highlight={stats.open > 0}
        />
        <StatCard
          label="处理中"
          value={stats.processing}
          icon={FileText}
          color="text-risk-medium"
          bgColor="bg-risk-mediumBg"
        />
        <StatCard
          label="已闭环"
          value={stats.closed}
          icon={CheckCircle2}
          color="text-risk-low"
          bgColor="bg-risk-lowBg"
        />
        <StatCard
          label="已超时"
          value={stats.overdue}
          icon={AlertTriangle}
          color="text-risk-high"
          bgColor="bg-risk-highBg"
          highlight={stats.overdue > 0}
        />
      </div>

      <div className="bg-dashboard-surface border border-dashboard-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dashboard-border flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold font-display text-white">风险处理列表</h2>
            <div className="flex items-center gap-1 p-1 bg-dashboard-card rounded-lg border border-dashboard-border">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    statusFilter === f.value
                      ? 'bg-accent-blue text-white'
                      : 'text-dashboard-muted hover:text-white'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-muted" />
              <input
                type="text"
                placeholder="搜索风险项..."
                className="input-field pl-9 w-56 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dashboard-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'overdue' | 'level' | 'time')}
                className="input-field py-2 w-auto"
              >
                <option value="overdue">按超时排序</option>
                <option value="level">按等级排序</option>
                <option value="time">按时间排序</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dashboard-card/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  风险类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  位置
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  责任班组
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  来源工卡
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  放行时限
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dashboard-muted uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashboard-border/50">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-dashboard-muted">
                    暂无符合条件的风险项
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const location = LOCATIONS.find((l) => l.id === risk.locationId);
                  const colors = getRiskLevelColor(risk.level);
                  const isEscalated = risk.escalationLevel && risk.escalationLevel !== 'none';
                  return (
                    <tr
                      key={risk.id}
                      className={cn(
                        'transition-colors hover:bg-dashboard-card/30',
                        risk.isOverdue && 'bg-risk-high/5'
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              colors.bg
                            )}
                          >
                            <AlertTriangle className={cn('w-5 h-5', colors.text)} />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {getRiskTypeLabel(risk.type)}
                            </div>
                            <div className="text-xs text-dashboard-muted font-mono">
                              {risk.aircraftNo || '-'}
                            </div>
                          </div>
                          {risk.isOverdue && (
                            <span className="px-2 py-0.5 bg-risk-high text-white text-xs font-medium rounded-full animate-pulse">
                              超时
                            </span>
                          )}
                          {isEscalated && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                              <ShieldAlert size={10} />
                              {risk.escalationLevel === 'manager' ? '值班经理' : '质量安全主管'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="risk" level={risk.level}>
                          {getRiskLevelLabel(risk.level)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-dashboard-text">
                          <MapPin className="w-4 h-4 text-dashboard-muted" />
                          {location?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-dashboard-text">
                          <Users className="w-4 h-4 text-dashboard-muted" />
                          {risk.team}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {risk.sourceWorkCardNo ? (
                          <span className="flex items-center gap-1.5 text-sm text-accent-blue font-mono">
                            <FileText className="w-3.5 h-3.5" />
                            {risk.sourceWorkCardNo}
                          </span>
                        ) : (
                          <span className="text-sm text-dashboard-muted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-sm font-mono',
                            risk.isOverdue ? 'text-risk-high font-semibold' : 'text-dashboard-text'
                          )}
                        >
                          {risk.releaseDeadline}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge status={risk.status} />
                          {risk.status !== 'closed' && (
                            <button
                              onClick={() =>
                                setShowStatusMenu(showStatusMenu === risk.id ? null : risk.id)
                              }
                              className="text-dashboard-muted hover:text-white transition-colors"
                              title="切换状态"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}
                          {showStatusMenu === risk.id && risk.status !== 'closed' && (
                            <div className="relative">
                              <div className="absolute right-0 top-full mt-1 z-20 bg-dashboard-card border border-dashboard-border rounded-lg shadow-lg py-1 min-w-32">
                                {(['open', 'processing'] as RiskStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      updateRiskStatus(risk.id, s);
                                      setShowStatusMenu(null);
                                    }}
                                    className={cn(
                                      'w-full text-left px-3 py-2 text-sm hover:bg-dashboard-border transition-colors flex items-center gap-2',
                                      risk.status === s
                                        ? 'text-accent-blue font-medium'
                                        : 'text-dashboard-text'
                                    )}
                                  >
                                    {s === 'open' && <Circle size={12} className="text-risk-high" />}
                                    {s === 'processing' && <PlayCircle size={12} className="text-risk-medium" />}
                                    {getStatusLabel(s)}
                                  </button>
                                ))}
                                <div className="border-t border-dashboard-border my-1" />
                                <div className="px-3 py-2 text-xs text-dashboard-muted">
                                  需通过处理表单提交合格复核后闭环
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => onSelectRisk(risk.id)}>
                            <Camera size={14} />
                            <span>处理</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
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
