import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/data/mockData';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// Seed a default admin account on first load
const SEED_USERS_KEY = 'lf_users';
const AUTH_USER_KEY = 'lf_auth_user';

export interface StoredUser extends AuthUser {
  passwordHash: string;
}

function seedUsers() {
  const existing = localStorage.getItem(SEED_USERS_KEY);
  if (!existing) {
    const defaults: StoredUser[] = [
      {
        id: 'u1',
        name: 'Олексій Коваль',
        email: 'admin@logiflow.ua',
        role: 'admin',
        passwordHash: 'admin123',
      },
    ];
    localStorage.setItem(SEED_USERS_KEY, JSON.stringify(defaults));
  }
}

function getStoredUser(): AuthUser | null {
  try {
    seedUsers();
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(AUTH_USER_KEY);
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

// ─── Auth helpers (work directly with localStorage) ───
export function getStoredUsers(): StoredUser[] {
  seedUsers();
  try {
    return JSON.parse(localStorage.getItem(SEED_USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getStoredUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): AuthUser | { error: string } {
  if (findUserByEmail(email)) return { error: 'Користувач з таким email вже існує' };
  const users = getStoredUsers();
  const newUser: StoredUser = {
    id: `u${Date.now()}`,
    name,
    email,
    role,
    passwordHash: password,
  };
  users.push(newUser);
  localStorage.setItem(SEED_USERS_KEY, JSON.stringify(users));
  const { passwordHash: _, ...authUser } = newUser;
  return authUser;
}
