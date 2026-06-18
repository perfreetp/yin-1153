import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore, isReviewQualified } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import { getRiskLevelLabel, getRiskTypeLabel, getStatusLabel } from '@/utils/helpers';
import type { EscalationLevel } from '@/types';
import {
  Camera,
  FileText,
  CheckCircle2,
  Upload,
  X,
  Image,
  AlertTriangle,
  User,
  Clock,
  ArrowRight,
  PlayCircle,
  CheckSquare,
  ShieldAlert,
  TrendingUp,
  Info,
  UserPlus,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingFormProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string | null;
}

const REVIEW_OPTIONS = [
  { value: '整改合格', closeable: true },
  { value: '基本合格需跟进', closeable: true },
  { value: '不合格需重新整改', closeable: false },
  { value: '待进一步验证', closeable: false },
];

const ESCALATION_TARGETS: Array<{ level: EscalationLevel; label: string; desc: string }> = [
  { level: 'manager', label: '升级至值班经理', desc: '超时2小时以上，需值班经理介入协调' },
  { level: 'director', label: '升级至质量安全主管', desc: '超时4小时以上，需质量安全主管督办' },
];

export default function TrackingForm({ isOpen, onClose, riskId }: TrackingFormProps) {
  const {
    riskCards,
    submitTracking,
    escalateRisk,
    reassignEscalation,
    getRecordsByRiskId,
  } = useRiskStore();

  const [formData, setFormData] = useState({
    photoUrl: '',
    rectification: '',
    reviewResult: '',
    handler: '安全员-李工',
  });
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escAssignee, setEscAssignee] = useState('');
  const [escLevel, setEscLevel] = useState<EscalationLevel>('manager');
  const [showReassign, setShowReassign] = useState(false);
  const [reassignAssignee, setReassignAssignee] = useState('');
  const [reassignNote, setReassignNote] = useState('');

  const risk = riskCards.find((r) => r.id === riskId);
  const existingRecords = riskId ? getRecordsByRiskId(riskId) : [];
  const location = risk ? LOCATIONS.find((l) => l.id === risk.locationId) : null;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        photoUrl: '',
        rectification: '',
        reviewResult: '',
        handler: '安全员-李工',
      });
      setPreviewPhotos([]);
      setShowEscalation(false);
      setEscAssignee('');
      setEscLevel('manager');
      setShowReassign(false);
      setReassignAssignee('');
      setReassignNote('');
    }
  }, [isOpen, riskId]);

  const handleAddPhoto = () => {
    if (formData.photoUrl.trim()) {
      setPreviewPhotos([...previewPhotos, formData.photoUrl.trim()]);
      setFormData({ ...formData, photoUrl: '' });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPreviewPhotos(previewPhotos.filter((_, i) => i !== index));
  };

  const canClose = isReviewQualified(formData.reviewResult);

  const handleSubmit = () => {
    if (!riskId || !formData.rectification.trim() || !formData.reviewResult.trim()) return;

    submitTracking(riskId, {
      rectification: formData.rectification,
      reviewResult: formData.reviewResult,
      handler: formData.handler,
      photoUrl: previewPhotos[0],
    });

    onClose();
  };

  const handleEscalate = () => {
    if (!riskId || !escAssignee.trim()) return;
    escalateRisk(riskId, escLevel, escAssignee.trim(), formData.handler);
    setShowEscalation(false);
    setEscAssignee('');
  };

  const handleReassign = () => {
    if (!riskId || !reassignAssignee.trim()) return;
    reassignEscalation(riskId, reassignAssignee.trim(), formData.handler, reassignNote.trim() || undefined);
    setShowReassign(false);
    setReassignAssignee('');
    setReassignNote('');
  };

  if (!risk) return null;

  const isEscalated = risk.escalationLevel && risk.escalationLevel !== 'none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="风险闭环处理" size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-risk-highBg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-risk-high" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">{getRiskTypeLabel(risk.type)}</h3>
                  <Badge variant="risk" level={risk.level}>
                    {getRiskLevelLabel(risk.level)}
                  </Badge>
                  {isEscalated && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <ShieldAlert size={12} />
                      {risk.escalationLevel === 'manager' ? '值班经理跟进' : '质量安全主管督办'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-dashboard-muted">
                  <span>位置：{location?.name || '-'}</span>
                  <span>班组：{risk.team}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-dashboard-muted" />
                  <span className={cn(risk.isOverdue ? 'text-risk-high font-medium' : 'text-dashboard-muted')}>
                    放行时限：{risk.releaseDeadline}
                    {risk.isOverdue && '（已超时）'}
                  </span>
                </div>
                {risk.sourceWorkCardNo && (
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <FileText className="w-3.5 h-3.5 text-accent-blue" />
                    <span className="text-dashboard-text">
                      来源工卡：<span className="font-mono text-accent-blue">{risk.sourceWorkCardNo}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <Camera className="w-4 h-4 text-accent-blue" />
                现场照片
              </label>
              <div className="space-y-3">
                {previewPhotos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {previewPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-lg border border-dashboard-border overflow-hidden bg-dashboard-card"
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-7 h-7 text-dashboard-muted" />
                        </div>
                        <button
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-risk-high/80 text-white flex items-center justify-center hover:bg-risk-high transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入图片URL或模拟上传..."
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPhoto()}
                    className="input-field flex-1 text-sm py-1.5"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddPhoto}>
                    <Upload size={14} />
                    <span>添加</span>
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <FileText className="w-4 h-4 text-accent-blue" />
                整改意见 <span className="text-risk-high">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="请详细填写整改措施和落实情况..."
                value={formData.rectification}
                onChange={(e) => setFormData({ ...formData, rectification: e.target.value })}
                className={cn(
                  'input-field resize-none',
                  !formData.rectification.trim() && 'border-risk-high/50'
                )}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <CheckCircle2 className="w-4 h-4 text-accent-blue" />
                复核结论 <span className="text-risk-high">*</span>
                <span className="text-xs text-dashboard-muted font-normal">
                  （仅"整改合格/基本合格"可确认闭环）
                </span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {REVIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, reviewResult: opt.value })}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-all',
                      formData.reviewResult === opt.value
                        ? 'bg-accent-blue/20 border-accent-blue text-white'
                        : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
                    )}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <User className="w-4 h-4 text-accent-blue" />
                处理人
              </label>
              <input
                type="text"
                value={formData.handler}
                onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
                className="input-field max-w-xs text-sm py-1.5"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-blue" />
              处理时间线
            </h4>
            <div className="relative pl-5 space-y-0 max-h-72 overflow-y-auto pr-1">
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
              {existingRecords.slice().reverse().map((record) => {
                const isEscRec = record.rectification?.includes('责任升级');
                return (
                  <TimelineItem
                    key={record.id}
                    icon={isEscRec ? ShieldAlert : CheckCircle2}
                    iconColor={isEscRec ? 'text-orange-400' : 'text-risk-medium'}
                    iconBg={isEscRec ? 'bg-orange-500/20' : 'bg-risk-mediumBg'}
                    title={record.handler}
                    time={record.handledAt}
                    content={`${record.reviewResult}${record.rectification ? ' · ' + record.rectification : ''}`}
                  />
                );
              })}
              {risk.status !== 'closed' && (
                <div className="relative -ml-1.5 pb-2">
                  <div className="w-3 h-3 rounded-full bg-accent-blue animate-pulse absolute -left-[1px] top-1.5" />
                  <div className="ml-6 text-sm text-accent-blue font-medium">
                    {risk.status === 'processing' ? '处理进行中...' : '待处理'}
                  </div>
                </div>
              )}
              {risk.status === 'closed' && (
                <div className="relative -ml-1.5 pb-2">
                  <div className="w-3 h-3 rounded-full bg-risk-low absolute -left-[1px] top-1.5" />
                  <div className="ml-6 text-sm text-risk-low font-medium">已闭环</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">提交操作</h4>
              <div className="flex items-center gap-3">
                {isEscalated && (
                  <button
                    onClick={() => setShowReassign(!showReassign)}
                    className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    <UserPlus size={14} />
                    改派跟进人
                  </button>
                )}
                <button
                  onClick={() => setShowEscalation(!showEscalation)}
                  className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <TrendingUp size={14} />
                  {isEscalated ? '调整升级等级' : '责任升级'}
                </button>
              </div>
            </div>

            {isEscalated && risk.escalationAssignee && (
              <div className="mb-3 flex items-center gap-2 p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <ShieldAlert size={16} className="text-orange-400 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="text-orange-400 font-medium">
                    已升级至{risk.escalationLevel === 'manager' ? '值班经理' : '质量安全主管'}
                  </span>
                  <span className="text-dashboard-text">　跟进人：{risk.escalationAssignee}</span>
                </div>
                <span className="text-xs text-dashboard-muted font-mono">{risk.escalatedAt}</span>
              </div>
            )}

            {showEscalation && (
              <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-3 animate-fade-in-up">
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <Info size={14} />
                  <span>超时风险可升级责任，指定跟进人并写入时间线</span>
                </div>
                <div className="space-y-2">
                  {ESCALATION_TARGETS.map((t) => (
                    <button
                      key={t.level}
                      onClick={() => setEscLevel(t.level)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg border text-sm transition-all',
                        escLevel === t.level
                          ? 'bg-orange-500/20 border-orange-500/50 text-white'
                          : 'bg-dashboard-bg border-dashboard-border text-dashboard-text hover:border-orange-500/40'
                      )}
                    >
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-dashboard-muted mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="指定跟进人姓名"
                    value={escAssignee}
                    onChange={(e) => setEscAssignee(e.target.value)}
                    className="input-field flex-1 text-sm py-1.5"
                  />
                  <Button variant="secondary" size="sm" onClick={handleEscalate} disabled={!escAssignee.trim()}>
                    <ShieldAlert size={14} />
                    <span>确认升级</span>
                  </Button>
                </div>
              </div>
            )}

            {showReassign && (
              <div className="mb-3 p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-lg space-y-3 animate-fade-in-up">
                <div className="flex items-center gap-2 text-xs text-accent-blue">
                  <UserPlus size={14} />
                  <span>改派当前升级的跟进人，改派记录将写入时间线</span>
                </div>
                <input
                  type="text"
                  placeholder="新跟进人姓名"
                  value={reassignAssignee}
                  onChange={(e) => setReassignAssignee(e.target.value)}
                  className="input-field w-full text-sm py-1.5"
                />
                <input
                  type="text"
                  placeholder="改派原因（可选）"
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  className="input-field w-full text-sm py-1.5"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowReassign(false)}>
                    取消
                  </Button>
                  <Button size="sm" onClick={handleReassign} disabled={!reassignAssignee.trim()}>
                    <UserPlus size={14} />
                    <span>确认改派</span>
                  </Button>
                </div>
              </div>
            )}

            {risk.escalationHistory && risk.escalationHistory.length > 1 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-xs text-dashboard-muted mb-2">
                  <History size={12} />
                  <span>升级历史</span>
                </div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {risk.escalationHistory.slice().reverse().map((h, idx) => (
                    <div key={h.id} className="flex items-center gap-2 text-xs text-dashboard-text">
                      <span className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="text-orange-400">
                        {h.level === 'manager' ? '值班经理' : '质量安全主管'}
                      </span>
                      <span className="text-dashboard-muted">→</span>
                      <span className="text-white">{h.assignee}</span>
                      <span className="text-dashboard-muted ml-auto font-mono">{h.time}</span>
                      {idx === 0 && <span className="text-risk-low">(当前)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleSubmit}
                disabled={!formData.rectification.trim() || !formData.reviewResult.trim()}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  'bg-risk-lowBg/30 border-risk-low/50 hover:bg-risk-lowBg/50',
                  (!formData.rectification.trim() || !formData.reviewResult.trim()) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <PlayCircle className="w-6 h-6 text-risk-medium" />
                <div className="flex-1">
                  <div className="font-medium text-white">保存处理记录</div>
                  <div className="text-xs text-dashboard-muted">
                    {canClose
                      ? '复核合格，将自动确认闭环并移出超时列表'
                      : '当前复核结论将保持"处理中"状态，继续跟踪'}
                  </div>
                </div>
                {!canClose && formData.reviewResult && (
                  <span className="text-xs text-orange-400 flex items-center gap-1">
                    <Info size={12} />
                    不可闭环
                  </span>
                )}
              </button>
              {formData.reviewResult && !canClose && (
                <div className="flex items-start gap-2 p-2.5 bg-orange-500/10 rounded-lg text-xs text-orange-400">
                  <Info size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    复核结论为「{formData.reviewResult}」，不满足闭环条件。风险将保留在处理中并继续跟踪，超时统计仍会计入。
                  </span>
                </div>
              )}
              {canClose && (
                <div className="flex items-center gap-2 p-2.5 bg-risk-lowBg/20 rounded-lg text-xs text-risk-low">
                  <CheckSquare size={14} />
                  <span>复核结论为「{formData.reviewResult}」，提交后风险将确认闭环，所有超时统计与标签不再计入。</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-dashboard-border">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.rectification.trim() || !formData.reviewResult.trim()}
        >
          <ArrowRight size={16} />
          <span>{canClose ? '确认闭环' : '提交处理记录'}</span>
        </Button>
      </div>
    </Modal>
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
