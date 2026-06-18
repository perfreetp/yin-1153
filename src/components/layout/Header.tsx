import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { useRiskStore } from '@/store/useRiskStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '风险看板', icon: LayoutDashboard },
  { path: '/pre-shift', label: '班前确认', icon: ClipboardList },
  { path: '/tracking', label: '闭环跟踪', icon: ClipboardCheck },
];

export default function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const getRiskCountByLevel = useRiskStore((s) => s.getRiskCountByLevel);
  const counts = getRiskCountByLevel();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  };

  const getShift = (hour: number) => {
    if (hour >= 8 && hour < 16) return '白班';
    if (hour >= 16 && hour < 24) return '晚班';
    return '夜班';
  };

  const shift = getShift(currentTime.getHours());

  return (
    <header className="bg-dashboard-surface/95 backdrop-blur-sm border-b border-dashboard-border sticky top-0 z-40">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-blue/30">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-white tracking-wide">
                  MRO 风险控制中心
                </h1>
                <p className="text-xs text-dashboard-muted">Production Control Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4 px-4 py-2 bg-dashboard-card/60 rounded-lg border border-dashboard-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-risk-high animate-pulse" />
                  <span className="text-sm">
                    <span className="text-risk-high font-semibold font-mono text-lg">{counts.high}</span>
                    <span className="text-dashboard-muted ml-1">高风险</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-dashboard-border" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-risk-medium animate-pulse" />
                  <span className="text-sm">
                    <span className="text-risk-medium font-semibold font-mono text-lg">{counts.medium}</span>
                    <span className="text-dashboard-muted ml-1">中风险</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-dashboard-border" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
                  <span className="text-sm">
                    <span className="text-risk-low font-semibold font-mono text-lg">{counts.low}</span>
                    <span className="text-dashboard-muted ml-1">低风险</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-blue" />
                  <span className="text-2xl font-mono font-semibold text-white tracking-wider">
                    {formatTime(currentTime)}
                  </span>
                </div>
                <div className="text-xs text-dashboard-muted flex items-center gap-2 justify-end">
                  <span>{formatDate(currentTime)}</span>
                  <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded-full">
                    {shift}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-dashboard-card/60 rounded-lg border border-dashboard-border">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dashboard-border to-dashboard-card flex items-center justify-center">
                  <User className="w-4 h-4 text-dashboard-text" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white">值班经理</div>
                  <div className="text-xs text-dashboard-muted">张明</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 border-t border-dashboard-border/50">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
                  isActive
                    ? 'text-white border-accent-blue bg-accent-blue/10'
                    : 'text-dashboard-muted hover:text-white border-transparent hover:border-dashboard-border'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
