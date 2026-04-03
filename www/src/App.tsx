import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppSelector } from '@/store/hooks';
import { MapPage } from '@/pages/MapPage';
import { PointPage } from '@/pages/PointPage';
import { WarehousePage } from '@/pages/WarehousePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function App() {
  const theme = useAppSelector((s) => s.ui.theme);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <TooltipProvider>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={<ProtectedRoute><MapPage /></ProtectedRoute>}
        />
        <Route
          path="/point/:id"
          element={<ProtectedRoute><PointPage /></ProtectedRoute>}
        />
        <Route
          path="/warehouse/:id"
          element={<ProtectedRoute><WarehousePage /></ProtectedRoute>}
        />
      </Routes>
    </TooltipProvider>
  );
}
