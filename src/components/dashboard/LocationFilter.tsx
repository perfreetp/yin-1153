import { useRiskStore } from '@/store/useRiskStore';
import { BASES, LOCATIONS, LOCATION_TYPE_META } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { LocationType } from '@/types';
import { Building2, MapPin, Route, LayoutGrid } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  MapPin,
  Route,
};

export default function LocationFilter() {
  const {
    selectedBaseId,
    selectedLocationType,
    selectedLocationId,
    setSelectedBaseId,
    setSelectedLocationType,
    setSelectedLocationId,
  } = useRiskStore();

  const filteredLocations = LOCATIONS.filter(
    (loc) =>
      loc.baseId === selectedBaseId &&
      (selectedLocationType === 'all' || loc.type === selectedLocationType)
  );

  const allLocationsForBase = LOCATIONS.filter((loc) => loc.baseId === selectedBaseId);

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-xl p-5 space-y-5">
      <div>
        <label className="block text-sm font-medium text-dashboard-muted mb-2">
          选择基地
        </label>
        <select
          value={selectedBaseId}
          onChange={(e) => setSelectedBaseId(e.target.value)}
          className="input-field"
        >
          {BASES.map((base) => (
            <option key={base.id} value={base.id}>
              {base.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-dashboard-muted mb-2">
          维修区域
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedLocationType('all')}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200',
              selectedLocationType === 'all'
                ? 'bg-accent-blue/20 border-accent-blue text-white'
                : 'bg-dashboard-card border-dashboard-border text-dashboard-muted hover:border-accent-blue/50 hover:text-white'
            )}
          >
            <LayoutGrid size={20} />
            <span className="text-xs font-medium">全部</span>
          </button>
          {LOCATION_TYPE_META.map((meta) => {
            const Icon = iconMap[meta.icon] || MapPin;
            return (
              <button
                key={meta.key}
                onClick={() => setSelectedLocationType(meta.key as LocationType)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200',
                  selectedLocationType === meta.key
                    ? 'bg-accent-blue/20 border-accent-blue text-white'
                    : 'bg-dashboard-card border-dashboard-border text-dashboard-muted hover:border-accent-blue/50 hover:text-white'
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dashboard-muted mb-2">
          机位/机库
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedLocationId(null)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg border text-sm transition-all duration-200',
              selectedLocationId === null
                ? 'bg-accent-blue/20 border-accent-blue text-white'
                : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
            )}
          >
            全部位置
            <span className="ml-2 text-xs text-dashboard-muted">
              ({allLocationsForBase.length} 个)
            </span>
          </button>
          {filteredLocations.map((loc) => {
            const meta = LOCATION_TYPE_META.find((m) => m.key === loc.type);
            const Icon = iconMap[meta?.icon || 'MapPin'] || MapPin;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg border text-sm transition-all duration-200 flex items-center gap-2',
                  selectedLocationId === loc.id
                    ? 'bg-accent-blue/20 border-accent-blue text-white'
                    : 'bg-dashboard-card border-dashboard-border text-dashboard-text hover:border-accent-blue/50'
                )}
              >
                <Icon size={16} className="text-dashboard-muted" />
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
