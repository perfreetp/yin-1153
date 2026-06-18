import { useState, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import {
  getRiskLevelLabel,
  getRiskTypeLabel,
  getStatusLabel,
} from '@/utils/helpers';
import type { HandoverRecord, RiskCardData } from '@/types';
import { cn } from '@/lib/utils';
import {
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  MapPin,
  Users,
  FileText,
  Plus,
  History,
  Clock4,
} from 'lucide-react';

interface HandoverRecordDetailProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
}

type TabType = 'received' | 'unreceived';

export default function HandoverRecordDetail({
  isOpen,
  onClose,
  recordId,
}: HandoverRecordDetailProps) {
  const {
    getHandoverRecordById,
    riskCards,
    supplementaryHandoverReceive,
  } = useRiskStore();

  const [activeTab, setActiveTab] = useState<TabType>('unreceived');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showSupplementary, setShowSupplementary] = useState(false);
  const [supOperator, setSupOperator] = useState('');
  const [supNote, setSupNote] = useState('');
  const [selectedSupIds, setSelectedSupIds] = useState<Set<string>>(new Set());

  const record = recordId ? getHandoverRecordById(recordId) : null;

  const risks = useMemo(() => {
    if (!record) return { received: [], unreceived: [] };
    const allIds = new Set([...record.receivedRiskIds, ...record.unreceivedRiskIds]);
    const riskMap = new Map<string, RiskCardData>();
    riskCards.forEach((r) => {
      if (allIds.has(r.id)) riskMap.set(r.id, r);
    });
    const received = record.receivedRiskIds
      .map((id) => riskMap.get(id))
      .filter(Boolean) as RiskCardData[];
    const unreceived = record.unreceivedRiskIds
      .map((id) => riskMap.get(id))
      .filter(Boolean) as RiskCardData[];
    return { received, unreceived };
  }, [record, riskCards]);

  const teams = useMemo(() => {
    const all = [...risks.received, ...risks.unreceived];
    const set = new Set(all.map((r) => r.team));
    return Array.from(set);
  }, [risks]);

  const locations = useMemo(() => {
    const all = [...risks.received, ...risks.unreceived];
    const set = new Set<string>();
    all.forEach((r) => {
      const loc = LOCATIONS.find((l) => l.id === r.locationId);
      if (loc) set.add(loc.name);
    });
    return Array.from(set);
  }, [risks]);

  const displayRisks = useMemo(() => {
    const list = activeTab === 'received' ? risks.received : risks.unreceived;
    return list.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const typeLabel = getRiskTypeLabel(r.type).toLowerCase();
        const loc = LOCATIONS.find((l) => l.id === r.locationId)?.name || '';
        if (!typeLabel.includes(q) && !r.team.toLowerCase().includes(q) &&
            !loc.toLowerCase().includes(q) && !(r.sourceWorkCardNo?.toLowerCase().includes(q))) {
          return false;
        }
      }
      if (filterTeam !== 'all' && r.team !== filterTeam) return false;
      if (filterLocation !== 'all') {
        const loc = LOCATIONS.find((l) => l.id === r.locationId);
        if (loc?.name !== filterLocation) return false;
      }
      return true;
    }).sort((a, b) => {
      const levelOrder = { high: 0, medium: 1, low: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  }, [risks, activeTab, searchQuery, filterTeam, filterLocation]);

  const handleToggleSelect = (id: string) => {
    setSelectedSupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedSupIds.size === displayRisks.length) {
      setSelectedSupIds(new Set());
    } else {
      setSelectedSupIds(new Set(displayRisks.map((r) => r.id)));
    }
  };

  const handleSupplementary = () => {
    if (!record || selectedSupIds.size === 0 || !supOperator.trim()) return;
    supplementaryHandoverReceive(
      record.id,
      Array.from(selectedSupIds),
      supOperator.trim(),
      supNote.trim() || undefined
    );
    setShowSupplementary(false);
    setSelectedSupIds(new Set());
    setSupOperator('');
    setSupNote('');
  };

  if (!record) return null;

  const totalRisks = record.receivedRiskIds.length + record.unreceivedRiskIds.length;
  const initialReceived = (() => {
    if (!record.supplementaryRecords || record.supplementaryRecords.length === 0) {
      return record.receivedRiskIds.length;
    }
    const totalSupplemented = record.supplementaryRecords.reduce(
      (sum, rec) => sum + rec.riskIds.length,
      0
    );
    return record.receivedRiskIds.length - totalSupplemented;
  })();
  const supplementedCount = record.receivedRiskIds.length - initialReceived;
  const finalReceiveRate = totalRisks > 0 ? Math.round((record.receivedRiskIds.length / totalRisks) * 100) : 0;

  const supplementDuration = (() => {
    if (!record.supplementaryRecords || record.supplementaryRecords.length === 0) return null;
    const lastSup = record.supplementaryRecords[record.supplementaryRecords.length - 1];
    const handoverTime = new Date(record.handoverTime.replace(/-/g, '/')).getTime();
    const lastSupTime = new Date(lastSup.time.replace(/-/g, '/')).getTime();
    const diffMins = Math.round((lastSupTime - handoverTime) / (1000 * 60));
    if (diffMins < 60) return `${diffMins} 分钟`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  })();

  const qualityGrade = (() => {
    if (finalReceiveRate >= 95) return { label: '优秀', color: 'text-risk-low', bg: 'bg-risk-lowBg' };
    if (finalReceiveRate >= 80) return { label: '良好', color: 'text-risk-medium', bg: 'bg-risk-mediumBg' };
    if (finalReceiveRate >= 60) return { label: '一般', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: '需改进', color: 'text-risk-high', bg: 'bg-risk-highBg' };
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="交接记录详情" size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
            <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-1">
              <User size={12} />
              <span>交班人</span>
            </div>
            <div className="text-sm font-semibold text-white">{record.handoverPerson}</div>
          </div>
          <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
            <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-1">
              <User size={12} />
              <span>接班人</span>
            </div>
            <div className="text-sm font-semibold text-white">{record.receiverPerson}</div>
          </div>
          <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
            <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-1">
              <Clock size={12} />
              <span>交接时间</span>
            </div>
            <div className="text-sm font-mono text-white">{record.handoverTime}</div>
          </div>
          <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
            <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-1">
              <CheckCircle2 size={12} />
              <span>状态</span>
            </div>
            <div className="text-sm font-semibold text-risk-low">已确认</div>
          </div>
        </div>

        {record.remarks && (
          <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
            <div className="text-xs text-dashboard-muted mb-1">接班备注</div>
            <p className="text-sm text-dashboard-text">{record.remarks}</p>
          </div>
        )}

        <div className="bg-dashboard-surface rounded-lg p-4 border border-dashboard-border">
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-accent-blue" />
            <h4 className="text-sm font-semibold text-white">交接复盘统计</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
              <div className="text-xs text-dashboard-muted mb-1">最终接收率</div>
              <div className={cn('text-2xl font-bold font-display', qualityGrade.color)}>
                {finalReceiveRate}%
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full mt-1 inline-block', qualityGrade.color, qualityGrade.bg)}>
                {qualityGrade.label}
              </span>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
              <div className="text-xs text-dashboard-muted mb-1">应接总数</div>
              <div className="text-2xl font-bold font-display text-white">{totalRisks}</div>
              <div className="text-xs text-dashboard-muted mt-1">
                项风险
              </div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
              <div className="text-xs text-dashboard-muted mb-1">初始已接收</div>
              <div className="text-xl font-bold font-display text-risk-low">{initialReceived}</div>
              <div className="text-xs text-dashboard-muted mt-1">
                补接收 <span className="text-accent-blue">+{supplementedCount}</span>
              </div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
              <div className="text-xs text-dashboard-muted mb-1">补接收用时</div>
              <div className="text-xl font-bold font-display text-white">
                {supplementDuration || '-'}
              </div>
              <div className="text-xs text-dashboard-muted mt-1">
                共 {record.supplementaryRecords?.length || 0} 次补接收
              </div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
              <div className="text-xs text-dashboard-muted mb-1">未接收剩余</div>
              <div className={cn(
                'text-2xl font-bold font-display',
                record.unreceivedRiskIds.length > 0 ? 'text-risk-high' : 'text-risk-low'
              )}>
                {record.unreceivedRiskIds.length}
              </div>
              <div className="text-xs text-dashboard-muted mt-1">
                项需持续跟进
              </div>
            </div>
          </div>
          {record.unreceivedRiskIds.length > 0 && (
            <div className="mt-3 flex items-start gap-2 p-2.5 bg-risk-highBg/15 rounded-lg text-xs text-risk-high">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                {record.unreceivedRiskIds.length} 项风险仍未接收，需值班经理协调跟进闭环，明确责任人和完成时限
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-dashboard-card rounded-lg border border-dashboard-border">
            <button
              onClick={() => setActiveTab('unreceived')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                activeTab === 'unreceived'
                  ? 'bg-risk-highBg text-risk-high'
                  : 'text-dashboard-muted hover:text-white'
              )}
            >
              <XCircle size={14} />
              未接收 ({record.unreceivedRiskIds.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                activeTab === 'received'
                  ? 'bg-risk-lowBg text-risk-low'
                  : 'text-dashboard-muted hover:text-white'
              )}
            >
              <CheckCircle2 size={14} />
              已接收 ({record.receivedRiskIds.length})
            </button>
          </div>

          {activeTab === 'unreceived' && record.unreceivedRiskIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowSupplementary(!showSupplementary);
                if (showSupplementary) {
                  setSelectedSupIds(new Set());
                }
              }}
            >
              <Plus size={14} />
              <span>补接收</span>
            </Button>
          )}
        </div>

        {showSupplementary && activeTab === 'unreceived' && (
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2 text-sm text-accent-blue">
              <Plus size={16} />
              <span className="font-medium">补接收确认</span>
              <span className="text-xs text-dashboard-muted">
                （选中未接收项，标记为已补接收）
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="操作人姓名"
                value={supOperator}
                onChange={(e) => setSupOperator(e.target.value)}
                className="input-field text-sm py-1.5"
              />
              <input
                type="text"
                placeholder="补接收说明（可选）"
                value={supNote}
                onChange={(e) => setSupNote(e.target.value)}
                className="input-field text-sm py-1.5"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dashboard-muted">
                已选 {selectedSupIds.size} / {displayRisks.length} 项
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowSupplementary(false)}>
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleSupplementary}
                  disabled={selectedSupIds.size === 0 || !supOperator.trim()}
                >
                  <CheckCircle2 size={14} />
                  <span>确认补接收</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-muted" />
            <input
              type="text"
              placeholder="搜索风险类型、班组、位置、工卡..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-8 py-1.5 text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-dashboard-muted" />
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="input-field py-1.5 text-sm w-auto"
            >
              <option value="all">全部班组</option>
              {teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="input-field py-1.5 text-sm w-auto"
            >
              <option value="all">全部位置</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {showSupplementary && activeTab === 'unreceived' && displayRisks.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleSelectAll}
              className="text-accent-blue hover:text-accent-blue/80"
            >
              {selectedSupIds.size === displayRisks.length ? '取消全选' : '全选'}
            </button>
          </div>
        )}

        <div className="bg-dashboard-surface border border-dashboard-border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
          {displayRisks.length === 0 ? (
            <div className="py-12 text-center text-dashboard-muted text-sm">
              暂无{activeTab === 'received' ? '已接收' : '未接收'}风险
            </div>
          ) : (
            <div className="divide-y divide-dashboard-border/50">
              {displayRisks.map((risk) => {
                const location = LOCATIONS.find((l) => l.id === risk.locationId);
                const isSelected = selectedSupIds.has(risk.id);
                return (
                  <div
                    key={risk.id}
                    className={cn(
                      'p-3 flex items-center gap-3 transition-colors',
                      showSupplementary && activeTab === 'unreceived' && 'cursor-pointer hover:bg-dashboard-card/50',
                      isSelected && 'bg-accent-blue/10'
                    )}
                    onClick={() => {
                      if (showSupplementary && activeTab === 'unreceived') {
                        handleToggleSelect(risk.id);
                      }
                    }}
                  >
                    {showSupplementary && activeTab === 'unreceived' && (
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                          isSelected ? 'bg-accent-blue border-accent-blue' : 'border-dashboard-muted'
                        )}
                      >
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    )}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
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
                        <Badge variant="risk" level={risk.level} size="sm">
                          {getRiskLevelLabel(risk.level)}
                        </Badge>
                        <Badge status={risk.status} size="sm" />
                        {risk.isOverdue && (
                          <span className="px-1.5 py-0.5 bg-risk-high text-white text-[10px] font-medium rounded">
                            超时
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-dashboard-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {risk.team}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {location?.name || '-'}
                        </span>
                        {risk.sourceWorkCardNo && (
                          <span className="flex items-center gap-1 text-accent-blue font-mono">
                            <FileText size={10} />
                            {risk.sourceWorkCardNo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-dashboard-muted">放行时限</div>
                      <div className={cn(
                        'text-sm font-mono',
                        risk.isOverdue ? 'text-risk-high font-semibold' : 'text-dashboard-text'
                      )}>
                        {risk.releaseDeadline}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {record.supplementaryRecords && record.supplementaryRecords.length > 0 && (
          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-dashboard-muted" />
              <h4 className="text-sm font-semibold text-white">补接收记录</h4>
            </div>
            <div className="space-y-2">
              {record.supplementaryRecords.slice().reverse().map((sup) => (
                <div
                  key={sup.id}
                  className="flex items-start gap-3 p-2.5 bg-dashboard-bg rounded-lg border border-dashboard-border/50"
                >
                  <Clock4 className="w-4 h-4 text-risk-low flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{sup.operator}</span>
                      <span className="text-xs text-dashboard-muted">补接收了</span>
                      <span className="text-sm font-semibold text-risk-low">{sup.riskIds.length} 项风险</span>
                    </div>
                    {sup.note && (
                      <p className="text-xs text-dashboard-muted mt-0.5">{sup.note}</p>
                    )}
                  </div>
                  <span className="text-xs text-dashboard-muted font-mono flex-shrink-0">
                    {sup.time}
                  </span>
                </div>
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
