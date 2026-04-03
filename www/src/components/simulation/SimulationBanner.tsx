import { Play, SkipForward, CheckCheck, CalendarDays, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimulation } from '@/hooks/useSimulation';
import type { SimStatus } from '@/store/slices/simulationSlice';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<SimStatus, {
  label: string;
  description: string;
  icon: React.ElementType;
  classes: string;
  btnLabel: string;
  btnIcon: React.ElementType;
  btnClasses: string;
}> = {
  idle: {
    label: 'Очікування',
    description: 'Приймаються нові запити на доставку',
    icon: Truck,
    classes: 'bg-primary/10 border-primary/20 text-primary',
    btnLabel: 'Запустити симуляцію',
    btnIcon: Play,
    btnClasses: '',
  },
  stage1: {
    label: 'Етап 1 — Термінові',
    description: 'Виконується доставка термінових запитів',
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
    btnLabel: 'Виконати Етап 1',
    btnIcon: SkipForward,
    btnClasses: 'bg-amber-500 hover:bg-amber-600 text-white border-0',
  },
  stage2: {
    label: 'Етап 2 — Стандартний',
    description: 'Виконується основний план доставки',
    icon: Truck,
    classes: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
    btnLabel: 'Завершити симуляцію',
    btnIcon: CheckCheck,
    btnClasses: 'bg-emerald-600 hover:bg-emerald-700 text-white border-0',
  },
  complete: {
    label: 'День завершено',
    description: 'Усі запити виконано. Можна починати новий день',
    icon: CheckCheck,
    classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    btnLabel: 'Новий день',
    btnIcon: CalendarDays,
    btnClasses: '',
  },
};

export function SimulationBanner() {
  const { status, day, activeRoutes, runSimulation } = useSimulation();
  const urgentCount = useAppSelector((s) =>
    s.requests.requests.filter((r) => r.criticality === 'urgent').length,
  );
  const totalRequests = useAppSelector((s) => s.requests.requests.length);
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const BtnIcon = cfg.btnIcon;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-2.5 border-b text-sm', cfg.classes)}>
      <StatusIcon className="size-4 shrink-0" />

      <div className="flex-1 min-w-0">
        <span className="font-semibold">{cfg.label}</span>
        <span className="text-xs opacity-70 ml-2 hidden sm:inline">{cfg.description}</span>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-xs opacity-70 shrink-0">
        <span>День {day}</span>
        {status === 'idle' && <span>{totalRequests} запит(ів)</span>}
        {status === 'idle' && urgentCount > 0 && (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {urgentCount} термінових
          </span>
        )}
        {(status === 'stage1' || status === 'stage2') && (
          <span>{activeRoutes.length} маршрут(ів) на карті</span>
        )}
      </div>

      {/* Mobile sim button */}
      <Button
        size="sm"
        onClick={runSimulation}
        className={cn('sm:hidden h-7 text-xs', cfg.btnClasses)}
        variant="outline"
      >
        <BtnIcon className="size-3.5" data-icon="inline-start" />
        {status === 'complete' ? 'Новий день' : 'Далі'}
      </Button>
    </div>
  );
}
