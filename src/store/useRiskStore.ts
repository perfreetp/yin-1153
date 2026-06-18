import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  RiskCardData,
  RiskMeasure,
  PreShiftFormData,
  DailyRisk,
  TrackingRecord,
  HandoverRecord,
  LocationType,
  RiskStatus,
  EscalationLevel,
} from '@/types';
import {
  INITIAL_RISK_CARDS,
  INITIAL_RISK_MEASURES,
  LOCATIONS,
  BASES,
} from '@/data/mockData';

const QUALIFIED_RESULTS = ['整改合格', '基本合格需跟进'];
const ESCALATION_THRESHOLD_HOURS = 2;

export function isReviewQualified(reviewResult: string): boolean {
  return QUALIFIED_RESULTS.some((q) => reviewResult.includes(q));
}

export function getEscalationLevel(
  isOverdue: boolean | undefined,
  releaseDeadline: string,
  status: RiskStatus,
  currentLevel: EscalationLevel = 'none'
): EscalationLevel {
  if (status === 'closed') return 'none';
  if (!isOverdue) return currentLevel === 'none' ? 'none' : currentLevel;
  const deadline = new Date(releaseDeadline.replace(/-/g, '/')).getTime();
  if (Number.isNaN(deadline)) return currentLevel === 'none' ? 'manager' : currentLevel;
  const diffHours = (Date.now() - deadline) / (1000 * 60 * 60);
  if (diffHours >= ESCALATION_THRESHOLD_HOURS * 2) return 'director';
  if (diffHours >= ESCALATION_THRESHOLD_HOURS) return 'manager';
  return currentLevel === 'none' ? 'none' : currentLevel;
}

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
  handoverRecords: HandoverRecord[];

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
  promoteDailyRiskToTracking: (riskId: string) => string | null;

  addTrackingRecord: (record: TrackingRecord) => void;
  updateRiskStatus: (riskId: string, status: RiskStatus) => void;
  closeRisk: (riskId: string, handler: string, reviewResult: string) => void;
  submitTracking: (
    riskId: string,
    payload: { rectification: string; reviewResult: string; handler: string; photoUrl?: string }
  ) => RiskStatus;

  escalateRisk: (riskId: string, level: EscalationLevel, assignee: string, operator: string, note?: string) => void;
  reassignEscalation: (riskId: string, assignee: string, operator: string, note?: string) => void;

  confirmHandover: (payload: {
    handoverPerson: string;
    receiverPerson: string;
    receivedRiskIds: string[];
    remarks: string;
  }) => string;
  getHandoverRecords: (scoped?: boolean) => HandoverRecord[];
  getHandoverRecordById: (id: string) => HandoverRecord | undefined;
  supplementaryHandoverReceive: (recordId: string, riskIds: string[], operator: string, note?: string) => void;

  getFilteredRiskCards: () => RiskCardData[];
  getOverdueRiskCards: (scoped?: boolean) => RiskCardData[];
  getEscalatedRiskCards: (scoped?: boolean) => RiskCardData[];
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
    escalated: number;
  }>;

  getRisksByTeam: (team: string, locationType?: LocationType) => RiskCardData[];

  getPreShiftFormById: (formId: string) => PreShiftFormData | undefined;
  getDailyRisksByFormId: (formId: string) => DailyRisk[];
  getRiskBySourceFormId: (formId: string) => RiskCardData[];

  generateHandoverText: () => string;
  generateReviewHandoverText: () => string;
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
      handoverRecords: [],

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

      promoteDailyRiskToTracking: (riskId) => {
        const state = get();
        const daily = state.dailyRisks.find((r) => r.id === riskId);
        if (!daily) return null;
        if (daily.promotedRiskId) return daily.promotedRiskId;
        const form = state.preShiftForms.find((f) => f.id === daily.formId);
        if (!form) return null;

        const newId = `risk-${Date.now()}`;
        const now = new Date();
        const deadline = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

        const typeMap: Record<string, RiskCardData['type']> = {
          高空: 'high_altitude',
          通电: 'power_test',
          燃油: 'fuel_operation',
          顶升: 'jacking',
          拖机: 'towing',
        };
        const matchedType = (Object.keys(typeMap).find((k) => daily.description.includes(k)) || 'power_test') as RiskCardData['type'];

        const fallbackLocation =
          LOCATIONS.find((l) => l.baseId === state.selectedBaseId && l.type === 'hangar') ||
          LOCATIONS.find((l) => l.baseId === state.selectedBaseId) ||
          LOCATIONS[0];

        const newCard: RiskCardData = {
          id: newId,
          locationId: fallbackLocation?.id || 'loc-1',
          type: matchedType,
          level: daily.level,
          team: form.team,
          releaseDeadline: fmt(deadline),
          status: 'open',
          createdAt: fmt(now),
          isOverdue: false,
          sourceWorkCardNo: form.workCardNo,
          sourceFormId: form.id,
        };

        set((s) => ({
          riskCards: [...s.riskCards, newCard],
          dailyRisks: s.dailyRisks.map((r) =>
            r.id === riskId ? { ...r, promotedRiskId: newId } : r
          ),
        }));
        return newId;
      },

      addTrackingRecord: (record) =>
        set((state) => ({
          trackingRecords: [...state.trackingRecords, record],
        })),

      updateRiskStatus: (riskId, status) =>
        set((state) => ({
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? {
                  ...r,
                  status,
                  isOverdue: status === 'closed' ? false : r.isOverdue,
                  escalationLevel: status === 'closed' ? 'none' : r.escalationLevel,
                }
              : r
          ),
        })),

      closeRisk: (riskId, handler, reviewResult) => {
        const now = new Date().toLocaleString('zh-CN');
        set((state) => ({
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? {
                  ...r,
                  status: 'closed' as RiskStatus,
                  isOverdue: false,
                  escalationLevel: 'none' as EscalationLevel,
                }
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

      submitTracking: (riskId, payload) => {
        const now = new Date().toLocaleString('zh-CN');
        const qualified = isReviewQualified(payload.reviewResult);
        const nextStatus: RiskStatus = qualified ? 'closed' : 'processing';

        set((state) => ({
          trackingRecords: [
            ...state.trackingRecords,
            {
              id: `rec-${riskId}-${Date.now()}`,
              riskId,
              rectification: payload.rectification,
              reviewResult: payload.reviewResult,
              handler: payload.handler,
              photoUrl: payload.photoUrl,
              handledAt: now,
            },
          ],
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? {
                  ...r,
                  status: nextStatus,
                  isOverdue: nextStatus === 'closed' ? false : r.isOverdue,
                  escalationLevel: nextStatus === 'closed' ? ('none' as EscalationLevel) : r.escalationLevel,
                }
              : r
          ),
        }));
        return nextStatus;
      },

      escalateRisk: (riskId, level, assignee, operator, note) => {
        const now = new Date().toLocaleString('zh-CN');
        const levelLabel = level === 'manager' ? '值班经理' : '质量安全主管';
        const historyEntry = {
          id: `eh-${Date.now()}`,
          level,
          assignee,
          operator,
          time: now,
          note,
        };
        set((state) => ({
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? {
                  ...r,
                  escalationLevel: level,
                  escalationAssignee: assignee,
                  escalatedAt: now,
                  escalationHistory: [...(r.escalationHistory || []), historyEntry],
                }
              : r
          ),
          trackingRecords: [
            ...state.trackingRecords,
            {
              id: `rec-${riskId}-esc-${Date.now()}`,
              riskId,
              handler: operator,
              rectification: `责任升级至${levelLabel}：${assignee}${note ? '（' + note + '）' : ''}`,
              reviewResult: `已升级至${levelLabel}跟进`,
              handledAt: now,
            },
          ],
        }));
      },

      reassignEscalation: (riskId, assignee, operator, note) => {
        const now = new Date().toLocaleString('zh-CN');
        const risk = get().riskCards.find((r) => r.id === riskId);
        if (!risk || !risk.escalationLevel || risk.escalationLevel === 'none') return;
        const levelLabel = risk.escalationLevel === 'manager' ? '值班经理' : '质量安全主管';
        const historyEntry = {
          id: `eh-${Date.now()}`,
          level: risk.escalationLevel,
          assignee,
          operator,
          time: now,
          note: note || '改派跟进人',
        };
        set((state) => ({
          riskCards: state.riskCards.map((r) =>
            r.id === riskId
              ? {
                  ...r,
                  escalationAssignee: assignee,
                  escalationHistory: [...(r.escalationHistory || []), historyEntry],
                }
              : r
          ),
          trackingRecords: [
            ...state.trackingRecords,
            {
              id: `rec-${riskId}-reassign-${Date.now()}`,
              riskId,
              handler: operator,
              rectification: `${levelLabel}跟进人改派：${assignee}${note ? '（' + note + '）' : ''}`,
              reviewResult: `改派至${assignee}跟进`,
              handledAt: now,
            },
          ],
        }));
      },

      confirmHandover: (payload) => {
        const { getFilteredRiskCards } = get();
        const openRisks = getFilteredRiskCards().filter((r) => r.status !== 'closed');
        const allIds = openRisks.map((r) => r.id);
        const receivedSet = new Set(payload.receivedRiskIds);
        const unreceivedIds = allIds.filter((id) => !receivedSet.has(id));
        const now = new Date().toLocaleString('zh-CN');
        const { selectedBaseId, selectedLocationType, selectedLocationId } = get();

        const record: HandoverRecord = {
          id: `hv-${Date.now()}`,
          handoverPerson: payload.handoverPerson,
          receiverPerson: payload.receiverPerson,
          handoverTime: now,
          receivedRiskIds: payload.receivedRiskIds,
          unreceivedRiskIds: unreceivedIds,
          remarks: payload.remarks,
          status: 'confirmed',
          scopeBaseId: selectedBaseId,
          scopeLocationType: selectedLocationType,
          scopeLocationId: selectedLocationId,
        };

        set((state) => ({
          handoverRecords: [...state.handoverRecords, record],
        }));
        return record.id;
      },

      getHandoverRecords: (scoped = true) => {
        const { handoverRecords, selectedBaseId, selectedLocationType, selectedLocationId } = get();
        if (!scoped) return handoverRecords;
        return handoverRecords.filter((r) => {
          if (r.scopeBaseId !== selectedBaseId) return false;
          if (selectedLocationType !== 'all' && r.scopeLocationType !== selectedLocationType) return false;
          if (selectedLocationId && r.scopeLocationId !== selectedLocationId) return false;
          return true;
        });
      },

      getHandoverRecordById: (id) => {
        return get().handoverRecords.find((r) => r.id === id);
      },

      supplementaryHandoverReceive: (recordId, riskIds, operator, note) => {
        if (riskIds.length === 0) return;
        const now = new Date().toLocaleString('zh-CN');
        const supRec = {
          id: `sup-${Date.now()}`,
          riskIds,
          operator,
          time: now,
          note,
        };
        set((state) => ({
          handoverRecords: state.handoverRecords.map((r) => {
            if (r.id !== recordId) return r;
            const receivedSet = new Set(r.receivedRiskIds);
            riskIds.forEach((id) => receivedSet.add(id));
            const newUnreceived = r.unreceivedRiskIds.filter((id) => !receivedSet.has(id));
            return {
              ...r,
              receivedRiskIds: Array.from(receivedSet),
              unreceivedRiskIds: newUnreceived,
              supplementaryRecords: [...(r.supplementaryRecords || []), supRec],
            };
          }),
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

      getEscalatedRiskCards: (scoped = true) => {
        const cards = scoped ? get().getFilteredRiskCards() : get().riskCards;
        return cards.filter(
          (card) => card.status !== 'closed' && card.escalationLevel && card.escalationLevel !== 'none'
        );
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
          escalated: number;
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
              escalated: 0,
            });
          }

          const entry = teamMap.get(key)!;
          entry.total += 1;
          if (card.status === 'open') entry.open += 1;
          if (card.status === 'processing') entry.processing += 1;
          if (card.status === 'closed') entry.closed += 1;
          if (card.isOverdue && card.status !== 'closed') entry.overdue += 1;
          if (card.level === 'high' && card.status !== 'closed') entry.high += 1;
          if (card.escalationLevel && card.escalationLevel !== 'none' && card.status !== 'closed') entry.escalated += 1;
        });

        return Array.from(teamMap.values()).sort((a, b) => {
          if (b.overdue !== a.overdue) return b.overdue - a.overdue;
          if (b.escalated !== a.escalated) return b.escalated - a.escalated;
          if (b.high !== a.high) return b.high - a.high;
          return b.open - a.open;
        });
      },

      getRisksByTeam: (team, locationType) => {
        const { riskCards, selectedBaseId, selectedLocationType } = get();
        const effectiveLocationType = locationType ?? selectedLocationType;
        return riskCards.filter((card) => {
          if (card.team !== team) return false;
          const location = LOCATIONS.find((l) => l.id === card.locationId);
          if (!location) return false;
          if (selectedBaseId && location.baseId !== selectedBaseId) return false;
          if (effectiveLocationType !== 'all' && location.type !== effectiveLocationType) return false;
          return true;
        }).sort((a, b) => {
          if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
          const levelOrder = { high: 0, medium: 1, low: 2 };
          return levelOrder[a.level] - levelOrder[b.level];
        });
      },

      getPreShiftFormById: (formId) => {
        return get().preShiftForms.find((f) => f.id === formId);
      },

      getDailyRisksByFormId: (formId) => {
        return get().dailyRisks.filter((r) => r.formId === formId);
      },

      getRiskBySourceFormId: (formId) => {
        return get().riskCards.filter((r) => r.sourceFormId === formId);
      },

      generateHandoverText: () => {
        const { getFilteredRiskCards, getOverdueRiskCards, getEscalatedRiskCards, getMeasuresByRiskId } = get();
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
        const escalatedRisks = getEscalatedRiskCards(true);
        const highRisks = openRisks.filter((r) => r.level === 'high');

        const teamMap = new Map<string, typeof openRisks>();
        openRisks.forEach((r) => {
          if (!teamMap.has(r.team)) teamMap.set(r.team, []);
          teamMap.get(r.team)!.push(r);
        });

        const cardLine = (r: RiskCardData, indent: string) => {
          const loc = LOCATIONS.find((l) => l.id === r.locationId);
          const typeLabel =
            r.type === 'high_altitude' ? '高空作业' :
            r.type === 'power_test' ? '通电测试' :
            r.type === 'fuel_operation' ? '燃油作业' :
            r.type === 'jacking' ? '顶升作业' : '拖机作业';
          const escLabel = r.escalationLevel === 'manager' ? '【已升级·值班经理】' :
            r.escalationLevel === 'director' ? '【已升级·质量安全主管】' : '';
          const wcLabel = r.sourceWorkCardNo ? ` 工卡:${r.sourceWorkCardNo}` : '';
          return `${indent}【${typeLabel}】${r.aircraftNo || ''}${wcLabel} - ${r.team}${escLabel}\n${indent}位置：${loc?.name || '-'}　时限：${r.releaseDeadline}${r.isOverdue ? '（已超时）' : ''}\n`;
        };

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
        text += `  已升级：${escalatedRisks.length} 项\n`;
        text += `  涉及班组：${teamMap.size} 个\n`;

        if (escalatedRisks.length > 0) {
          text += `\n───────────────────────────────────────────────\n`;
          text += '            ⬆ 责任升级项\n';
          text += '───────────────────────────────────────────────\n\n';
          escalatedRisks.forEach((r, i) => {
            const escName = r.escalationLevel === 'manager' ? '值班经理' : '质量安全主管';
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
            text += `     升级跟进：${escName} - ${r.escalationAssignee || '-'}（${r.escalatedAt || '-'}）\n`;
            text += '\n';
          });
        }

        if (overdueRisks.length > 0) {
          text += `\n───────────────────────────────────────────────\n`;
          text += '               ⚠ 超时风险项\n';
          text += '───────────────────────────────────────────────\n\n';
          overdueRisks.forEach((r, i) => {
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
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
          let idx = 0;
          highRisks.forEach((r) => {
            if (r.isOverdue) return;
            idx += 1;
            const statusLabel =
              r.status === 'open' ? '待处理' :
              r.status === 'processing' ? '处理中' : '已闭环';
            text += `  ${idx}. ${cardLine(r, '     ')}`;
            text += `     状态：${statusLabel}\n`;
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
          const overdueCount = risks.filter((r) => r.isOverdue && r.status !== 'closed').length;
          const highCount = risks.filter((r) => r.level === 'high').length;
          const escCount = risks.filter((r) => r.escalationLevel && r.escalationLevel !== 'none').length;
          const wcSet = new Set(
            risks.map((r) => r.sourceWorkCardNo).filter(Boolean) as string[]
          );
          text += `  ▶ ${team}\n`;
          text += `     未闭环：${risks.length} 项（待处理 ${openCount} / 处理中 ${procCount}）\n`;
          text += `     高风险：${highCount} 项　超时：${overdueCount} 项　已升级：${escCount} 项\n`;
          if (wcSet.size > 0) {
            text += `     关联工卡：${Array.from(wcSet).join('、')}\n`;
          }
          text += '\n';
        });

        text += '═══════════════════════════════════════════════\n';
        text += '             交接确认：______________\n';
        text += '═══════════════════════════════════════════════\n';

        return text;
      },

      generateReviewHandoverText: () => {
        const { getFilteredRiskCards, getOverdueRiskCards, getEscalatedRiskCards, getMeasuresByRiskId, getRecordsByRiskId } = get();
        const { selectedBaseId, selectedLocationType, selectedLocationId, preShiftForms, dailyRisks } = get();

        const base = BASES.find((b) => b.id === selectedBaseId);
        const location = selectedLocationId ? LOCATIONS.find((l) => l.id === selectedLocationId) : null;

        const locationTypeLabel =
          selectedLocationType === 'all' ? '全部区域' :
          selectedLocationType === 'hangar' ? '机库' :
          selectedLocationType === 'apron' ? '停机坪' : '航线维修';

        const allRisks = getFilteredRiskCards();
        const openRisks = allRisks.filter((r) => r.status !== 'closed');
        const closedRisks = allRisks.filter((r) => r.status === 'closed');
        const overdueRisks = getOverdueRiskCards(true);
        const escalatedRisks = getEscalatedRiskCards(true);
        const highRisks = openRisks.filter((r) => r.level === 'high');

        const todayStr = new Date().toLocaleDateString('zh-CN');
        const todayNewRisks = openRisks.filter((r) => r.createdAt.startsWith(todayStr));
        const todayClosed = closedRisks.filter((r) => {
          const records = getRecordsByRiskId(r.id);
          return records.length > 0 && records.some((rec) => rec.handledAt.startsWith(todayStr));
        });

        const todayForms = preShiftForms.filter((f) => f.createdAt.startsWith(todayStr));
        const newPromotedIds = new Set<string>();
        todayForms.forEach((f) => {
          const risks = dailyRisks.filter((d) => d.formId === f.id && d.promotedRiskId);
          risks.forEach((r) => r.promotedRiskId && newPromotedIds.add(r.promotedRiskId));
        });
        const newPromotedRisks = openRisks.filter((r) => newPromotedIds.has(r.id));

        const cardLine = (r: RiskCardData, indent: string) => {
          const loc = LOCATIONS.find((l) => l.id === r.locationId);
          const typeLabel =
            r.type === 'high_altitude' ? '高空作业' :
            r.type === 'power_test' ? '通电测试' :
            r.type === 'fuel_operation' ? '燃油作业' :
            r.type === 'jacking' ? '顶升作业' : '拖机作业';
          const escLabel = r.escalationLevel === 'manager' ? '【已升级·值班经理】' :
            r.escalationLevel === 'director' ? '【已升级·质量安全主管】' : '';
          const wcLabel = r.sourceWorkCardNo ? ` 工卡:${r.sourceWorkCardNo}` : '';
          const statusLabel = r.status === 'open' ? '【待处理】' : r.status === 'processing' ? '【处理中】' : '【已闭环】';
          return `${indent}${statusLabel}【${typeLabel}】${r.aircraftNo || ''}${wcLabel} - ${r.team}${escLabel}\n${indent}位置：${loc?.name || '-'}　时限：${r.releaseDeadline}${r.isOverdue ? '（已超时）' : ''}\n`;
        };

        let text = '';
        text += '═══════════════════════════════════════════════\n';
        text += '         航 维 风 险 交 接 复 盘 版\n';
        text += '═══════════════════════════════════════════════\n\n';
        text += `报告时间：${new Date().toLocaleString('zh-CN')}\n`;
        text += `基地：${base?.name || '全部基地'}\n`;
        text += `区域类型：${locationTypeLabel}\n`;
        if (location) text += `具体位置：${location.name}\n`;
        text += `\n───────────────────────────────────────────────\n`;
        text += '                一、总体概览\n';
        text += '───────────────────────────────────────────────\n\n';
        text += `  风险总数：${allRisks.length} 项\n`;
        text += `  未闭环：${openRisks.length} 项（待处理 ${allRisks.filter(r => r.status === 'open').length} / 处理中 ${allRisks.filter(r => r.status === 'processing').length}）\n`;
        text += `  已闭环：${closedRisks.length} 项\n`;
        text += `  高风险：${highRisks.length} 项　已超时：${overdueRisks.length} 项　已升级：${escalatedRisks.length} 项\n`;
        text += `  当班新转入：${newPromotedRisks.length} 项　当班已闭环：${todayClosed.length} 项\n`;

        if (escalatedRisks.length > 0) {
          text += `\n───────────────────────────────────────────────\n`;
          text += '            二、⬆ 责任升级项（需重点关注）\n';
          text += '───────────────────────────────────────────────\n\n';
          escalatedRisks.forEach((r, i) => {
            const escName = r.escalationLevel === 'manager' ? '值班经理' : '质量安全主管';
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
            text += `     升级跟进：${escName} - ${r.escalationAssignee || '-'}（${r.escalatedAt || '-'}）\n`;
            text += '\n';
          });
        }

        if (overdueRisks.length > 0) {
          text += `───────────────────────────────────────────────\n`;
          text += '               三、⚠ 超时风险项\n';
          text += '───────────────────────────────────────────────\n\n';
          overdueRisks.forEach((r, i) => {
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
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

        if (newPromotedRisks.length > 0) {
          text += `───────────────────────────────────────────────\n`;
          text += '            四、🆕 当班新转入风险\n';
          text += '───────────────────────────────────────────────\n\n';
          newPromotedRisks.forEach((r, i) => {
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
            text += `     来源：班前确认工卡 ${r.sourceWorkCardNo || '未知'}\n`;
            text += '\n';
          });
        }

        if (todayClosed.length > 0) {
          text += `───────────────────────────────────────────────\n`;
          text += '            五、✅ 当班已闭环风险\n';
          text += '───────────────────────────────────────────────\n\n';
          todayClosed.forEach((r, i) => {
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
            text += '\n';
          });
        }

        const unreceivedFromLast = (() => {
          const lastRecord = get().getHandoverRecords(true).slice(-1)[0];
          if (!lastRecord) return [];
          return openRisks.filter((r) => lastRecord.unreceivedRiskIds.includes(r.id));
        })();

        if (unreceivedFromLast.length > 0) {
          text += `───────────────────────────────────────────────\n`;
          text += '          六、📋 上一班未接收项（需跟进）\n';
          text += '───────────────────────────────────────────────\n\n';
          unreceivedFromLast.forEach((r, i) => {
            text += `  ${i + 1}. ${cardLine(r, '     ')}`;
            text += '\n';
          });
        }

        text += '═══════════════════════════════════════════════\n';
        text += '   晨会要点：高风险 ' + highRisks.length + ' 项　升级 ' + escalatedRisks.length + ' 项　超时 ' + overdueRisks.length + ' 项\n';
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
        handoverRecords: state.handoverRecords,
      }),
    }
  )
);
