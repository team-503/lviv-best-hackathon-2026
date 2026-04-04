import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentPlans } from '@/lib/api/delivery-plans';
import type { PlanDetailResponseDto } from '@/types/api';

interface PlanState {
  urgent: PlanDetailResponseDto | null;
  standard: PlanDetailResponseDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  urgent: null,
  standard: null,
  loading: false,
  error: null,
};

export const fetchCurrentPlans = createAsyncThunk('plan/fetchCurrent', async () => {
  return getCurrentPlans();
});

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPlans.fulfilled, (state, action) => {
        state.urgent = action.payload.urgent;
        state.standard = action.payload.standard;
        state.loading = false;
      })
      .addCase(fetchCurrentPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch plans';
      });
  },
});

export default planSlice.reducer;
