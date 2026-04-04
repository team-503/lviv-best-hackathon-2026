import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getMyProfile } from '@/lib/api/profiles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async () => {
  return getMyProfile();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      const p = action.payload;
      state.user = {
        id: p.id,
        name: p.displayName ?? p.email ?? '',
        email: p.email ?? '',
        role: p.role,
      };
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(fetchProfile.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
