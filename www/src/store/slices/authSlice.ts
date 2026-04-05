import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { login, register, logout as logoutApi } from '@/lib/api/auth';
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

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }) => {
  const result = await login(email, password);
  return result.user;
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }: { name: string; email: string; password: string; role: string }) => {
    const result = await register(name, email, password, role);
    return result.user;
  },
);

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async () => {
  return getMyProfile();
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await logoutApi();
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
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      const u = action.payload;
      state.user = {
        id: u.id,
        name: u.displayName ?? u.email ?? '',
        email: u.email ?? '',
        role: u.role,
      };
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(loginUser.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      const u = action.payload;
      state.user = {
        id: u.id,
        name: u.displayName ?? u.email ?? '',
        email: u.email ?? '',
        role: u.role,
      };
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(registerUser.rejected, (state) => {
      state.loading = false;
    });
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
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const { setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
