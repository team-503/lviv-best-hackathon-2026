import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPoints } from '@/lib/api/points';
import { getWarehouses } from '@/lib/api/warehouses';
import type { MapPoint } from '@/types/api';

interface MapPointsState {
  points: MapPoint[];
  loading: boolean;
  error: string | null;
}

const initialState: MapPointsState = {
  points: [],
  loading: false,
  error: null,
};

export const fetchMapPoints = createAsyncThunk('mapPoints/fetch', async () => {
  const [points, warehouses] = await Promise.all([getPoints(), getWarehouses()]);

  const mapped: MapPoint[] = [
    ...warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      type: 'warehouse' as const,
      lat: w.location.lat,
      lng: w.location.lng,
      permissions: w.permissions,
    })),
    ...points.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'point' as const,
      lat: p.location.lat,
      lng: p.location.lng,
      permissions: p.permissions,
    })),
  ];

  return mapped;
});

const mapPointsSlice = createSlice({
  name: 'mapPoints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapPoints.fulfilled, (state, action) => {
        state.points = action.payload;
        state.loading = false;
      })
      .addCase(fetchMapPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch points';
      });
  },
});

export default mapPointsSlice.reducer;
