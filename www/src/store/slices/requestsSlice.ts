import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryRequests } from '@/lib/api/delivery-requests';
import type { DeliveryRequestListItemResponseDto } from '@/types/api';

interface RequestsState {
  requests: DeliveryRequestListItemResponseDto[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  loading: false,
  error: null,
};

export const fetchRequests = createAsyncThunk('requests/fetch', async () => {
  return getDeliveryRequests();
});

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch delivery requests';
      });
  },
});

export default requestsSlice.reducer;
