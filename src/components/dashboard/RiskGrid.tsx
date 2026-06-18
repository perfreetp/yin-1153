import { useRiskStore } from '@/store/useRiskStore';
import RiskCard from './RiskCard';
import { AlertTriangle } from 'lucide-react';

export default function RiskGrid() {
  const { getFilteredRiskCards, openRiskDetail } = useRiskStore();
  const riskCards = getFilteredRiskCards();

  const sortedCards = [...riskCards].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    const levelOrder = { high: 0, medium: 1, low: 2 };
    return levelOrder[a.level] - levelOrder[b.level];
  });

  if (sortedCards.length === 0) {
    return (
      <div className="bg-dashboard-surface border border-dashboard-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dashboard-card flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-dashboard-muted" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">暂无风险项</h3>
        <p className="text-sm text-dashboard-muted">当前筛选条件下没有风险作业</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedCards.map((risk, index) => (
        <RiskCard
          key={risk.id}
          risk={risk}
          index={index}
          onClick={() => openRiskDetail(risk.id)}
        />
      ))}
    </div>
  );
}
