import { useState } from 'react';
import Header from '@/components/layout/Header';
import PreShiftForm from '@/components/preshift/PreShiftForm';
import DailyRiskList from '@/components/preshift/DailyRiskList';
import type { DailyRisk } from '@/types';

export default function PreShift() {
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);

  const handleRisksGenerated = (formId: string, _risks: DailyRisk[]) => {
    setCurrentFormId(formId);
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <main className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-white mb-1">班前确认</h1>
          <p className="text-sm text-dashboard-muted">
            开工前录入作业信息，系统自动生成当班风险清单，逐一确认后方可开工
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <PreShiftForm onRisksGenerated={handleRisksGenerated} />
          </div>
          <div>
            <DailyRiskList formId={currentFormId} />
          </div>
        </div>
      </main>
    </div>
  );
}
