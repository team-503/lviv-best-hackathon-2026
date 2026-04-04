import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CriticalityBadge } from '@/components/ui/criticality-badge';
import type { MapPoint } from '@/types/api';
import { MapPin, Warehouse, Package, Route, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleRoute, setAllRoutes, clearRoutes } from '@/store/slices/uiSlice';
import type { CriticalityLevel } from '@/data/mockData';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';

// ─── Points List ───
function PointCard({
  point,
  onSelect,
  onOpen,
  onHover,
  onHoverEnd,
}: {
  point: MapPoint;
  onSelect: () => void;
  onOpen: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}) {
  const isWarehouse = point.type === 'warehouse';

  return (
    <div
      className="rounded-lg border bg-card hover:bg-muted/30 transition-colors"
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <button
        className="w-full text-left p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        onClick={onSelect}
      >
        <div className="flex items-start gap-2">
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-md mt-0.5 ${
              isWarehouse ? 'bg-indigo-500/15' : 'bg-primary/15'
            }`}
          >
            {isWarehouse ? (
              <Warehouse className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <MapPin className="size-3.5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{point.name}</p>
          </div>
        </div>
      </button>

      <div className="px-3 pb-2 -mt-1 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <ExternalLink className="size-3" data-icon="inline-start" />
          Відкрити
        </Button>
      </div>
    </div>
  );
}

function PointsTab({
  onSelectPoint,
  onOpenPoint,
  onHoverPoint,
}: {
  onSelectPoint: (id: number) => void;
  onOpenPoint: (id: number, type: 'warehouse' | 'point') => void;
  onHoverPoint?: (id: number | null) => void;
}) {
  const points = useAppSelector((s) => s.mapPoints.points);
  const warehouses = points.filter((p) => p.type === 'warehouse');
  const deliveryPoints = points.filter((p) => p.type === 'point');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Warehouse className="size-4 text-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Склади ({warehouses.length})
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {warehouses.map((p) => (
            <PointCard
              key={p.id}
              point={p}
              onSelect={() => onSelectPoint(p.id)}
              onOpen={() => onOpenPoint(p.id, 'warehouse')}
              onHover={() => onHoverPoint?.(p.id)}
              onHoverEnd={() => onHoverPoint?.(null)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Точки доставки ({deliveryPoints.length})
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {deliveryPoints.map((p) => (
            <PointCard
              key={p.id}
              point={p}
              onSelect={() => onSelectPoint(p.id)}
              onOpen={() => onOpenPoint(p.id, 'point')}
              onHover={() => onHoverPoint?.(p.id)}
              onHoverEnd={() => onHoverPoint?.(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Requests Tab ───
const CRITICALITY_ORDER: CriticalityLevel[] = ['urgent', 'critical', 'high', 'medium', 'normal'];

function RequestsTab() {
  const requests = useAppSelector((s) => s.requests.requests);
  const points = useAppSelector((s) => s.mapPoints.points);
  const products = useAppSelector((s) => s.products.products);
  const sorted = [...requests].sort(
    (a, b) =>
      CRITICALITY_ORDER.indexOf(a.criticality as CriticalityLevel) - CRITICALITY_ORDER.indexOf(b.criticality as CriticalityLevel),
  );

  const statusIcon = {
    pending: <Clock className="size-3 text-muted-foreground" />,
    planned: <CheckCircle2 className="size-3 text-primary" />,
    completed: <CheckCircle2 className="size-3 text-emerald-500" />,
  };

  const statusLabel: Record<string, string> = { pending: 'Очікує', planned: 'Заплановано', completed: 'Виконано' };

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((r) => {
        const point = points.find((p) => String(p.id) === r.pointId);
        const product = products.find((p) => String(p.id) === r.productId);
        return (
          <div key={r.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium leading-tight">{point?.name}</p>
              <CriticalityBadge level={r.criticality as CriticalityLevel} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Package className="size-3" />
              <span>
                {product?.name} — {r.quantity.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {statusIcon[r.status as keyof typeof statusIcon]}
              <span>{statusLabel[r.status]}</span>
              <span className="ml-auto">
                {new Date(r.createdAt).toLocaleTimeString('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Plan Tab ───
function PlanTab() {
  const dispatch = useAppDispatch();
  const activeRouteIds = useAppSelector((s) => s.ui.activeRouteIds);
  const { plan, vehicles } = useAppSelector((s) => s.plan);
  const requests = useAppSelector((s) => s.requests.requests);
  const points = useAppSelector((s) => s.mapPoints.points);
  const products = useAppSelector((s) => s.products.products);

  const allIds = plan.routes.map((r) => r.vehicleId);
  const allExpanded = allIds.length > 0 && allIds.every((id) => activeRouteIds.includes(id));

  function toggleAll() {
    if (allExpanded) {
      dispatch(clearRoutes());
    } else {
      dispatch(setAllRoutes(allIds));
    }
  }

  const statusConfig = {
    draft: { label: 'Чернетка', classes: 'bg-muted text-muted-foreground' },
    active: { label: 'Активний', classes: 'bg-primary/15 text-primary' },
    completed: { label: 'Виконано', classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  };
  const status = statusConfig[plan.status];

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              План на {new Date(plan.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
            </CardTitle>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.classes}`}>{status.label}</span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{plan.routes.length} маршрути</span>
              <span>{plan.routes.reduce((acc, r) => acc + r.stops.length, 0)} зупинок</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
              onClick={toggleAll}
            >
              {allExpanded ? (
                <>
                  <ChevronsDownUp className="size-3" data-icon="inline-start" />
                  Згорнути всі
                </>
              ) : (
                <>
                  <ChevronsUpDown className="size-3" data-icon="inline-start" />
                  Розгорнути всі
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {plan.routes.map((route) => {
          const vehicle = vehicles.find((v) => v.id === route.vehicleId);
          const isExpanded = activeRouteIds.includes(route.vehicleId);

          return (
            <div key={route.vehicleId} className="rounded-lg border bg-card overflow-hidden">
              <button
                className={`w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors text-left ${isExpanded ? 'bg-muted/40' : ''}`}
                onClick={() => dispatch(toggleRoute(route.vehicleId))}
              >
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md ${isExpanded ? 'bg-primary' : 'bg-primary/15'}`}
                >
                  <Route className={`size-3.5 ${isExpanded ? 'text-primary-foreground' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{vehicle?.name}</p>
                  <p className="text-xs text-muted-foreground">{route.stops.length} зупинок</p>
                </div>
                <span className="text-xs text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="border-t px-3 pb-3 pt-2 flex flex-col gap-2">
                  {route.stops.map((stop, idx) => {
                    const point = points.find((p) => String(p.id) === stop.pointId);
                    return (
                      <div key={stop.pointId} className="flex items-start gap-2">
                        <div className="flex flex-col items-center">
                          <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {idx + 1}
                          </div>
                          {idx < route.stops.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[12px]" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <p className="text-xs font-medium">{point?.name}</p>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {stop.requestIds.map((rid) => {
                              const req = requests.find((r) => r.id === rid);
                              if (!req) return null;
                              const product = products.find((p) => String(p.id) === req.productId);
                              return (
                                <p key={rid} className="text-xs text-muted-foreground">
                                  {product?.name}: {req.quantity}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Sidebar Content ───
interface SidebarContentProps {
  onSelectPoint: (id: number) => void;
  onOpenPoint: (id: number, type: 'warehouse' | 'point') => void;
  onHoverPoint?: (id: number | null) => void;
}

export function SidebarContent({ onSelectPoint, onOpenPoint, onHoverPoint }: SidebarContentProps) {
  const points = useAppSelector((s) => s.mapPoints.points);
  const requests = useAppSelector((s) => s.requests.requests);
  const urgentCount = requests.filter((r) => r.criticality === 'urgent' || r.criticality === 'critical').length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b shrink-0">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{points.filter((p) => p.type === 'warehouse').length}</p>
          <p className="text-xs text-muted-foreground">Склади</p>
        </div>
        <div className="text-center border-x">
          <p className="text-lg font-bold text-primary">{points.filter((p) => p.type === 'point').length}</p>
          <p className="text-xs text-muted-foreground">Точки</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${urgentCount > 0 ? 'text-destructive' : 'text-primary'}`}>{urgentCount}</p>
          <p className="text-xs text-muted-foreground">Критичних</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="points" className="flex flex-col flex-1 min-h-0">
        <TabsList className="grid grid-cols-3 mx-3 mt-3 shrink-0">
          <TabsTrigger value="points" className="text-xs">
            Точки
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-xs">
            Запити
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plan" className="text-xs">
            План
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <PointsTab onSelectPoint={onSelectPoint} onOpenPoint={onOpenPoint} onHoverPoint={onHoverPoint} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <RequestsTab />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="plan" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <PlanTab />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
