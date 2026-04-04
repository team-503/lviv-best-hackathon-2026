import { MapPin, Warehouse, AlertTriangle } from 'lucide-react';

const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const VEHICLE_NAMES = ['Truck-01', 'Truck-02', 'Truck-03', 'Truck-04'];

interface MapLegendProps {
  showSimLegend?: boolean;
}

export function MapLegend({ showSimLegend = false }: MapLegendProps) {
  return (
    <div className="absolute bottom-6 left-3 z-[400] rounded-lg border bg-card/95 backdrop-blur-sm p-3 shadow-md">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Легенда</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-indigo-500/15">
            <Warehouse className="size-3 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xs">Склад</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-primary/15">
            <MapPin className="size-3 text-primary" />
          </div>
          <span className="text-xs">Точка доставки</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-destructive/15">
            <AlertTriangle className="size-3 text-destructive" />
          </div>
          <span className="text-xs">Критичний запит</span>
        </div>

        {showSimLegend && (
          <>
            <div className="border-t my-1" />
            {ROUTE_COLORS.map((color, i) => (
              <div key={color} className="flex items-center gap-2">
                <div className="w-5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-xs">{VEHICLE_NAMES[i]}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
