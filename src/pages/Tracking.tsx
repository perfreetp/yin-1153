import { useState } from 'react';
import Header from '@/components/layout/Header';
import RiskTrackingList from '@/components/tracking/RiskTrackingList';
import TrackingForm from '@/components/tracking/TrackingForm';
import HandoverView from '@/components/tracking/HandoverView';
import { useRiskStore } from '@/store/useRiskStore';
import { ClipboardList, Users, Download, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

type ViewMode = 'list' | 'handover';

export default function Tracking() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateHandoverText } = useRiskStore();

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
    const text = generateHandoverText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handoverText = generateHandoverText();

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

          <div className="flex items-center gap-3">
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

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="导出交接单"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dashboard-muted">
              以下为当前筛选范围的交接单文本，可复制后粘贴到交接系统或邮件中
            </p>
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
          <div className="relative">
            <pre className="bg-dashboard-bg border border-dashboard-border rounded-lg p-4 text-sm text-dashboard-text font-mono whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-auto">
              {handoverText}
            </pre>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
              关闭
            </Button>
            <Button onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '已复制到剪贴板' : '复制到剪贴板'}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
