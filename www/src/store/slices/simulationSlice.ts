import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SimRoute } from '@/utils/algorithm';

export type SimStatus = 'idle' | 'stage1' | 'stage2' | 'complete';

interface SimulationState {
  status: SimStatus;
  day: number;
  stage1Routes: SimRoute[];
  stage2Routes: SimRoute[];
}

const initialState: SimulationState = {
  status: 'idle',
  day: 1,
  stage1Routes: [],
  stage2Routes: [],
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    startStage1(state, action: PayloadAction<SimRoute[]>) {
      state.status = 'stage1';
      state.stage1Routes = action.payload;
      state.stage2Routes = [];
    },
    startStage2(state, action: PayloadAction<SimRoute[]>) {
      state.status = 'stage2';
      state.stage2Routes = action.payload;
    },
    completeSimulation(state) {
      state.status = 'complete';
    },
    resetDay(state) {
      state.status = 'idle';
      state.day += 1;
      state.stage1Routes = [];
      state.stage2Routes = [];
    },
  },
});

export const { startStage1, startStage2, completeSimulation, resetDay } = simulationSlice.actions;
export default simulationSlice.reducer;
