import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dashboard-bg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-accent-blue hover:bg-accent-blue/90 text-white hover:shadow-lg hover:shadow-accent-blue/25 focus:ring-accent-blue/50',
    secondary: 'bg-dashboard-surface hover:bg-dashboard-border text-dashboard-text border border-dashboard-border',
    danger: 'bg-risk-high hover:bg-risk-high/90 text-white focus:ring-risk-high/50',
    ghost: 'bg-transparent hover:bg-dashboard-border/50 text-dashboard-text',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
