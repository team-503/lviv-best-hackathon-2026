import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DELIVERY_REQUESTS, type DeliveryRequest, type CriticalityLevel } from '@/data/mockData';

interface RequestsState {
  requests: DeliveryRequest[];
}

const initialState: RequestsState = {
  requests: DELIVERY_REQUESTS,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    addRequest(state, action: PayloadAction<DeliveryRequest>) {
      state.requests.push(action.payload);
    },
    removeRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter((r) => r.id !== action.payload);
    },
    updateRequestStatus(
      state,
      action: PayloadAction<{ id: string; status: DeliveryRequest['status'] }>,
    ) {
      const req = state.requests.find((r) => r.id === action.payload.id);
      if (req) req.status = action.payload.status;
    },
    updateRequestCriticality(
      state,
      action: PayloadAction<{ id: string; criticality: CriticalityLevel }>,
    ) {
      const req = state.requests.find((r) => r.id === action.payload.id);
      if (req) req.criticality = action.payload.criticality;
    },
    updateRequest(
      state,
      action: PayloadAction<{ id: string; quantity: number; criticality: CriticalityLevel }>,
    ) {
      const req = state.requests.find((r) => r.id === action.payload.id);
      if (req) {
        req.quantity = action.payload.quantity;
        req.criticality = action.payload.criticality;
      }
    },
  },
});

export const {
  addRequest,
  removeRequest,
  updateRequestStatus,
  updateRequestCriticality,
  updateRequest,
} = requestsSlice.actions;
export default requestsSlice.reducer;
