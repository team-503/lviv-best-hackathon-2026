import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import connectionReducer from './slices/connectionSlice';
import mapPointsReducer from './slices/mapPointsSlice';
import planReducer from './slices/planSlice';
import productsReducer from './slices/productsSlice';
import requestsReducer from './slices/requestsSlice';
import simulationReducer from './slices/simulationSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  mapPoints: mapPointsReducer,
  plan: planReducer,
  ui: uiReducer,
  simulation: simulationReducer,
  auth: authReducer,
  products: productsReducer,
  requests: requestsReducer,
  connection: connectionReducer,
});

const persistConfig = {
  key: 'logiflow',
  storage,
  whitelist: ['mapPoints', 'plan', 'products', 'requests'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
