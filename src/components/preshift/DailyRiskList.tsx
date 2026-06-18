import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { useRiskStore } from '@/store/useRiskStore';
import {
  getRiskLevelLabel,
} from '@/utils/helpers';
import { cn } from '@/lib/utils';
import type { DailyRisk } from '@/types';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Check,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface DailyRiskListProps {
  formId: string | null;
  onPromote?: (riskId: string, promotedRiskId: string) => void;
}

export default function DailyRiskList({ formId, onPromote }: DailyRiskListProps) {
  const { dailyRisks, toggleDailyRisk, preShiftForms, promoteDailyRiskToTracking } = useRiskStore();

  const filteredRisks = formId
    ? dailyRisks.filter((r) => r.formId === formId)
    : dailyRisks.slice(-10);

  const relatedForm = formId ? preShiftForms.find((f) => f.id === formId) : null;

  const allChecked = filteredRisks.length > 0 && filteredRisks.every((r) => r.isChecked);

  const handlePromote = (riskId: string) => {
    const promotedId = promoteDailyRiskToTracking(riskId);
    if (promotedId && onPromote) onPromote(riskId, promotedId);
  };

  if (filteredRisks.length === 0) {
    return (
      <div className="bg-dashboard-surface border border-dashboard-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dashboard-card flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-dashboard-muted" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">暂无风险清单</h3>
        <p className="text-sm text-dashboard-muted">
          请先完成班前确认表单填写，系统将自动生成当班风险清单
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-xl overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-dashboard-border bg-gradient-to-r from-dashboard-card to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">当班风险清单</h2>
            {relatedForm && (
              <p className="text-sm text-dashboard-muted mt-0.5">
                {relatedForm.aircraftType} · {relatedForm.team} · 工卡 {relatedForm.workCardNo}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-dashboard-muted">确认进度</div>
              <div className="text-lg font-bold font-mono text-white">
                {filteredRisks.filter((r) => r.isChecked).length}
                <span className="text-dashboard-muted">/</span>
                {filteredRisks.length}
              </div>
            </div>
            {allChecked && (
              <div className="flex items-center gap-2 px-3 py-2 bg-risk-lowBg text-risk-low rounded-lg">
                <ShieldCheck size={18} />
                <span className="text-sm font-medium">全部确认</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-risk-high" />
            <span className="text-sm text-dashboard-muted">
              高风险{' '}
              <span className="text-risk-high font-bold">
                {filteredRisks.filter((r) => r.level === 'high').length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-risk-medium" />
            <span className="text-sm text-dashboard-muted">
              中风险{' '}
              <span className="text-risk-medium font-bold">
                {filteredRisks.filter((r) => r.level === 'medium').length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-risk-low" />
            <span className="text-sm text-dashboard-muted">
              低风险{' '}
              <span className="text-risk-low font-bold">
                {filteredRisks.filter((r) => r.level === 'low').length}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-dashboard-border/50">
        {filteredRisks.map((risk, index) => (
          <RiskItem
            key={risk.id}
            risk={risk}
            index={index}
            onToggle={() => toggleDailyRisk(risk.id)}
            onPromote={handlePromote}
          />
        ))}
      </div>

      <div className="px-6 py-4 border-t border-dashboard-border bg-dashboard-card/50 flex items-center justify-between">
        <p className="text-sm text-dashboard-muted">
          请逐一确认每项风险措施已落实后方可开工
        </p>
        <Button variant={allChecked ? 'primary' : 'secondary'} disabled={!allChecked}>
          <Check size={16} />
          <span>确认开工</span>
        </Button>
      </div>
    </div>
  );
}

function RiskItem({
  risk,
  index,
  onToggle,
  onPromote,
}: {
  risk: DailyRisk;
  index: number;
  onToggle: () => void;
  onPromote: (riskId: string) => void;
}) {
  const staggerClass = `animate-stagger-${Math.min((index % 10) + 1, 10)}`;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 transition-all animate-fade-in-up',
        staggerClass,
        risk.isChecked
          ? 'bg-risk-lowBg/10 hover:bg-risk-lowBg/20'
          : 'hover:bg-dashboard-card/50'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          risk.isChecked
            ? 'bg-risk-low border-risk-low'
            : 'border-dashboard-border hover:border-accent-blue'
        )}
      >
        {risk.isChecked && <CheckCircle2 size={14} className="text-white" />}
      </button>

      <div
        className={cn(
          'w-1 h-10 rounded-full flex-shrink-0',
          risk.level === 'high'
            ? 'bg-risk-high'
            : risk.level === 'medium'
            ? 'bg-risk-medium'
            : 'bg-risk-low'
        )}
      />

      <div className="flex-1 min-w-0" onClick={onToggle}>
        <p
          className={cn(
            'text-sm font-medium',
            risk.isChecked ? 'text-dashboard-muted line-through' : 'text-white'
          )}
        >
          {risk.description}
        </p>
      </div>

      <Badge variant="risk" level={risk.level}>
        {getRiskLevelLabel(risk.level)}
      </Badge>

      {risk.isChecked ? (
        <span className="text-xs text-risk-low font-medium flex items-center gap-1">
          <Check size={12} />
          已确认
        </span>
      ) : (
        <Circle className="w-4 h-4 text-dashboard-muted" />
      )}

      {risk.promotedRiskId ? (
        <span className="flex items-center gap-1 text-xs text-accent-blue font-medium px-2.5 py-1.5 bg-accent-blue/10 rounded-lg">
          <FileText size={12} />
          已转入跟踪
        </span>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPromote(risk.id)}
        >
          <ArrowRight size={12} />
          <span>转入跟踪</span>
        </Button>
      )}
    </div>
  );
}
