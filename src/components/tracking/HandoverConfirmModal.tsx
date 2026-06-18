import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import { getRiskTypeLabel } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  User,
  Users,
  FileText,
  ClipboardCheck,
  Info,
} from 'lucide-react';

interface HandoverConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed?: (recordId: string) => void;
}

export default function HandoverConfirmModal({
  isOpen,
  onClose,
  onConfirmed,
}: HandoverConfirmModalProps) {
  const { getFilteredRiskCards, confirmHandover } = useRiskStore();

  const [handoverPerson, setHandoverPerson] = useState('值班经理-张工');
  const [receiverPerson, setReceiverPerson] = useState('');
  const [receivedIds, setReceivedIds] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const openRisks = getFilteredRiskCards().filter((r) => r.status !== 'closed');

  useEffect(() => {
    if (isOpen) {
      setReceivedIds(openRisks.map((r) => r.id));
      setRemarks('');
      setConfirmedId(null);
      setReceiverPerson('');
    }
  }, [isOpen]);

  const toggleReceived = (riskId: string) => {
    setReceivedIds((prev) =>
      prev.includes(riskId) ? prev.filter((id) => id !== riskId) : [...prev, riskId]
    );
  };

  const allChecked = openRisks.length > 0 && receivedIds.length === openRisks.length;
  const unreceivedCount = openRisks.length - receivedIds.length;

  const handleConfirm = () => {
    if (!receiverPerson.trim()) return;
    const recordId = confirmHandover({
      handoverPerson,
      receiverPerson: receiverPerson.trim(),
      receivedRiskIds: receivedIds,
      remarks: remarks.trim(),
    });
    setConfirmedId(recordId);
    if (onConfirmed) onConfirmed(recordId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="接班确认" size="lg">
      {confirmedId ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-risk-lowBg/20 border border-risk-low/30 rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-risk-low flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">交接确认已完成</p>
              <p className="text-sm text-dashboard-muted mt-0.5">
                交接记录已保存，可刷新页面后继续查看
              </p>
            </div>
          </div>

          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-dashboard-muted text-xs mb-1">交班人</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <User size={14} className="text-dashboard-muted" />
                  {handoverPerson}
                </div>
              </div>
              <div>
                <div className="text-dashboard-muted text-xs mb-1">接班人</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <User size={14} className="text-dashboard-muted" />
                  {receiverPerson}
                </div>
              </div>
              <div>
                <div className="text-dashboard-muted text-xs mb-1">交接时间</div>
                <div className="text-white font-mono text-sm">
                  {new Date().toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <div className="text-dashboard-muted text-xs mb-1">已接收 / 未接收</div>
                <div className="flex items-center gap-3">
                  <span className="text-risk-low font-mono font-bold">{receivedIds.length}</span>
                  <span className="text-dashboard-muted">/</span>
                  <span className={cn('font-mono font-bold', unreceivedCount > 0 ? 'text-risk-high' : 'text-risk-low')}>
                    {unreceivedCount}
                  </span>
                </div>
              </div>
            </div>
            {remarks.trim() && (
              <div className="pt-3 border-t border-dashboard-border">
                <div className="text-dashboard-muted text-xs mb-1">接班备注</div>
                <p className="text-sm text-dashboard-text">{remarks}</p>
              </div>
            )}
          </div>

          {unreceivedCount > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-risk-high" />
                未接收风险项（需重点跟进）
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {openRisks
                  .filter((r) => !receivedIds.includes(r.id))
                  .map((risk) => {
                    const location = LOCATIONS.find((l) => l.id === risk.locationId);
                    return (
                      <div
                        key={risk.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-risk-highBg/20 border border-risk-high/30"
                      >
                        <div className="w-1 h-8 rounded-full bg-risk-high flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">
                              {getRiskTypeLabel(risk.type)}
                            </span>
                            <Badge variant="risk" level={risk.level} />
                            {risk.sourceWorkCardNo && (
                              <span className="text-xs text-accent-blue font-mono flex items-center gap-1">
                                <FileText size={10} />
                                {risk.sourceWorkCardNo}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-dashboard-muted mt-0.5">
                            {location?.name} · {risk.team}
                          </div>
                        </div>
                        <Badge status={risk.status} />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-dashboard-border">
            <Button onClick={onClose}>完成</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
            <Info className="w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-dashboard-text">
              接班人逐项确认已接收的风险，未勾选项将记为"未接收"并重点跟进。确认后生成交接记录，包含交班人、接班人、交接时间与未接收项。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <User size={14} className="text-accent-blue" />
                交班人
              </label>
              <input
                type="text"
                value={handoverPerson}
                onChange={(e) => setHandoverPerson(e.target.value)}
                className="input-field text-sm py-1.5"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <User size={14} className="text-accent-blue" />
                接班人 <span className="text-risk-high">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入接班人姓名"
                value={receiverPerson}
                onChange={(e) => setReceiverPerson(e.target.value)}
                className={cn(
                  'input-field text-sm py-1.5',
                  !receiverPerson.trim() && 'border-risk-high/50'
                )}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text">
                <ClipboardCheck size={14} className="text-accent-blue" />
                风险项接收确认
                <span className="text-xs text-dashboard-muted font-normal">
                  （当前筛选范围内未闭环风险 {openRisks.length} 项）
                </span>
              </label>
              <button
                onClick={() =>
                  setReceivedIds(allChecked ? [] : openRisks.map((r) => r.id))
                }
                className="text-xs text-accent-blue hover:text-accent-blue/80"
              >
                {allChecked ? '取消全选' : '全部接收'}
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {openRisks.length === 0 ? (
                <div className="py-8 text-center text-dashboard-muted text-sm">
                  当前筛选范围无未闭环风险，可直接确认交接
                </div>
              ) : (
                openRisks.map((risk) => {
                  const location = LOCATIONS.find((l) => l.id === risk.locationId);
                  const checked = receivedIds.includes(risk.id);
                  return (
                    <button
                      key={risk.id}
                      onClick={() => toggleReceived(risk.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left',
                        checked
                          ? 'bg-risk-lowBg/20 border-risk-low/30'
                          : 'bg-risk-highBg/15 border-risk-high/30'
                      )}
                    >
                      {checked ? (
                        <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-risk-high flex-shrink-0" />
                      )}
                      <div
                        className={cn(
                          'w-1 h-8 rounded-full flex-shrink-0',
                          risk.level === 'high'
                            ? 'bg-risk-high'
                            : risk.level === 'medium'
                            ? 'bg-risk-medium'
                            : 'bg-risk-low'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">
                            {getRiskTypeLabel(risk.type)}
                          </span>
                          <Badge variant="risk" level={risk.level} />
                          {risk.isOverdue && (
                            <span className="px-1.5 py-0.5 bg-risk-high text-white text-xs rounded">
                              超时
                            </span>
                          )}
                          {risk.sourceWorkCardNo && (
                            <span className="text-xs text-accent-blue font-mono flex items-center gap-1">
                              <FileText size={10} />
                              {risk.sourceWorkCardNo}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-dashboard-muted mt-0.5 flex items-center gap-2">
                          <Users size={10} />
                          {risk.team}
                          <span>·</span>
                          {location?.name}
                        </div>
                      </div>
                      <Badge status={risk.status} />
                    </button>
                  );
                })
              )}
            </div>
            {unreceivedCount > 0 && (
              <p className="text-xs text-risk-high mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                {unreceivedCount} 项未接收，将记入未接收清单重点跟进
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
              <FileText size={14} className="text-accent-blue" />
              接班备注
            </label>
            <textarea
              rows={2}
              placeholder="补充交接说明、特别关注事项..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field resize-none text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashboard-border">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!receiverPerson.trim()}
            >
              <ClipboardCheck size={16} />
              <span>确认交接</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
