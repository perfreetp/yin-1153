import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import { generateId, getRiskLevelLabel, getRiskTypeLabel, getStatusLabel } from '@/utils/helpers';
import type { TrackingRecord, RiskStatus } from '@/types';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingFormProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string | null;
}

export default function TrackingForm({ isOpen, onClose, riskId }: TrackingFormProps) {
  const { riskCards, addTrackingRecord, updateRiskStatus, getRecordsByRiskId } = useRiskStore();

  const [formData, setFormData] = useState({
    photoUrl: '',
    rectification: '',
    reviewResult: '',
    handler: '安全员-李工',
  });
  const [submitAction, setSubmitAction] = useState<'processing' | 'closed'>('processing');
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

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
      setSubmitAction('processing');
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

  const handleSubmit = () => {
    if (!riskId || !formData.rectification.trim() || !formData.reviewResult.trim()) return;

    const now = new Date().toLocaleString('zh-CN');
    const record: TrackingRecord = {
      id: generateId(),
      riskId,
      rectification: formData.rectification,
      reviewResult: formData.reviewResult,
      handler: formData.handler,
      photoUrl: previewPhotos[0],
      handledAt: now,
    };

    addTrackingRecord(record);

    if (submitAction === 'closed') {
      updateRiskStatus(riskId, 'closed');
    } else {
      updateRiskStatus(riskId, 'processing');
    }

    onClose();
  };

  if (!risk) return null;

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
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-dashboard-muted">
                  <span>位置：{location?.name || '-'}</span>
                  <span>班组：{risk.team}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <Clock className="w-3.5 h-3.5 text-dashboard-muted" />
                  <span className={cn(risk.isOverdue ? 'text-risk-high font-medium' : 'text-dashboard-muted')}>
                    放行时限：{risk.releaseDeadline}
                    {risk.isOverdue && '（已超时）'}
                  </span>
                </div>
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
              </label>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {['整改合格', '基本合格需跟进', '不合格需重新整改', '待进一步验证'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, reviewResult: opt })}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-all',
                        formData.reviewResult === opt
                          ? 'bg-accent-blue/20 border-accent-blue text-white'
                          : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  placeholder="补充说明（选填）"
                  value={formData.reviewResult.includes('整改') ? formData.reviewResult : formData.reviewResult}
                  onChange={(e) => setFormData({ ...formData, reviewResult: e.target.value })}
                  className="input-field resize-none text-sm"
                />
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
            <div className="relative pl-5 space-y-0">
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
              {existingRecords.slice().reverse().map((record, idx) => (
                <TimelineItem
                  key={record.id}
                  icon={CheckCircle2}
                  iconColor="text-risk-medium"
                  iconBg="bg-risk-mediumBg"
                  title={record.handler}
                  time={record.handledAt}
                  content={record.reviewResult}
                />
              ))}
              <div className="relative -ml-1.5 pb-2">
                <div className="w-3 h-3 rounded-full bg-accent-blue animate-pulse absolute -left-[1px] top-1.5" />
                <div className="ml-6 text-sm text-accent-blue font-medium">
                  当前处理中...
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dashboard-card rounded-lg p-4 border border-dashboard-border">
            <h4 className="text-sm font-semibold text-white mb-3">提交操作</h4>
            <div className="space-y-2">
              <button
                onClick={() => setSubmitAction('processing')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  submitAction === 'processing'
                    ? 'bg-risk-mediumBg border-risk-medium/50'
                    : 'bg-dashboard-bg border-dashboard-border hover:border-dashboard-text/50'
                )}
              >
                <PlayCircle className={cn('w-6 h-6', submitAction === 'processing' ? 'text-risk-medium' : 'text-dashboard-muted')} />
                <div>
                  <div className={cn('font-medium', submitAction === 'processing' ? 'text-white' : 'text-dashboard-text')}>
                    保存为处理中
                  </div>
                  <div className="text-xs text-dashboard-muted">
                    整改措施已落实，需继续跟踪验证
                  </div>
                </div>
              </button>
              <button
                onClick={() => setSubmitAction('closed')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  submitAction === 'closed'
                    ? 'bg-risk-lowBg border-risk-low/50'
                    : 'bg-dashboard-bg border-dashboard-border hover:border-dashboard-text/50'
                )}
              >
                <CheckSquare className={cn('w-6 h-6', submitAction === 'closed' ? 'text-risk-low' : 'text-dashboard-muted')} />
                <div>
                  <div className={cn('font-medium', submitAction === 'closed' ? 'text-white' : 'text-dashboard-text')}>
                    确认闭环
                  </div>
                  <div className="text-xs text-dashboard-muted">
                    风险已完全解除，从超时列表移除
                  </div>
                </div>
              </button>
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
          variant={submitAction === 'closed' ? 'primary' : 'primary'}
        >
          <ArrowRight size={16} />
          <span>
            {submitAction === 'processing' ? '提交处理记录' : '确认闭环'}
          </span>
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="text-xs text-dashboard-muted font-mono">{time}</span>
        </div>
        <p className="text-sm text-dashboard-text mt-0.5">{content}</p>
      </div>
    </div>
  );
}
