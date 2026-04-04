import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { advanceSimulationThunk } from '@/store/slices/simulationSlice';
import { fetchCurrentPlans } from '@/store/slices/planSlice';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import type { PlanRouteResponseDto } from '@/types/api';

export function useSimulation() {
  const dispatch = useAppDispatch();
  const { status, day, executedPlan, loading } = useAppSelector((s) => s.simulation);

  function runSimulation() {
    dispatch(advanceSimulationThunk()).then(() => {
      dispatch(fetchCurrentPlans());
      dispatch(fetchMapPoints());
    });
  }

  const activeRoutes: PlanRouteResponseDto[] = executedPlan?.routes ?? [];

  return { status, day, activeRoutes, loading, runSimulation };
}
