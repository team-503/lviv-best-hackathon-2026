import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { startStage1, startStage2, completeSimulation, resetDay } from '@/store/slices/simulationSlice';
import { removeRequest } from '@/store/slices/requestsSlice';
import { removeActiveRequest, updateQuantity } from '@/store/slices/mapPointsSlice';
import { generateRoutes } from '@/utils/algorithm';

export function useSimulation() {
  const dispatch = useAppDispatch();
  const { status, day, stage1Routes, stage2Routes } = useAppSelector((s) => s.simulation);
  const allRequests = useAppSelector((s) => s.requests.requests);
  const points = useAppSelector((s) => s.mapPoints.points);
  const vehicles = useAppSelector((s) => s.plan.vehicles);

  // Apply delivered goods to stock
  function applyRoutes(routes: typeof stage1Routes) {
    for (const route of routes) {
      for (const stop of route.stops) {
        for (const item of stop.items) {
          // Increase stock at delivery point
          const point = points.find((p) => p.id === stop.pointId);
          if (point) {
            const stockItem = point.stock.find((s) => s.productId === item.productId);
            const currentQty = stockItem?.quantity ?? 0;
            dispatch(updateQuantity({
              pointId: stop.pointId,
              productId: item.productId,
              quantity: currentQty + item.quantity,
            }));
          }

          // If source is a delivery point (not warehouse) — decrease its stock
          const sourcePoint = points.find((p) => p.id === item.sourceWarehouseId);
          if (sourcePoint && sourcePoint.type === 'delivery') {
            const srcStock = sourcePoint.stock.find((s) => s.productId === item.productId);
            if (srcStock) {
              dispatch(updateQuantity({
                pointId: item.sourceWarehouseId,
                productId: item.productId,
                quantity: Math.max(0, srcStock.quantity - item.quantity),
              }));
            }
          }

          // Clear the request
          dispatch(removeActiveRequest({ pointId: stop.pointId, requestId: item.requestId }));
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
      // Re-read requests after clearing (we compute from what's still pending)
      const remaining = allRequests.filter(
        (r) => r.criticality !== 'urgent' && r.status !== 'completed',
      );
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
