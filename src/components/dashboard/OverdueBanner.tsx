import { useRiskStore } from '@/store/useRiskStore';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { LOCATIONS } from '@/data/mockData';
import {
  getRiskLevelColor,
  getRiskTypeLabel,
} from '@/utils/helpers';
import { cn } from '@/lib/utils';

export default function OverdueBanner() {
  const { getOverdueRiskCards, openRiskDetail } = useRiskStore();
  const overdueRisks = getOverdueRiskCards();

  if (overdueRisks.length === 0) return null;

  return (
    <div className="mb-6 animate-slide-in-up">
      <div className="bg-gradient-to-r from-risk-high/20 via-risk-high/10 to-transparent border border-risk-high/40 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-risk-high/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-risk-high" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold font-display text-risk-high">
                超时预警
              </h3>
              <span className="px-2.5 py-0.5 bg-risk-high text-white text-sm font-bold rounded-full">
                {overdueRisks.length} 项未处理
              </span>
            </div>
            <p className="text-sm text-dashboard-text mb-4">
              以下风险作业已超过放行时限，请立即安排处理
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overdueRisks.map((risk) => {
                const location = LOCATIONS.find((l) => l.id === risk.locationId);
                const colors = getRiskLevelColor(risk.level);
                return (
                  <button
                    key={risk.id}
                    onClick={() => openRiskDetail(risk.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg bg-dashboard-bg/60 border border-risk-high/30 hover:border-risk-high hover:bg-dashboard-bg transition-all text-left group'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        colors.bg
                      )}
                    >
                      <Clock className={cn('w-5 h-5', colors.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {getRiskTypeLabel(risk.type)}
                      </div>
                      <div className="text-xs text-dashboard-muted truncate">
                        {location?.name || '-'} · {risk.team}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dashboard-muted group-hover:text-risk-high group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
