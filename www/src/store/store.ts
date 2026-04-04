import { configureStore } from '@reduxjs/toolkit';
import mapPointsReducer from './slices/mapPointsSlice';
import requestsReducer from './slices/requestsSlice';
import planReducer from './slices/planSlice';
import uiReducer from './slices/uiSlice';
import simulationReducer from './slices/simulationSlice';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    mapPoints: mapPointsReducer,
    requests: requestsReducer,
    plan: planReducer,
    ui: uiReducer,
    simulation: simulationReducer,
    auth: authReducer,
    products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
