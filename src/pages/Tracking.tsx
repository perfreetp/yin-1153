import { useState } from 'react';
import Header from '@/components/layout/Header';
import RiskTrackingList from '@/components/tracking/RiskTrackingList';
import TrackingForm from '@/components/tracking/TrackingForm';

export default function Tracking() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const handleSelectRisk = (riskId: string) => {
    setSelectedRiskId(riskId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRiskId(null);
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <main className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-white mb-1">闭环跟踪</h1>
          <p className="text-sm text-dashboard-muted">
            安全员对每条风险填写现场照片、整改意见和复核结果，超时未处理项自动置顶
          </p>
        </div>

        <RiskTrackingList onSelectRisk={handleSelectRisk} />
      </main>
      <TrackingForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        riskId={selectedRiskId}
      />
    </div>
  );
}
