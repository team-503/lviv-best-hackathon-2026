import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  selectedPointId: string | null;
  activeRouteIds: string[];       // multiple routes can be expanded simultaneously
  mobileSidebarOpen: boolean;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const initialState: UiState = {
  theme: getInitialTheme(),
  selectedPointId: null,
  activeRouteIds: [],
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    setSelectedPoint(state, action: PayloadAction<string | null>) {
      state.selectedPointId = action.payload;
    },
    toggleRoute(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.activeRouteIds.indexOf(id);
      if (idx === -1) {
        state.activeRouteIds.push(id);
      } else {
        state.activeRouteIds.splice(idx, 1);
      }
    },
    setAllRoutes(state, action: PayloadAction<string[]>) {
      state.activeRouteIds = action.payload;
    },
    clearRoutes(state) {
      state.activeRouteIds = [];
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setSelectedPoint,
  toggleRoute,
  setAllRoutes,
  clearRoutes,
  setMobileSidebarOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
