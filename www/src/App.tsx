import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, fetchProfile } from '@/store/slices/authSlice';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { supabase } from '@/lib/supabase';
import { MapPage } from '@/pages/MapPage';
import { PointPage } from '@/pages/PointPage';
import { WarehousePage } from '@/pages/WarehousePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PermissionsPage } from '@/pages/PermissionsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(fetchProfile());
      } else {
        dispatch(setUser(null));
      }
    });
    return () => subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMapPoints());
      dispatch(fetchProducts());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/point/:id"
          element={
            <ProtectedRoute>
              <PointPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouse/:id"
          element={
            <ProtectedRoute>
              <WarehousePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions"
          element={
            <ProtectedRoute>
              <PermissionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </TooltipProvider>
  );
}
