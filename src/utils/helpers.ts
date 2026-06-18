import type { RiskLevel, RiskType, LocationType } from '@/types';
import { RISK_TYPE_META, LOCATION_TYPE_META } from '@/data/mockData';

export const getRiskLevelColor = (level: RiskLevel) => {
  switch (level) {
    case 'high':
      return {
        text: 'text-risk-high',
        bg: 'bg-risk-highBg',
        border: 'border-risk-high/50',
        cardClass: 'risk-card-high',
        shadow: 'shadow-risk-high',
      };
    case 'medium':
      return {
        text: 'text-risk-medium',
        bg: 'bg-risk-mediumBg',
        border: 'border-risk-medium/50',
        cardClass: 'risk-card-medium',
        shadow: 'shadow-risk-medium',
      };
    case 'low':
      return {
        text: 'text-risk-low',
        bg: 'bg-risk-lowBg',
        border: 'border-risk-low/50',
        cardClass: 'risk-card-low',
        shadow: 'shadow-risk-low',
      };
  }
};

export const getRiskLevelLabel = (level: RiskLevel) => {
  switch (level) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    case 'low':
      return '低风险';
  }
};

export const getRiskTypeLabel = (type: RiskType) => {
  const meta = RISK_TYPE_META.find((m) => m.key === type);
  return meta?.label || type;
};

export const getRiskTypeIcon = (type: RiskType) => {
  const meta = RISK_TYPE_META.find((m) => m.key === type);
  return meta?.icon || 'AlertTriangle';
};

export const getLocationTypeLabel = (type: LocationType) => {
  const meta = LOCATION_TYPE_META.find((m) => m.key === type);
  return meta?.label || type;
};

export const getLocationTypeIcon = (type: LocationType) => {
  const meta = LOCATION_TYPE_META.find((m) => m.key === type);
  return meta?.icon || 'MapPin';
};

export const getStatusLabel = (status: 'open' | 'processing' | 'closed') => {
  switch (status) {
    case 'open':
      return '待处理';
    case 'processing':
      return '处理中';
    case 'closed':
      return '已闭环';
  }
};

export const getStatusColor = (status: 'open' | 'processing' | 'closed') => {
  switch (status) {
    case 'open':
      return 'bg-risk-highBg text-risk-high';
    case 'processing':
      return 'bg-risk-mediumBg text-risk-medium';
    case 'closed':
      return 'bg-risk-lowBg text-risk-low';
  }
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

export const formatDateTime = (dateStr: string) => {
  return dateStr;
};

export const generateDailyRisks = (
  formId: string,
  aircraftType: string,
  workerCount: number,
  specialTools: string[],
  weather: string
) => {
  const risks: Array<{ description: string; level: RiskLevel }> = [];

  if (specialTools.includes('顶升设备')) {
    risks.push({ description: '顶升作业：检查顶升点及设备状态', level: 'high' });
    risks.push({ description: '顶升区域周围必须设置警示标识', level: 'medium' });
  }

  if (specialTools.includes('液压车')) {
    risks.push({ description: '液压设备管路检查，防止泄漏', level: 'medium' });
  }

  if (specialTools.includes('工作平台') || specialTools.includes('梯架')) {
    risks.push({ description: '高空作业：必须佩戴安全带', level: 'high' });
    risks.push({ description: '检查工作平台防滑及护栏', level: 'medium' });
  }

  if (workerCount >= 5) {
    risks.push({ description: '多人协同作业：明确联络方式及责任人', level: 'medium' });
  }

  if (weather.includes('雨') || weather.includes('雷')) {
    risks.push({ description: '雷雨天气：暂停户外通电及高空作业', level: 'high' });
  }

  if (weather.includes('大风')) {
    risks.push({ description: '大风天气：注意高空坠物风险', level: 'high' });
  }

  if (weather.includes('雾')) {
    risks.push({ description: '低能见度：拖机及滑行作业谨慎进行', level: 'medium' });
  }

  if (weather.includes('高温')) {
    risks.push({ description: '高温作业：注意人员防暑降温', level: 'medium' });
  }

  if (aircraftType.includes('B787') || aircraftType.includes('A350')) {
    risks.push({ description: '复合材料区域作业：使用专用工具', level: 'medium' });
  }

  if (risks.length === 0) {
    risks.push({ description: '标准维修作业：按工卡程序执行', level: 'low' });
  }

  return risks.map((r, idx) => ({
    id: `dr-${formId}-${idx}`,
    formId,
    description: r.description,
    level: r.level,
    isChecked: false,
  }));
};
