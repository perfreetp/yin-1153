import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import PreShiftForm from '@/components/preshift/PreShiftForm';
import DailyRiskList from '@/components/preshift/DailyRiskList';
import type { DailyRisk } from '@/types';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';

export default function PreShift() {
  const navigate = useNavigate();
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [promotedInfo, setPromotedInfo] = useState<{ count: number; lastId: string } | null>(null);

  const handleRisksGenerated = (formId: string, _risks: DailyRisk[]) => {
    setCurrentFormId(formId);
  };

  const handlePromote = () => {
    setPromotedInfo((prev) => ({
      count: (prev?.count || 0) + 1,
      lastId: '',
    }));
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

        {promotedInfo && (
          <div className="mb-6 flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl animate-fade-in-up">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-blue" />
              <div>
                <p className="text-sm font-medium text-white">
                  已将当班风险转入闭环跟踪，携带来源工卡号
                </p>
                <p className="text-xs text-dashboard-muted mt-0.5">
                  可在闭环跟踪列表中查看该风险的来源工卡与处理进度
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tracking')}>
              <span>前往闭环跟踪</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <PreShiftForm onRisksGenerated={handleRisksGenerated} />
          </div>
          <div>
            <DailyRiskList formId={currentFormId} onPromote={handlePromote} />
          </div>
        </div>
      </main>
    </div>
  );
}
