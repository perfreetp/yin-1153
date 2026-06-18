import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';
import { generateId, getRiskLevelLabel, getRiskTypeLabel } from '@/utils/helpers';
import type { TrackingRecord } from '@/types';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingFormProps {
  isOpen: boolean;
  onClose: () => void;
  riskId: string | null;
}

export default function TrackingForm({ isOpen, onClose, riskId }: TrackingFormProps) {
  const { riskCards, addTrackingRecord, updateRiskStatus, trackingRecords } = useRiskStore();

  const [formData, setFormData] = useState({
    photoUrl: '',
    rectification: '',
    reviewResult: '',
    handler: '安全员-李工',
  });
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

  const risk = riskCards.find((r) => r.id === riskId);
  const existingRecords = riskId ? trackingRecords.filter((t) => t.riskId === riskId) : [];
  const location = risk ? LOCATIONS.find((l) => l.id === risk.locationId) : null;

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

    const record: TrackingRecord = {
      id: generateId(),
      riskId,
      rectification: formData.rectification,
      reviewResult: formData.reviewResult,
      handler: formData.handler,
      photoUrl: previewPhotos[0],
      handledAt: new Date().toLocaleString('zh-CN'),
    };

    addTrackingRecord(record);
    updateRiskStatus(riskId, 'processing');

    setFormData({
      photoUrl: '',
      rectification: '',
      reviewResult: '',
      handler: '安全员-李工',
    });
    setPreviewPhotos([]);
    onClose();
  };

  if (!risk) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="风险闭环处理" size="lg">
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
                <Badge status={risk.status} />
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-dashboard-muted">
                <span>位置：{location?.name || '-'}</span>
                <span>班组：{risk.team}</span>
                <span>时限：{risk.releaseDeadline}</span>
              </div>
            </div>
          </div>
        </div>

        {existingRecords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-risk-low" />
              历史处理记录
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {existingRecords.map((record, idx) => (
                <div
                  key={record.id}
                  className="bg-dashboard-card rounded-lg p-3 border border-dashboard-border animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-dashboard-muted" />
                      <span className="font-medium text-white">{record.handler}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-dashboard-muted">
                      <Clock className="w-3 h-3" />
                      {record.handledAt}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-dashboard-muted">整改意见：</span>
                      <span className="text-white">{record.rectification}</span>
                    </div>
                    <div>
                      <span className="text-dashboard-muted">复核结果：</span>
                      <span className="text-risk-low font-medium">{record.reviewResult}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-dashboard-border">
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
                      className="relative w-24 h-24 rounded-lg border border-dashboard-border overflow-hidden bg-dashboard-card"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-dashboard-muted" />
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
                  className="input-field flex-1"
                />
                <Button variant="secondary" onClick={handleAddPhoto}>
                  <Upload size={16} />
                  <span>添加</span>
                </Button>
              </div>
              <p className="text-xs text-dashboard-muted">
                提示：可添加多张现场照片作为整改证据
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              整改意见 <span className="text-risk-high">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="请填写整改措施和意见..."
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
              复核结果 <span className="text-risk-high">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="请填写复核结论，如：整改合格、已闭环等..."
              value={formData.reviewResult}
              onChange={(e) => setFormData({ ...formData, reviewResult: e.target.value })}
              className={cn(
                'input-field resize-none',
                !formData.reviewResult.trim() && 'border-risk-high/50'
              )}
            />
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
              className="input-field max-w-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashboard-border">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.rectification.trim() || !formData.reviewResult.trim()}
          >
            <CheckCircle2 size={16} />
            <span>提交处理</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
