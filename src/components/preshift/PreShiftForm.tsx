import { useState } from 'react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useRiskStore } from '@/store/useRiskStore';
import {
  AIRCRAFT_TYPES,
  SPECIAL_TOOLS,
  WEATHER_CONDITIONS,
} from '@/data/mockData';
import { generateId, generateDailyRisks } from '@/utils/helpers';
import {
  Plane,
  FileText,
  Users,
  Wrench,
  Cloud,
  ChevronRight,
  Check,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyRisk, PreShiftFormData } from '@/types';

interface PreShiftFormProps {
  onRisksGenerated: (formId: string, risks: DailyRisk[]) => void;
}

export default function PreShiftForm({ onRisksGenerated }: PreShiftFormProps) {
  const addPreShiftForm = useRiskStore((s) => s.addPreShiftForm);
  const addDailyRisks = useRiskStore((s) => s.addDailyRisks);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    aircraftType: '',
    workCardNo: '',
    workerCount: 3,
    specialTools: [] as string[],
    weather: '',
    team: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      specialTools: prev.specialTools.includes(tool)
        ? prev.specialTools.filter((t) => t !== tool)
        : [...prev.specialTools, tool],
    }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep >= 1) {
      if (!formData.aircraftType) newErrors.aircraftType = '请选择机型';
      if (!formData.workCardNo.trim()) newErrors.workCardNo = '请输入工卡号';
      if (!formData.team.trim()) newErrors.team = '请输入班组名称';
    }
    if (currentStep >= 2) {
      if (formData.workerCount < 1) newErrors.workerCount = '作业人数至少为1人';
      if (!formData.weather) newErrors.weather = '请选择天气条件';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const formId = generateId();
    const newForm: PreShiftFormData = {
      id: formId,
      ...formData,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    addPreShiftForm(newForm);

    const risks = generateDailyRisks(
      formId,
      formData.aircraftType,
      formData.workerCount,
      formData.specialTools,
      formData.weather
    );
    addDailyRisks(risks);
    onRisksGenerated(formId, risks);
  };

  const steps = [
    { num: 1, label: '基础信息' },
    { num: 2, label: '作业环境' },
    { num: 3, label: '确认生成' },
  ];

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-dashboard-border bg-gradient-to-r from-dashboard-card to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">班前确认</h2>
            <p className="text-sm text-dashboard-muted mt-0.5">
              录入当班作业信息，系统自动生成风险清单
            </p>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    step >= s.num
                      ? 'bg-accent-blue text-white'
                      : 'bg-dashboard-card text-dashboard-muted border border-dashboard-border'
                  )}
                >
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    step >= s.num ? 'text-white' : 'text-dashboard-muted'
                  )}
                >
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 mx-3',
                      step > s.num ? 'bg-accent-blue' : 'bg-dashboard-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                  <Plane size={16} className="text-accent-blue" />
                  机型 <span className="text-risk-high">*</span>
                </label>
                <select
                  value={formData.aircraftType}
                  onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
                  className={cn('input-field', errors.aircraftType && 'border-risk-high')}
                >
                  <option value="">请选择机型</option>
                  {AIRCRAFT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.aircraftType && (
                  <p className="text-xs text-risk-high mt-1">{errors.aircraftType}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                  <FileText size={16} className="text-accent-blue" />
                  工卡号 <span className="text-risk-high">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：737-AMM-12-00-00"
                  value={formData.workCardNo}
                  onChange={(e) => setFormData({ ...formData, workCardNo: e.target.value })}
                  className={cn('input-field', errors.workCardNo && 'border-risk-high')}
                />
                {errors.workCardNo && (
                  <p className="text-xs text-risk-high mt-1">{errors.workCardNo}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <Users size={16} className="text-accent-blue" />
                责任班组 <span className="text-risk-high">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：结构一班、电子二班"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className={cn('input-field max-w-md', errors.team && 'border-risk-high')}
              />
              {errors.team && (
                <p className="text-xs text-risk-high mt-1">{errors.team}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <Users size={16} className="text-accent-blue" />
                作业人数
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      workerCount: Math.max(1, formData.workerCount - 1),
                    })
                  }
                  className="w-10 h-10 rounded-lg bg-dashboard-card border border-dashboard-border text-white hover:border-accent-blue transition-colors flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="w-16 text-center text-2xl font-bold font-mono text-white">
                  {formData.workerCount}
                </span>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      workerCount: Math.min(20, formData.workerCount + 1),
                    })
                  }
                  className="w-10 h-10 rounded-lg bg-dashboard-card border border-dashboard-border text-white hover:border-accent-blue transition-colors flex items-center justify-center text-xl"
                >
                  +
                </button>
                <span className="text-sm text-dashboard-muted ml-2">人</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-3">
                <Wrench size={16} className="text-accent-blue" />
                特殊工具
                <span className="text-xs text-dashboard-muted font-normal ml-1">
                  (可多选)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_TOOLS.map((tool) => {
                  const isSelected = formData.specialTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      onClick={() => toggleTool(tool)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all',
                        isSelected
                          ? 'bg-accent-blue/20 border-accent-blue text-white'
                          : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
                      )}
                    >
                      {isSelected ? (
                        <Check size={14} className="text-accent-blue" />
                      ) : (
                        <Plus size={14} />
                      )}
                      {tool}
                    </button>
                  );
                })}
              </div>
              {formData.specialTools.length > 0 && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-dashboard-muted">已选：</span>
                  {formData.specialTools.map((tool) => (
                    <Badge key={tool} className="bg-accent-blue/20 text-accent-blue">
                      {tool}
                      <button
                        onClick={() => toggleTool(tool)}
                        className="ml-1.5 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dashboard-text mb-2">
                <Cloud size={16} className="text-accent-blue" />
                天气条件 <span className="text-risk-high">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {WEATHER_CONDITIONS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setFormData({ ...formData, weather: w })}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      formData.weather === w
                        ? 'bg-accent-blue/20 border-accent-blue text-white'
                        : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
              {errors.weather && (
                <p className="text-xs text-risk-high mt-1">{errors.weather}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="bg-dashboard-card rounded-lg p-5 border border-dashboard-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent-blue" />
                <h3 className="font-semibold text-white">信息确认</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">机型：</span>
                  <span className="text-white font-medium">{formData.aircraftType || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">工卡号：</span>
                  <span className="text-white font-mono font-medium">{formData.workCardNo || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">责任班组：</span>
                  <span className="text-white font-medium">{formData.team || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">作业人数：</span>
                  <span className="text-white font-medium">{formData.workerCount} 人</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">特殊工具：</span>
                  <span className="text-white font-medium">
                    {formData.specialTools.length > 0
                      ? formData.specialTools.join('、')
                      : '无'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dashboard-muted w-20">天气条件：</span>
                  <span className="text-white font-medium">{formData.weather || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-risk-mediumBg/30 border border-risk-medium/30 rounded-lg p-4">
              <p className="text-sm text-risk-medium">
                <strong>系统提示：</strong>
                点击确认后，系统将根据以上信息自动生成当班风险清单，请仔细核对信息无误。
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-dashboard-border bg-dashboard-card/50 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          上一步
        </Button>
        <Button onClick={handleNext}>
          {step < 3 ? (
            <>
              <span>下一步</span>
              <ChevronRight size={16} />
            </>
          ) : (
            <>
              <Check size={16} />
              <span>确认并生成风险清单</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
