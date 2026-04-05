import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  isOnline: boolean;
  queueLength: number;
  isSyncing: boolean;
}

const initialState: ConnectionState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  queueLength: 0,
  isSyncing: false,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setQueueLength(state, action: PayloadAction<number>) {
      state.queueLength = action.payload;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
  },
});

export const { setOnline, setQueueLength, setSyncing } = connectionSlice.actions;
export default connectionSlice.reducer;
