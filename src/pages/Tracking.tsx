import { useState } from 'react';
import Header from '@/components/layout/Header';
import RiskTrackingList from '@/components/tracking/RiskTrackingList';
import TrackingForm from '@/components/tracking/TrackingForm';
import HandoverView from '@/components/tracking/HandoverView';
import HandoverConfirmModal from '@/components/tracking/HandoverConfirmModal';
import HandoverRecordDetail from '@/components/tracking/HandoverRecordDetail';
import { useRiskStore } from '@/store/useRiskStore';
import {
  ClipboardList,
  Users,
  Download,
  Copy,
  Check,
  ClipboardCheck,
  History,
  User,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileText,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

type ViewMode = 'list' | 'handover';
type ExportMode = 'standard' | 'review';

export default function Tracking() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<ExportMode>('standard');
  const [copied, setCopied] = useState(false);
  const { generateHandoverText, generateReviewHandoverText, getHandoverRecords } = useRiskStore();

  const handleSelectRisk = (riskId: string) => {
    setSelectedRiskId(riskId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRiskId(null);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    const text = exportMode === 'review' ? generateReviewHandoverText() : generateHandoverText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleViewRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsRecordDetailOpen(true);
  };

  const handoverText = generateHandoverText();
  const reviewText = generateReviewHandoverText();
  const handoverRecords = getHandoverRecords(true);

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <main className="p-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-white mb-1">闭环跟踪</h1>
            <p className="text-sm text-dashboard-muted">
              安全员对每条风险填写现场照片、整改意见和复核结果，超时未处理项自动置顶
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {handoverRecords.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setIsHistoryOpen(true)}>
                <History size={16} />
                <span>交接记录 ({handoverRecords.length})</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsConfirmModalOpen(true)}>
              <ClipboardCheck size={16} />
              <span>接班确认</span>
            </Button>
            <div className="flex items-center gap-1 p-1 bg-dashboard-surface rounded-lg border border-dashboard-border">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/30'
                    : 'text-dashboard-muted hover:text-white'
                )}
              >
                <ClipboardList size={16} />
                <span>列表视图</span>
              </button>
              <button
                onClick={() => setViewMode('handover')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'handover'
                    ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/30'
                    : 'text-dashboard-muted hover:text-white'
                )}
              >
                <Users size={16} />
                <span>交接班视图</span>
              </button>
            </div>

            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} />
              <span>导出交接单</span>
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <RiskTrackingList onSelectRisk={handleSelectRisk} />
        ) : (
          <HandoverView onExport={handleExport} />
        )}
      </main>

      <TrackingForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        riskId={selectedRiskId}
      />

      <HandoverConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      />

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="导出交接单"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 p-1 bg-dashboard-card rounded-lg border border-dashboard-border">
              <button
                onClick={() => setExportMode('standard')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  exportMode === 'standard'
                    ? 'bg-accent-blue text-white'
                    : 'text-dashboard-muted hover:text-white'
                )}
              >
                <FileText size={14} />
                标准版
              </button>
              <button
                onClick={() => setExportMode('review')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  exportMode === 'review'
                    ? 'bg-accent-blue text-white'
                    : 'text-dashboard-muted hover:text-white'
                )}
              >
                <BarChart3 size={14} />
                复盘版
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={16} />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>复制全部</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-dashboard-muted">
            {exportMode === 'review'
              ? '复盘版包含总体概览、升级项、超时项、当班新转入、当班已闭环、未接收项，适合晨会直接使用'
              : '标准版侧重未闭环风险交接清单，适合交接班直接用于日常交接班使用'
            }
          </p>
          <div className="relative">
            <pre className="bg-dashboard-bg border border-dashboard-border rounded-lg p-4 text-sm text-dashboard-text font-mono whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-auto">
              {exportMode === 'review' ? reviewText : handoverText}
            </pre>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(true)}>
              <ClipboardCheck size={16} />
              <span>接班确认</span>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
                关闭
              </Button>
              <Button onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? '已复制到剪贴板' : '复制到剪贴板'}</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="交接确认记录"
        size="lg"
      >
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {handoverRecords.length === 0 ? (
            <div className="py-12 text-center text-dashboard-muted text-sm">
              暂无交接记录，完成接班确认后将在此显示
            </div>
          ) : (
            handoverRecords
              .slice()
              .reverse()
              .map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handleViewRecord(rec.id)}
                  className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border cursor-pointer hover:border-accent-blue/50 hover:bg-dashboard-card/80 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-risk-low" />
                      <span className="text-sm font-semibold text-white">交接确认</span>
                      <span className="px-2 py-0.5 bg-risk-lowBg text-risk-low text-xs rounded-full">
                        已确认
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-dashboard-muted">
                        <Clock size={12} />
                        <span className="font-mono">{rec.handoverTime}</span>
                      </div>
                      <ChevronRight size={14} className="text-dashboard-muted group-hover:text-accent-blue transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-dashboard-muted" />
                      <div>
                        <div className="text-xs text-dashboard-muted">交班人</div>
                        <div className="text-white font-medium">{rec.handoverPerson}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-dashboard-muted" />
                      <div>
                        <div className="text-xs text-dashboard-muted">接班人</div>
                        <div className="text-white font-medium">{rec.receiverPerson}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-dashboard-muted">已接收</div>
                        <div className="text-risk-low font-mono font-bold">{rec.receivedRiskIds.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-dashboard-muted">未接收</div>
                        <div className={cn('font-mono font-bold', rec.unreceivedRiskIds.length > 0 ? 'text-risk-high' : 'text-risk-low')}>
                          {rec.unreceivedRiskIds.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  {rec.unreceivedRiskIds.length > 0 && (
                    <div className="flex items-start gap-2 p-2.5 bg-risk-highBg/15 rounded-lg text-xs text-risk-high">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        {rec.unreceivedRiskIds.length} 项风险未接收，需接班人重点跟进闭环
                      </span>
                    </div>
                  )}
                  {rec.remarks && (
                    <div className="mt-2 pt-2 border-t border-dashboard-border">
                      <div className="text-xs text-dashboard-muted mb-0.5">接班备注</div>
                      <p className="text-sm text-dashboard-text line-clamp-2">{rec.remarks}</p>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </Modal>

      <HandoverRecordDetail
        isOpen={isRecordDetailOpen}
        onClose={() => setIsRecordDetailOpen(false)}
        recordId={selectedRecordId}
      />
    </div>
  );
}
