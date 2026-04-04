import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { MapView } from '@/components/map/MapView';
import { MapLegend } from '@/components/map/MapLegend';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import { SimulationBanner } from '@/components/simulation/SimulationBanner';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedPoint, setMobileSidebarOpen } from '@/store/slices/uiSlice';
import { fetchCurrentPlans } from '@/store/slices/planSlice';
import { fetchSimulationStatus } from '@/store/slices/simulationSlice';
import { useSimulation } from '@/hooks/useSimulation';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import type { PlanRouteResponseDto } from '@/types/api';

export function MapPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);
  const [flyToTrigger, setFlyToTrigger] = useState<{ id: number; key: number } | null>(null);
  const { selectedPointId, mobileSidebarOpen } = useAppSelector((s) => s.ui);
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.mapPoints.loading);
  const isAdmin = user?.role === 'admin';
  const { status, activeRoutes } = useSimulation();
  const { urgent, standard } = useAppSelector((s) => s.plan);

  // Fetch plans and simulation status on mount
  useEffect(() => {
    dispatch(fetchCurrentPlans());
    dispatch(fetchSimulationStatus());
  }, [dispatch]);

  function handleSelectPoint(id: number) {
    dispatch(setSelectedPoint(String(id)));
    setFlyToTrigger({ id, key: Date.now() });
    dispatch(setMobileSidebarOpen(false));
  }

  function handleHoverPoint(id: number | null) {
    setHoveredPointId(id);
  }

  function handleOpenPoint(id: number, type: 'warehouse' | 'point') {
    navigate(type === 'warehouse' ? `/warehouse/${id}` : `/point/${id}`);
  }

  const simActive = status === 'stage1' || status === 'stage2';

  // Determine which routes to show on the map
  let mapRoutes: PlanRouteResponseDto[] = [];
  if (simActive && activeRoutes.length > 0) {
    // During simulation, show the executed plan routes
    mapRoutes = activeRoutes;
  } else if (!simActive) {
    // When idle, show current plan routes (both urgent and standard)
    const planRoutes: PlanRouteResponseDto[] = [];
    if (urgent?.routes) planRoutes.push(...urgent.routes);
    if (standard?.routes) planRoutes.push(...standard.routes);
    mapRoutes = planRoutes;
  }

  const selectedNumericId = selectedPointId != null ? Number(selectedPointId) : null;

  return (
    <div className="flex flex-col h-svh bg-background">
      <Header showSimulation />
      <SimulationBanner />

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-r bg-card">
          <SidebarContent onSelectPoint={handleSelectPoint} onOpenPoint={handleOpenPoint} onHoverPoint={handleHoverPoint} />
        </aside>

        <main className="relative flex-1 min-w-0">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
          <MapView
            selectedPointId={selectedNumericId}
            onSelectPoint={(id) => dispatch(setSelectedPoint(id != null ? String(id) : null))}
            planRoutes={mapRoutes}
            hoveredPointId={hoveredPointId}
            flyToTrigger={flyToTrigger}
          />
          <MapLegend showSimLegend={simActive} />
          {isAdmin && (
            <Button
              size="icon"
              className="absolute bottom-6 right-6 z-10 size-12 rounded-full shadow-lg"
              onClick={() => setAdminOpen(true)}
              title="Додати об'єкт"
            >
              <Plus className="size-5" />
            </Button>
          )}
        </main>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="p-0 w-80 flex flex-col">
          <SheetTitle className="sr-only">Навігаційне меню</SheetTitle>
          <SidebarContent onSelectPoint={handleSelectPoint} onOpenPoint={handleOpenPoint} onHoverPoint={handleHoverPoint} />
        </SheetContent>
      </Sheet>

      {isAdmin && <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />}
    </div>
  );
}
