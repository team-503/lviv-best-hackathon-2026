import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
