import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MAP_POINTS, type MapPoint, type PointType, type StockItem } from '@/data/mockData';

interface MapPointsState {
  points: MapPoint[];
}

const initialState: MapPointsState = {
  points: MAP_POINTS,
};

const mapPointsSlice = createSlice({
  name: 'mapPoints',
  initialState,
  reducers: {
    addActiveRequest(state, action: PayloadAction<{ pointId: string; requestId: string }>) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point && !point.activeRequests.includes(action.payload.requestId)) {
        point.activeRequests.push(action.payload.requestId);
      }
    },
    removeActiveRequest(state, action: PayloadAction<{ pointId: string; requestId: string }>) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point) {
        point.activeRequests = point.activeRequests.filter((id) => id !== action.payload.requestId);
      }
    },
    updateStock(state, action: PayloadAction<{ pointId: string; stock: StockItem[] }>) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point) point.stock = action.payload.stock;
    },
    updateMinThreshold(
      state,
      action: PayloadAction<{ pointId: string; productId: string; minThreshold: number }>,
    ) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point) {
        const item = point.stock.find((s) => s.productId === action.payload.productId);
        if (item) item.minThreshold = action.payload.minThreshold;
      }
    },
    updateQuantity(
      state,
      action: PayloadAction<{ pointId: string; productId: string; quantity: number }>,
    ) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point) {
        const item = point.stock.find((s) => s.productId === action.payload.productId);
        if (item) item.quantity = action.payload.quantity;
      }
    },
    addStockItem(
      state,
      action: PayloadAction<{ pointId: string; item: StockItem }>,
    ) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point && !point.stock.find((s) => s.productId === action.payload.item.productId)) {
        point.stock.push(action.payload.item);
      }
    },
    removeStockItem(
      state,
      action: PayloadAction<{ pointId: string; productId: string }>,
    ) {
      const point = state.points.find((p) => p.id === action.payload.pointId);
      if (point) {
        point.stock = point.stock.filter((s) => s.productId !== action.payload.productId);
      }
    },
    addPoint(
      state,
      action: PayloadAction<{ name: string; type: PointType; lat: number; lng: number; address: string; stock: StockItem[] }>,
    ) {
      const prefix = action.payload.type === 'warehouse' ? 'w' : 'd';
      const id = `${prefix}-${Date.now()}`;
      state.points.push({ ...action.payload, id, activeRequests: [] });
    },
    removePoint(state, action: PayloadAction<string>) {
      state.points = state.points.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  addActiveRequest,
  removeActiveRequest,
  updateStock,
  updateMinThreshold,
  updateQuantity,
  addStockItem,
  removeStockItem,
  addPoint,
  removePoint,
} = mapPointsSlice.actions;
export default mapPointsSlice.reducer;
