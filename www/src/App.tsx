import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/data/mockData';
import { MapPage } from '@/pages/MapPage';
import { PointPage } from '@/pages/PointPage';
import { WarehousePage } from '@/pages/WarehousePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
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
        const meta = session.user.user_metadata;
        dispatch(
          setUser({
            id: session.user.id,
            name: (meta.name as string) ?? session.user.email ?? '',
            email: session.user.email ?? '',
            role: (meta.role as UserRole) ?? 'delivery',
          }),
        );
      } else {
        dispatch(setUser(null));
      }
    });
    return () => subscription.unsubscribe();
  }, [dispatch]);

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
      </Routes>
    </TooltipProvider>
  );
}
