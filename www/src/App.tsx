import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoginPage } from '@/pages/LoginPage';
import { MapPage } from '@/pages/MapPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PermissionsPage } from '@/pages/PermissionsPage';
import { PointPage } from '@/pages/PointPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { WarehousePage } from '@/pages/WarehousePage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/authSlice';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchRequests } from '@/store/slices/requestsSlice';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

export default function App() {
  useOnlineStatus();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMapPoints());
      dispatch(fetchProducts());
      dispatch(fetchRequests());
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
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TooltipProvider>
  );
}
