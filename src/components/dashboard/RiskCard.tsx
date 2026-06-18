import {
  Mountain,
  Zap,
  Fuel,
  ArrowUpFromLine,
  Truck,
  AlertTriangle,
  Users,
  Clock,
  ChevronRight,
  Plane,
} from 'lucide-react';
import type { RiskCardData } from '@/types';
import {
  getRiskLevelColor,
  getRiskLevelLabel,
  getRiskTypeLabel,
} from '@/utils/helpers';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';

const iconMap: Record<string, React.ElementType> = {
  Mountain,
  Zap,
  Fuel,
  ArrowUpFromLine,
  Truck,
};

interface RiskCardProps {
  risk: RiskCardData;
  index: number;
  onClick: () => void;
}

export default function RiskCard({ risk, index, onClick }: RiskCardProps) {
  const colors = getRiskLevelColor(risk.level);
  const Icon = iconMap[
    risk.type === 'high_altitude'
      ? 'Mountain'
      : risk.type === 'power_test'
      ? 'Zap'
      : risk.type === 'fuel_operation'
      ? 'Fuel'
      : risk.type === 'jacking'
      ? 'ArrowUpFromLine'
      : 'Truck'
  ] || AlertTriangle;

  const staggerClass = `animate-stagger-${Math.min((index % 10) + 1, 10)}`;

  return (
    <div
      onClick={onClick}
      className={cn(
        'risk-card group animate-fade-in-up',
        colors.cardClass,
        staggerClass,
        risk.isOverdue && 'animate-glow',
        'hover:scale-[1.02] hover:shadow-card-hover'
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                colors.bg
              )}
            >
              <Icon className={cn('w-6 h-6', colors.text)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-display text-white">
                {getRiskTypeLabel(risk.type)}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Plane className="w-3 h-3 text-dashboard-muted" />
                <span className="text-xs text-dashboard-muted font-mono">
                  {risk.aircraftNo || '未知'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="risk" level={risk.level}>
              {getRiskLevelLabel(risk.level)}
            </Badge>
            {risk.isOverdue && (
              <span className="px-2 py-0.5 bg-risk-high text-white text-xs font-medium rounded-full animate-pulse">
                已超时
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-dashboard-muted" />
            <span className="text-dashboard-muted">责任班组：</span>
            <span className="text-white font-medium">{risk.team}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-dashboard-muted" />
            <span className="text-dashboard-muted">放行时限：</span>
            <span
              className={cn(
                'font-mono font-medium',
                risk.isOverdue ? 'text-risk-high' : 'text-white'
              )}
            >
              {risk.releaseDeadline}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dashboard-border/50">
          <Badge status={risk.status} />
          <div
            className={cn(
              'flex items-center gap-1 text-sm transition-colors',
              colors.text
            )}
          >
            <span className="font-medium">查看详情</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'absolute top-0 left-0 w-1 h-full',
          risk.level === 'high'
            ? 'bg-risk-high'
            : risk.level === 'medium'
            ? 'bg-risk-medium'
            : 'bg-risk-low'
        )}
      />
    </div>
  );
}
