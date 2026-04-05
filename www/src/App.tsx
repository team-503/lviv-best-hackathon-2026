import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/authSlice';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { MapPage } from '@/pages/MapPage';
import { PointPage } from '@/pages/PointPage';
import { WarehousePage } from '@/pages/WarehousePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PermissionsPage } from '@/pages/PermissionsPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function App() {
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
      </Routes>
    </TooltipProvider>
  );
}
