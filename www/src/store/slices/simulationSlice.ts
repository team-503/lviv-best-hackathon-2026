import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSimulationStatus, advanceSimulation } from '@/lib/api/simulation';
import type { PlanDetailResponseDto } from '@/types/api';

export type SimStatus = 'idle' | 'stage1' | 'stage2';

interface SimulationState {
  status: SimStatus;
  day: number;
  executedPlan: PlanDetailResponseDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: SimulationState = {
  status: 'idle',
  day: 1,
  executedPlan: null,
  loading: false,
  error: null,
};

export const fetchSimulationStatus = createAsyncThunk('simulation/fetchStatus', async () => {
  return getSimulationStatus();
});

export const advanceSimulationThunk = createAsyncThunk('simulation/advance', async () => {
  return advanceSimulation();
});

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimulationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimulationStatus.fulfilled, (state, action) => {
        state.status = action.payload.status;
        state.day = action.payload.day;
        state.loading = false;
      })
      .addCase(fetchSimulationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch simulation status';
      })
      .addCase(advanceSimulationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(advanceSimulationThunk.fulfilled, (state, action) => {
        state.status = action.payload.newStatus as SimStatus;
        state.day = action.payload.day;
        state.executedPlan = action.payload.executedPlan;
        state.loading = false;
      })
      .addCase(advanceSimulationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to advance simulation';
      });
  },
});

export default simulationSlice.reducer;
