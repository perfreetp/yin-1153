import Header from '@/components/layout/Header';
import LocationFilter from '@/components/dashboard/LocationFilter';
import RiskGrid from '@/components/dashboard/RiskGrid';
import RiskDetailModal from '@/components/dashboard/RiskDetailModal';
import OverdueBanner from '@/components/dashboard/OverdueBanner';
import { useRiskStore } from '@/store/useRiskStore';
import { LOCATIONS } from '@/data/mockData';

export default function Dashboard() {
  const { selectedBaseId, selectedLocationType, getFilteredRiskCards } = useRiskStore();
  const riskCards = getFilteredRiskCards();

  const locationCount = LOCATIONS.filter(
    (l) =>
      l.baseId === selectedBaseId &&
      (selectedLocationType === 'all' || l.type === selectedLocationType)
  ).length;

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <main className="p-6 max-w-[1920px] mx-auto">
        <OverdueBanner />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LocationFilter />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold font-display text-white">
                  风险分区总览
                </h2>
                <p className="text-sm text-dashboard-muted mt-1">
                  监控 {locationCount} 个作业区域，共 {riskCards.length} 项风险作业
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-risk-high" />
                  <span className="text-dashboard-muted">高风险</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-risk-medium" />
                  <span className="text-dashboard-muted">中风险</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-risk-low" />
                  <span className="text-dashboard-muted">低风险</span>
                </div>
              </div>
            </div>
            <RiskGrid />
          </div>
        </div>
      </main>
      <RiskDetailModal />
    </div>
  );
}
