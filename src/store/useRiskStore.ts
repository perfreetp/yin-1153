import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  RiskCardData,
  RiskMeasure,
  PreShiftFormData,
  DailyRisk,
  TrackingRecord,
  LocationType,
  RiskStatus,
} from '@/types';
import {
  INITIAL_RISK_CARDS,
  INITIAL_RISK_MEASURES,
  LOCATIONS,
  BASES,
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
  updateRiskStatus: (riskId: string, status: RiskStatus) => void;
  closeRisk: (riskId: string, handler: string, reviewResult: string) => void;

  getFilteredRiskCards: () => RiskCardData[];
  getOverdueRiskCards: (scoped?: boolean) => RiskCardData[];
  getMeasuresByRiskId: (riskId: string) => RiskMeasure[];
  getRiskCountByLevel: (scoped?: boolean) => { high: number; medium: number; low: number };
  getRecordsByRiskId: (riskId: string) => TrackingRecord[];

  getTeamSummary: () => Array<{
    team: string;
    baseId: string;
    locationType: LocationType;
    total: number;
    open: number;
    processing: number;
    closed: number;
    overdue: number;
    high: number;
  }>;

  getRisksByTeam: (team: string) => RiskCardData[];

  generateHandoverText: () => string;
}

export const useRiskStore = create<RiskState>()(
  persist(
    (set, get) => ({
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

      closeRisk: (riskId, handler, reviewResult) => {
        const now = new Date().toLocaleString('zh-CN');
        set((state) => ({
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? { ...r, status: 'closed' as RiskStatus, isOverdue: false }
              : r
          ),
          trackingRecords: [
            ...state.trackingRecords,
            {
              id: `rec-${riskId}-${Date.now()}`,
              riskId,
              handler,
              rectification: reviewResult,
              reviewResult: '已闭环确认',
              handledAt: now,
            },
          ],
        }));
      },

      getFilteredRiskCards: () => {
        const { riskCards, selectedBaseId, selectedLocationType, selectedLocationId } = get();

        return riskCards.filter((card) => {
          const location = LOCATIONS.find((l) => l.id === card.locationId);
          if (!location) return false;
          if (location.baseId !== selectedBaseId) return false;
          if (selectedLocationType !== 'all' && location.type !== selectedLocationType) return false;
          if (selectedLocationId && card.locationId !== selectedLocationId) return false;
          return true;
        });
      },

      getOverdueRiskCards: (scoped = true) => {
        const cards = scoped ? get().getFilteredRiskCards() : get().riskCards;
        return cards.filter((card) => card.isOverdue && card.status !== 'closed');
      },

      getMeasuresByRiskId: (riskId) => {
        return get().riskMeasures.filter((m) => m.riskId === riskId);
      },

      getRiskCountByLevel: (scoped = true) => {
        const cards = scoped
          ? get().getFilteredRiskCards().filter((c) => c.status !== 'closed')
          : get().riskCards.filter((c) => c.status !== 'closed');
        return {
          high: cards.filter((c) => c.level === 'high').length,
          medium: cards.filter((c) => c.level === 'medium').length,
          low: cards.filter((c) => c.level === 'low').length,
        };
      },

      getRecordsByRiskId: (riskId) => {
        return get().trackingRecords
          .filter((r) => r.riskId === riskId)
          .sort((a, b) => new Date(b.handledAt).getTime() - new Date(a.handledAt).getTime());
      },

      getTeamSummary: () => {
        const { riskCards, selectedBaseId, selectedLocationType } = get();
        const teamMap = new Map<string, {
          team: string;
          baseId: string;
          locationType: LocationType;
          total: number;
          open: number;
          processing: number;
          closed: number;
          overdue: number;
          high: number;
        }>();

        riskCards.forEach((card) => {
          const location = LOCATIONS.find((l) => l.id === card.locationId);
          if (!location) return;
          if (selectedBaseId && location.baseId !== selectedBaseId) return;
          if (selectedLocationType !== 'all' && location.type !== selectedLocationType) return;

          const key = `${card.team}-${location.type}`;
          if (!teamMap.has(key)) {
            teamMap.set(key, {
              team: card.team,
              baseId: location.baseId,
              locationType: location.type,
              total: 0,
              open: 0,
              processing: 0,
              closed: 0,
              overdue: 0,
              high: 0,
            });
          }

          const entry = teamMap.get(key)!;
          entry.total += 1;
          if (card.status === 'open') entry.open += 1;
          if (card.status === 'processing') entry.processing += 1;
          if (card.status === 'closed') entry.closed += 1;
          if (card.isOverdue && card.status !== 'closed') entry.overdue += 1;
          if (card.level === 'high') entry.high += 1;
        });

        return Array.from(teamMap.values()).sort((a, b) => {
          if (b.overdue !== a.overdue) return b.overdue - a.overdue;
          if (b.high !== a.high) return b.high - a.high;
          return b.open - a.open;
        });
      },

      getRisksByTeam: (team) => {
        const { riskCards, selectedBaseId, selectedLocationType } = get();
        return riskCards.filter((card) => {
          if (card.team !== team) return false;
          const location = LOCATIONS.find((l) => l.id === card.locationId);
          if (!location) return false;
          if (selectedBaseId && location.baseId !== selectedBaseId) return false;
          if (selectedLocationType !== 'all' && location.type !== selectedLocationType) return false;
          return true;
        }).sort((a, b) => {
          if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
          const levelOrder = { high: 0, medium: 1, low: 2 };
          return levelOrder[a.level] - levelOrder[b.level];
        });
      },

      generateHandoverText: () => {
        const { getFilteredRiskCards, getOverdueRiskCards, getMeasuresByRiskId } = get();
        const { selectedBaseId, selectedLocationType, selectedLocationId } = get();

        const base = BASES.find((b) => b.id === selectedBaseId);
        const location = selectedLocationId ? LOCATIONS.find((l) => l.id === selectedLocationId) : null;

        const locationTypeLabel =
          selectedLocationType === 'all' ? '全部区域' :
          selectedLocationType === 'hangar' ? '机库' :
          selectedLocationType === 'apron' ? '停机坪' : '航线维修';

        const allRisks = getFilteredRiskCards();
        const openRisks = allRisks.filter((r) => r.status !== 'closed');
        const overdueRisks = getOverdueRiskCards(true);
        const highRisks = openRisks.filter((r) => r.level === 'high');

        const teamMap = new Map<string, typeof openRisks>();
        openRisks.forEach((r) => {
          if (!teamMap.has(r.team)) teamMap.set(r.team, []);
          teamMap.get(r.team)!.push(r);
        });

        let text = '';
        text += '═══════════════════════════════════════════════\n';
        text += '           航 维 风 险 交 接 单\n';
        text += '═══════════════════════════════════════════════\n\n';
        text += `交接时间：${new Date().toLocaleString('zh-CN')}\n`;
        text += `基地：${base?.name || '全部基地'}\n`;
        text += `区域类型：${locationTypeLabel}\n`;
        if (location) text += `具体位置：${location.name}\n`;
        text += `\n───────────────────────────────────────────────\n`;
        text += '                 风险概览\n';
        text += '───────────────────────────────────────────────\n\n';
        text += `  未闭环风险总数：${openRisks.length} 项\n`;
        text += `  高风险：${highRisks.length} 项\n`;
        text += `  已超时：${overdueRisks.length} 项\n`;
        text += `  涉及班组：${teamMap.size} 个\n`;

        if (overdueRisks.length > 0) {
          text += `\n───────────────────────────────────────────────\n`;
          text += '               ⚠ 超时风险项\n';
          text += '───────────────────────────────────────────────\n\n';
          overdueRisks.forEach((r, i) => {
            const loc = LOCATIONS.find((l) => l.id === r.locationId);
            const typeLabel =
              r.type === 'high_altitude' ? '高空作业' :
              r.type === 'power_test' ? '通电测试' :
              r.type === 'fuel_operation' ? '燃油作业' :
              r.type === 'jacking' ? '顶升作业' : '拖机作业';
            text += `  ${i + 1}.【${typeLabel}】${r.aircraftNo || ''} - ${r.team}\n`;
            text += `     位置：${loc?.name || '-'}\n`;
            text += `     时限：${r.releaseDeadline} （已超时）\n`;
            const measures = getMeasuresByRiskId(r.id);
            const unclosed = measures.filter((m) => !m.isClosed);
            if (unclosed.length > 0) {
              text += `     未关闭措施（${unclosed.length}项）：\n`;
              unclosed.forEach((m) => {
                text += `       • ${m.content}\n`;
              });
            }
            text += '\n';
          });
        }

        text += `───────────────────────────────────────────────\n`;
        text += '               高风险项（未闭环）\n';
        text += '───────────────────────────────────────────────\n\n';

        if (highRisks.length === 0) {
          text += '  暂无高风险项\n\n';
        } else {
          highRisks.forEach((r, i) => {
            if (r.isOverdue) return;
            const loc = LOCATIONS.find((l) => l.id === r.locationId);
            const typeLabel =
              r.type === 'high_altitude' ? '高空作业' :
              r.type === 'power_test' ? '通电测试' :
              r.type === 'fuel_operation' ? '燃油作业' :
              r.type === 'jacking' ? '顶升作业' : '拖机作业';
            const statusLabel =
              r.status === 'open' ? '待处理' :
              r.status === 'processing' ? '处理中' : '已闭环';
            text += `  ${i + 1}.【${typeLabel}】${r.aircraftNo || ''} - ${r.team}\n`;
            text += `     状态：${statusLabel}　位置：${loc?.name || '-'}\n`;
            text += `     时限：${r.releaseDeadline}\n`;
            const measures = getMeasuresByRiskId(r.id);
            const unclosed = measures.filter((m) => !m.isClosed);
            if (unclosed.length > 0) {
              text += `     未关闭措施（${unclosed.length}项）：\n`;
              unclosed.forEach((m) => {
                text += `       • ${m.content}\n`;
              });
            }
            text += '\n';
          });
        }

        text += `───────────────────────────────────────────────\n`;
        text += '               各班组待处理汇总\n';
        text += '───────────────────────────────────────────────\n\n';

        teamMap.forEach((risks, team) => {
          const openCount = risks.filter((r) => r.status === 'open').length;
          const procCount = risks.filter((r) => r.status === 'processing').length;
          const overdueCount = risks.filter((r) => r.isOverdue).length;
          const highCount = risks.filter((r) => r.level === 'high').length;
          text += `  ▶ ${team}\n`;
          text += `     未闭环：${risks.length} 项（待处理 ${openCount} / 处理中 ${procCount}）\n`;
          text += `     高风险：${highCount} 项　超时：${overdueCount} 项\n\n`;
        });

        text += '═══════════════════════════════════════════════\n';
        text += '             交接确认：______________\n';
        text += '═══════════════════════════════════════════════\n';

        return text;
      },
    }),
    {
      name: 'mro-risk-board-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        riskCards: state.riskCards,
        preShiftForms: state.preShiftForms,
        dailyRisks: state.dailyRisks,
        trackingRecords: state.trackingRecords,
      }),
    }
  )
);
