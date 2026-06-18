import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';
import { getRiskLevelColor, getRiskLevelLabel } from '@/utils/helpers';

interface BadgeProps {
  variant?: 'default' | 'risk';
  level?: RiskLevel;
  status?: 'open' | 'processing' | 'closed';
  children?: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', level, status, children, className }: BadgeProps) {
  if (variant === 'risk' && level) {
    const colors = getRiskLevelColor(level);
    return (
      <span className={cn('badge', colors.bg, colors.text, className)}>
        {children || getRiskLevelLabel(level)}
      </span>
    );
  }

  if (status) {
    const statusColors: Record<string, string> = {
      open: 'bg-risk-highBg text-risk-high',
      processing: 'bg-risk-mediumBg text-risk-medium',
      closed: 'bg-risk-lowBg text-risk-low',
    };
    const statusLabels: Record<string, string> = {
      open: '待处理',
      processing: '处理中',
      closed: '已闭环',
    };
    return (
      <span className={cn('badge', statusColors[status], className)}>
        {children || statusLabels[status]}
      </span>
    );
  }

  return (
    <span className={cn('badge bg-dashboard-border text-dashboard-text', className)}>
      {children}
    </span>
  );
}
