export type RiskLevel = 'high' | 'medium' | 'low';
export type LocationType = 'hangar' | 'apron' | 'line';
export type RiskType = 'high_altitude' | 'power_test' | 'fuel_operation' | 'jacking' | 'towing';
export type RiskStatus = 'open' | 'processing' | 'closed';
export type EscalationLevel = 'none' | 'manager' | 'director';
export type HandoverStatus = 'pending' | 'confirmed';

export interface Base {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  baseId: string;
  type: LocationType;
  name: string;
}

export interface RiskCardData {
  id: string;
  locationId: string;
  type: RiskType;
  level: RiskLevel;
  team: string;
  releaseDeadline: string;
  status: RiskStatus;
  createdAt: string;
  isOverdue?: boolean;
  aircraftNo?: string;
  escalationLevel?: EscalationLevel;
  escalationAssignee?: string;
  escalatedAt?: string;
  sourceWorkCardNo?: string;
  sourceFormId?: string;
}

export interface RiskMeasure {
  id: string;
  riskId: string;
  content: string;
  isClosed: boolean;
}

export interface TrackingRecord {
  id: string;
  riskId: string;
  photoUrl?: string;
  rectification: string;
  reviewResult: string;
  handler: string;
  handledAt: string;
}

export interface PreShiftFormData {
  id: string;
  aircraftType: string;
  workCardNo: string;
  workerCount: number;
  specialTools: string[];
  weather: string;
  team: string;
  createdAt: string;
}

export interface DailyRisk {
  id: string;
  formId: string;
  description: string;
  level: RiskLevel;
  isChecked: boolean;
  promotedRiskId?: string;
}

export interface HandoverRecord {
  id: string;
  handoverPerson: string;
  receiverPerson: string;
  handoverTime: string;
  receivedRiskIds: string[];
  unreceivedRiskIds: string[];
  remarks: string;
  status: HandoverStatus;
  scopeBaseId: string;
  scopeLocationType: LocationType | 'all';
  scopeLocationId: string | null;
}

export interface RiskTypeMeta {
  key: RiskType;
  label: string;
  icon: string;
}

export interface LocationTypeMeta {
  key: LocationType;
  label: string;
  icon: string;
}
