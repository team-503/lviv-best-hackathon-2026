import { Moon, Sun, Truck, Menu, User, Play, SkipForward, CheckCheck, CalendarDays, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, setMobileSidebarOpen } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { supabase } from '@/lib/supabase';
import { useSimulation } from '@/hooks/useSimulation';
import { useNavigate } from 'react-router-dom';
import type { SimStatus } from '@/store/slices/simulationSlice';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Адміністратор',
  warehouse: 'Склад',
  delivery: 'Точка доставки',
};

const SIM_BUTTON: Record<
  SimStatus,
  { label: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' | 'secondary'; className?: string }
> = {
  idle: { label: 'Запустити симуляцію', icon: Play, variant: 'default' },
  stage1: {
    label: 'Виконати Етап 1',
    icon: SkipForward,
    variant: 'default',
    className: 'bg-amber-500 hover:bg-amber-600 text-white border-0',
  },
  stage2: {
    label: 'Завершити симуляцію',
    icon: CheckCheck,
    variant: 'default',
    className: 'bg-emerald-600 hover:bg-emerald-700 text-white border-0',
  },
  complete: { label: 'Новий день', icon: CalendarDays, variant: 'outline' },
};

interface HeaderProps {
  showSimulation?: boolean;
}

export function Header({ showSimulation = false }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.ui.theme);
  const user = useAppSelector((s) => s.auth.user);
  const { status, day, runSimulation } = useSimulation();
  const simBtn = SIM_BUTTON[status];
  const SimIcon = simBtn.icon;

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

      {/* Center — simulation button (admin only) */}
      {showSimulation && user?.role === 'admin' && (
        <Button
          onClick={runSimulation}
          variant={simBtn.variant}
          size="sm"
          className={cn('hidden sm:flex gap-1.5', simBtn.className)}
        >
          <SimIcon className="size-3.5" data-icon="inline-start" />
          {simBtn.label}
        </Button>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        {user?.role === 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/permissions')}
            aria-label="Управління доступами"
            title="Управління доступами"
          >
            <Users className="size-4" />
          </Button>
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
              <p className="text-xs text-muted-foreground leading-none mt-0.5">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            supabase.auth.signOut();
            dispatch(logout());
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
