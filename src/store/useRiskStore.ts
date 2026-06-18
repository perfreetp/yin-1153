import { create } from 'zustand';
import type {
  RiskCardData,
  RiskMeasure,
  PreShiftFormData,
  DailyRisk,
  TrackingRecord,
  LocationType,
} from '@/types';
import {
  INITIAL_RISK_CARDS,
  INITIAL_RISK_MEASURES,
  LOCATIONS,
} from '@/data/mockData';

interface RiskState {
  selectedBaseId: string;
  selectedLocationType: LocationType | 'all';
  selectedLocationId: string | null;
  selectedRiskId: string | null;
  isDetailModalOpen: boolean;
  riskCards: RiskCardData[];
  riskMeasures: RiskMeasure[];
  preShiftForms: PreShiftFormData[];
  dailyRisks: DailyRisk[];
  trackingRecords: TrackingRecord[];

  setSelectedBaseId: (id: string) => void;
  setSelectedLocationType: (type: LocationType | 'all') => void;
  setSelectedLocationId: (id: string | null) => void;
  setSelectedRiskId: (id: string | null) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  openRiskDetail: (riskId: string) => void;
  closeRiskDetail: () => void;

  addPreShiftForm: (form: PreShiftFormData) => void;
  addDailyRisks: (risks: DailyRisk[]) => void;
  toggleDailyRisk: (riskId: string) => void;

  addTrackingRecord: (record: TrackingRecord) => void;
  updateRiskStatus: (riskId: string, status: 'open' | 'processing' | 'closed') => void;

  getFilteredRiskCards: () => RiskCardData[];
  getOverdueRiskCards: () => RiskCardData[];
  getMeasuresByRiskId: (riskId: string) => RiskMeasure[];
  getRiskCountByLevel: () => { high: number; medium: number; low: number };
}

export const useRiskStore = create<RiskState>((set, get) => ({
  selectedBaseId: 'base-1',
  selectedLocationType: 'all',
  selectedLocationId: null,
  selectedRiskId: null,
  isDetailModalOpen: false,
  riskCards: INITIAL_RISK_CARDS,
  riskMeasures: INITIAL_RISK_MEASURES,
  preShiftForms: [],
  dailyRisks: [],
  trackingRecords: [],

  setSelectedBaseId: (id) => set({ selectedBaseId: id, selectedLocationId: null }),
  setSelectedLocationType: (type) => set({ selectedLocationType: type, selectedLocationId: null }),
  setSelectedLocationId: (id) => set({ selectedLocationId: id }),
  setSelectedRiskId: (id) => set({ selectedRiskId: id }),
  setIsDetailModalOpen: (open) => set({ isDetailModalOpen: open }),
  openRiskDetail: (riskId) => set({ selectedRiskId: riskId, isDetailModalOpen: true }),
  closeRiskDetail: () => set({ selectedRiskId: null, isDetailModalOpen: false }),

  addPreShiftForm: (form) =>
    set((state) => ({
      preShiftForms: [...state.preShiftForms, form],
    })),

  addDailyRisks: (risks) =>
    set((state) => ({
      dailyRisks: [...state.dailyRisks, ...risks],
    })),

  toggleDailyRisk: (riskId) =>
    set((state) => ({
      dailyRisks: state.dailyRisks.map((r) =>
        r.id === riskId ? { ...r, isChecked: !r.isChecked } : r
      ),
    })),

  addTrackingRecord: (record) =>
    set((state) => ({
      trackingRecords: [...state.trackingRecords, record],
    })),

  updateRiskStatus: (riskId, status) =>
    set((state) => ({
      riskCards: state.riskCards.map((r) =>
        r.id === riskId ? { ...r, status } : r
      ),
    })),

  getFilteredRiskCards: () => {
    const { riskCards, selectedBaseId, selectedLocationType, selectedLocationId } = get();

    return riskCards.filter((card) => {
      const location = LOCATIONS.find((l: { id: string }) => l.id === card.locationId);
      if (!location) return false;
      if (location.baseId !== selectedBaseId) return false;
      if (selectedLocationType !== 'all' && location.type !== selectedLocationType) return false;
      if (selectedLocationId && card.locationId !== selectedLocationId) return false;
      return true;
    });
  },

  getOverdueRiskCards: () => {
    return get().riskCards.filter((card) => card.isOverdue && card.status !== 'closed');
  },

  getMeasuresByRiskId: (riskId) => {
    return get().riskMeasures.filter((m) => m.riskId === riskId);
  },

  getRiskCountByLevel: () => {
    const cards = get().riskCards.filter((c) => c.status !== 'closed');
    return {
      high: cards.filter((c) => c.level === 'high').length,
      medium: cards.filter((c) => c.level === 'medium').length,
      low: cards.filter((c) => c.level === 'low').length,
    };
  },
}));
