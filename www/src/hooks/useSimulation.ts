import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { startStage1, startStage2, completeSimulation, resetDay } from '@/store/slices/simulationSlice';
import { removeRequest } from '@/store/slices/requestsSlice';
import { generateRoutes } from '@/utils/algorithm';
import type { AlgoMapPoint } from '@/utils/algorithm';

export function useSimulation() {
  const dispatch = useAppDispatch();
  const { status, day, stage1Routes, stage2Routes } = useAppSelector((s) => s.simulation);
  const allRequests = useAppSelector((s) => s.requests.requests);
  const apiPoints = useAppSelector((s) => s.mapPoints.points);
  const vehicles = useAppSelector((s) => s.plan.vehicles);

  // Convert API MapPoint (numeric id, "point" type) to AlgoMapPoint (string id, "delivery" type)
  const points: AlgoMapPoint[] = apiPoints.map((p) => ({
    id: String(p.id),
    name: p.name,
    type: p.type === 'point' ? 'delivery' : p.type,
    lat: p.lat,
    lng: p.lng,
  }));

  // Mark delivered requests as completed
  function applyRoutes(routes: typeof stage1Routes) {
    for (const route of routes) {
      for (const stop of route.stops) {
        for (const item of stop.items) {
          dispatch(removeRequest(item.requestId));
        }
      }
    }
  }

  function runSimulation() {
    if (status === 'idle') {
      // Stage 1: urgent only
      const urgentRequests = allRequests.filter((r) => r.criticality === 'urgent');
      const routes = generateRoutes(urgentRequests, points, vehicles);
      dispatch(startStage1(routes));
      return;
    }

    if (status === 'stage1') {
      // Apply stage 1 deliveries
      applyRoutes(stage1Routes);

      // Stage 2: everything except urgent (already cleared)
      const remaining = allRequests.filter((r) => r.criticality !== 'urgent' && r.status !== 'completed');
      const routes = generateRoutes(remaining, points, vehicles);
      dispatch(startStage2(routes));
      return;
    }

    if (status === 'stage2') {
      // Apply stage 2 deliveries
      applyRoutes(stage2Routes);
      dispatch(completeSimulation());
      return;
    }

    if (status === 'complete') {
      dispatch(resetDay());
    }
  }

  const activeRoutes = status === 'stage1' ? stage1Routes : status === 'stage2' ? stage2Routes : [];

  return { status, day, activeRoutes, runSimulation };
}
