import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import RiskTrackingList from '@/components/tracking/RiskTrackingList';
import TrackingForm from '@/components/tracking/TrackingForm';
import HandoverView from '@/components/tracking/HandoverView';
import HandoverConfirmModal from '@/components/tracking/HandoverConfirmModal';
import HandoverRecordDetail from '@/components/tracking/HandoverRecordDetail';
import RiskDetailModal from '@/components/dashboard/RiskDetailModal';
import WorkCardDetailModal from '@/components/preshift/WorkCardDetailModal';
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
  ShieldAlert,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import type { RiskCardData } from '@/types';
import { getRiskTypeLabel, getRiskLevelColor } from '@/utils/helpers';
import { LOCATIONS } from '@/data/mockData';

type ViewMode = 'list' | 'handover';
type ExportMode = 'standard' | 'review';

export default function Tracking() {
  const navigate = useNavigate();
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
  const [isWorkCardOpen, setIsWorkCardOpen] = useState(false);
  const [reviewWorkCardFormId, setReviewWorkCardFormId] = useState<string | null>(null);
  const { generateHandoverText, generateReviewHandoverText, getHandoverRecords, getReviewData, getRecordsByRiskId, getMeasuresByRiskId, openRiskDetail, closeRiskDetail, selectedRiskId: storeSelectedRiskId, isDetailModalOpen: storeIsDetailOpen } = useRiskStore();

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
  const reviewData = getReviewData();

  const handleReviewRiskClick = (riskId: string) => {
    openRiskDetail(riskId);
  };

  const handleViewWorkCard = (formId: string) => {
    setReviewWorkCardFormId(formId);
    setIsWorkCardOpen(true);
  };

  const handleGoToProcessing = (riskId: string) => {
    closeRiskDetail();
    setIsExportModalOpen(false);
    setSelectedRiskId(riskId);
    setIsFormOpen(true);
  };

  const RiskReviewCard = ({ risk, showEscalation = false }: { risk: RiskCardData; showEscalation?: boolean }) => {
    const loc = LOCATIONS.find((l) => l.id === risk.locationId);
    const colors = getRiskLevelColor(risk.level);
    const records = getRecordsByRiskId(risk.id);
    const measures = getMeasuresByRiskId(risk.id);
    const unclosedMeasures = measures.filter(m => !m.isClosed);
    const escLabel = risk.escalationLevel === 'manager' ? '值班经理' :
      risk.escalationLevel === 'director' ? '质量安全主管' : '';

    return (
      <div
        onClick={() => handleReviewRiskClick(risk.id)}
        className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border hover:border-accent-blue/50 hover:bg-dashboard-card/80 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="risk" level={risk.level} size="sm" />
              <Badge status={risk.status} size="sm" />
              {risk.isOverdue && (
                <span className="px-1.5 py-0.5 bg-risk-high text-white text-[10px font-medium rounded-full">
                  已超时
                </span>
              )}
              {risk.escalationLevel && risk.escalationLevel !== 'none' && (
                <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                  <ShieldAlert size={10} />
                  {escLabel}
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-white mb-1.5">
              {getRiskTypeLabel(risk.type)}
              {risk.aircraftNo && <span className="text-dashboard-muted ml-2">· {risk.aircraftNo}</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-dashboard-muted flex-wrap">
              <span>{loc?.name || '-'}</span>
              <span className="font-mono">{risk.releaseDeadline}</span>
              {risk.sourceWorkCardNo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (risk.sourceFormId) handleViewWorkCard(risk.sourceFormId);
                  }}
                  className="text-accent-blue hover:text-accent-blue/80 hover:underline flex items-center gap-0.5"
                >
                  <FileText size={10} />
                  {risk.sourceWorkCardNo}
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
            {risk.team && (
              <div className="text-xs text-dashboard-muted mt-1">
                责任班组：{risk.team}
              </div>
            )}
            {showEscalation && risk.escalationAssignee && (
              <div className="mt-2 pt-2 border-t border-dashboard-border/50 text-xs">
                <div className="text-orange-400 font-medium flex items-center gap-1">
                  <ShieldAlert size={12} />
                  {escLabel}跟进：{risk.escalationAssignee}
                  {risk.escalatedAt && <span className="text-dashboard-muted ml-2">{risk.escalatedAt}</span>}
                </div>
              </div>
            )}
            {records.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashboard-border/50">
                <div className="text-xs text-dashboard-muted mb-1">
                  处理记录 ({records.length})
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {records.slice(0, 2).map(rec => (
                    <div key={rec.id} className="text-xs text-dashboard-text/80 truncate">
                  <span className="text-accent-blue">{rec.handler}</span>：{rec.reviewResult}
                  <span className="text-dashboard-muted ml-2">({rec.handledAt})</span>
                </div>
                  ))}
                  {records.length > 2 && (
                    <div className="text-xs text-dashboard-muted">
                    ...还有 {records.length - 2} 条记录
                  </div>
                  )}
                </div>
              </div>
            )}
            {unclosedMeasures.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashboard-border/50">
                <div className="text-xs text-risk-high mb-1">
                  未关闭措施 ({unclosedMeasures.length})
                </div>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {unclosedMeasures.map(m => (
                    <div key={m.id} className="text-xs text-risk-high/80 flex items-start gap-1">
                      <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
                      <span className="truncate">{m.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoToProcessing(risk.id);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent-blue/10 text-accent-blue rounded-md hover:bg-accent-blue/20 transition-colors"
            >
              去处理
              <ChevronRight size={12} />
            </button>
            <ChevronRight size={16} className="text-dashboard-muted group-hover:text-accent-blue transition-colors" />
          </div>
        </div>
      </div>
    );
  };

  const ReviewSection = ({
    title,
    icon: Icon,
    risks,
    showEscalation = false,
    emptyText
  }: {
    title: string;
    icon: any;
    risks: RiskCardData[];
    showEscalation?: boolean;
    emptyText?: string;
  }) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-accent-blue" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className="px-2 py-0.5 bg-dashboard-border text-dashboard-muted text-xs rounded-full">
          {risks.length} 项
        </span>
      </div>
      {risks.length === 0 ? (
        <div className="text-sm text-dashboard-muted text-center py-6 bg-dashboard-bg/50 rounded-lg border border-dashed border-dashboard-border">
          {emptyText || '暂无数据'}
        </div>
      ) : (
        <div className="space-y-2">
          {risks.map((r) => (
            <RiskReviewCard key={r.id} risk={r} showEscalation={showEscalation} />
          ))}
        </div>
      )}
    </div>
  );

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
            {exportMode === 'review' ? (
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
                    <div className="text-xs text-dashboard-muted mb-1">风险总数</div>
                    <div className="text-2xl font-bold font-display text-white">{reviewData.overview.total}</div>
                  </div>
                  <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
                    <div className="text-xs text-dashboard-muted mb-1">未闭环</div>
                    <div className="text-2xl font-bold font-display text-risk-high">
                      {reviewData.overview.open + reviewData.overview.processing}
                    </div>
                  </div>
                  <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
                    <div className="text-xs text-dashboard-muted mb-1">已升级</div>
                    <div className="text-2xl font-bold font-display text-orange-400">{reviewData.overview.escalated}</div>
                  </div>
                  <div className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border">
                    <div className="text-xs text-dashboard-muted mb-1">已超时</div>
                    <div className="text-2xl font-bold font-display text-risk-high">{reviewData.overview.overdue}</div>
                  </div>
                </div>

                <div className="bg-dashboard-surface rounded-lg p-3 border border-accent-blue/30 mb-6">
                  <div className="text-sm font-medium text-accent-blue mb-2 flex items-center gap-2">
                    <BarChart3 size={14} />
                    晨会要点
                  </div>
                  <div className="text-sm text-dashboard-text">
                    高风险 <span className="text-risk-high font-bold">{reviewData.overview.high}</span> 项
                    · 升级 <span className="text-orange-400 font-bold">{reviewData.overview.escalated}</span> 项
                    · 超时 <span className="text-risk-high font-bold">{reviewData.overview.overdue}</span> 项
                    · 新转入 <span className="text-accent-blue font-bold">{reviewData.overview.newPromoted}</span> 项
                    · 已闭环 <span className="text-risk-low font-bold">{reviewData.overview.todayClosed}</span> 项
                  </div>
                </div>

                <ReviewSection
                  title="⬆ 责任升级项（需重点关注）"
                  icon={ShieldAlert}
                  risks={reviewData.escalatedRisks}
                  showEscalation={true}
                  emptyText="暂无升级项，所有风险均在正常处理时效内"
                />
                <ReviewSection
                  title="📋 上一班未接收项（需跟进）"
                  icon={ListTodo}
                  risks={reviewData.unreceivedFromLast}
                  emptyText="上一班所有风险均已接收，无遗留"
                />
                <ReviewSection
                  title="⚠ 超时风险项"
                  icon={AlertTriangle}
                  risks={reviewData.overdueRisks}
                  emptyText="暂无超时风险"
                />
                <ReviewSection
                  title="🆕 当班新转入风险"
                  icon={PlusCircle}
                  risks={reviewData.newPromotedRisks}
                  emptyText="当班暂无新转入风险"
                />
                <ReviewSection
                  title="✅ 当班已闭环风险"
                  icon={CheckCircle2}
                  risks={reviewData.todayClosedRisks}
                  emptyText="当班暂无已闭环风险"
                />
              </div>
            ) : (
              <pre className="bg-dashboard-bg border border-dashboard-border rounded-lg p-4 text-sm text-dashboard-text font-mono whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-auto">
                {handoverText}
              </pre>
            )}
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

      <RiskDetailModal />

      <WorkCardDetailModal
        isOpen={isWorkCardOpen}
        onClose={() => setIsWorkCardOpen(false)}
        formId={reviewWorkCardFormId}
        onGoToTracking={() => {
          setIsWorkCardOpen(false);
          setIsExportModalOpen(false);
        }}
      />
    </div>
  );
}
