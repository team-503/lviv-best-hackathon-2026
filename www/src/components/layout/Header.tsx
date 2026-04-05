import { Button } from '@/components/ui/button';
import { useSimulation } from '@/hooks/useSimulation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { setMobileSidebarOpen, toggleTheme } from '@/store/slices/uiSlice';
import { USER_ROLE_LABELS } from '@/types/user-role';
import { Loader2, LogOut, Menu, Moon, Package, Sun, Truck, User, Users, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatusPill({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: 'amber' | 'blue' }) {
  const colors = {
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  };
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${colors[color]}`}>
      <Icon className="size-3.5" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function ConnectionIndicator() {
  const { isOnline, queueLength, isSyncing } = useAppSelector((s) => s.connection);

  if (isOnline && queueLength === 0 && !isSyncing) return null;

  if (!isOnline) {
    return <StatusPill icon={WifiOff} label={`Офлайн${queueLength > 0 ? ` · ${queueLength}` : ''}`} color="amber" />;
  }

  if (isSyncing) {
    const SpinningLoader = () => <Loader2 className="size-3.5 animate-spin" />;
    return <StatusPill icon={SpinningLoader} label="Синхронізація..." color="blue" />;
  }

  if (queueLength > 0) {
    return <StatusPill icon={Loader2} label={`${queueLength} в черзі`} color="amber" />;
  }

  return null;
}

interface HeaderProps {
  showSimulation?: boolean;
}

export function Header({ showSimulation = false }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.ui.theme);
  const user = useAppSelector((s) => s.auth.user);
  const { day } = useSimulation();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {showSimulation && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => dispatch(setMobileSidebarOpen(true))}>
            <Menu className="size-5" />
            <span className="sr-only">Меню</span>
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Truck className="size-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold leading-none">LogiFlow</span>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">День {day}</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionIndicator />

      {/* Right */}
      <div className="flex items-center gap-2">
        {user?.role === 'admin' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/permissions')}
              aria-label="Управління доступами"
              title="Управління доступами"
            >
              <Users className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/products')}
              aria-label="Управління продуктами"
              title="Управління продуктами"
            >
              <Package className="size-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())} aria-label="Змінити тему">
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {user && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
              <User className="size-3.5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">{USER_ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            dispatch(logoutUser());
          }}
          aria-label="Вийти"
          title="Вийти"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
