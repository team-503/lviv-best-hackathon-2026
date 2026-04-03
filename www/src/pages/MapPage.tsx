import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Header } from '@/components/layout/Header';
import { MapView } from '@/components/map/MapView';
import { MapLegend } from '@/components/map/MapLegend';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import { SimulationBanner } from '@/components/simulation/SimulationBanner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedPoint, setMobileSidebarOpen } from '@/store/slices/uiSlice';
import { useSimulation } from '@/hooks/useSimulation';
import { useNavigate } from 'react-router-dom';

export function MapPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedPointId, activeRouteIds, mobileSidebarOpen } = useAppSelector((s) => s.ui);
  const { status, activeRoutes } = useSimulation();

  function handleSelectPoint(id: string) {
    dispatch(setSelectedPoint(id));
    dispatch(setMobileSidebarOpen(false));
  }

  function handleOpenPoint(id: string, type: 'warehouse' | 'delivery') {
    navigate(type === 'warehouse' ? `/warehouse/${id}` : `/point/${id}`);
  }

  const simActive = status === 'stage1' || status === 'stage2';

  return (
    <div className="flex flex-col h-svh bg-background">
      <Header showSimulation />
      <SimulationBanner />

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-r bg-card">
          <SidebarContent onSelectPoint={handleSelectPoint} onOpenPoint={handleOpenPoint} />
        </aside>

        <main className="relative flex-1 min-w-0">
          <MapView
            selectedPointId={selectedPointId}
            onSelectPoint={(id) => dispatch(setSelectedPoint(id))}
            activeRouteIds={simActive ? [] : activeRouteIds}
            simulationRoutes={simActive ? activeRoutes : []}
          />
          <MapLegend showSimLegend={simActive} />
        </main>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="p-0 w-80 flex flex-col">
          <SheetTitle className="sr-only">Навігаційне меню</SheetTitle>
          <SidebarContent onSelectPoint={handleSelectPoint} onOpenPoint={handleOpenPoint} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
