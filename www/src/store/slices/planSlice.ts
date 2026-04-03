import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DELIVERY_PLAN, VEHICLES, type DeliveryPlan, type Vehicle } from '@/data/mockData';

interface PlanState {
  plan: DeliveryPlan;
  vehicles: Vehicle[];
}

const initialState: PlanState = {
  plan: DELIVERY_PLAN,
  vehicles: VEHICLES,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setPlan(state, action: PayloadAction<DeliveryPlan>) {
      state.plan = action.payload;
    },
    setPlanStatus(state, action: PayloadAction<DeliveryPlan['status']>) {
      state.plan.status = action.payload;
    },
  },
});

export const { setPlan, setPlanStatus } = planSlice.actions;
export default planSlice.reducer;
