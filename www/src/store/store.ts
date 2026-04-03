import { configureStore } from '@reduxjs/toolkit';
import mapPointsReducer from './slices/mapPointsSlice';
import requestsReducer from './slices/requestsSlice';
import planReducer from './slices/planSlice';
import uiReducer from './slices/uiSlice';
import simulationReducer from './slices/simulationSlice';

export const store = configureStore({
  reducer: {
    mapPoints: mapPointsReducer,
    requests: requestsReducer,
    plan: planReducer,
    ui: uiReducer,
    simulation: simulationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
