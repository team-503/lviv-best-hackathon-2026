import { Play, SkipForward, CheckCheck, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimulation } from '@/hooks/useSimulation';
import type { SimStatus } from '@/store/slices/simulationSlice';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  SimStatus,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    classes: string;
    btnLabel: string;
    btnIcon: React.ElementType;
    btnClasses: string;
  }
> = {
  idle: {
    label: 'Очікування',
    description: 'Приймаються нові запити на доставку',
    icon: Truck,
    classes: 'bg-primary/10 border-primary/20 text-primary',
    btnLabel: 'Запустити ітерацію',
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
    btnLabel: 'Завершити ітерацію',
    btnIcon: CheckCheck,
    btnClasses: 'bg-emerald-600 hover:bg-emerald-700 text-white border-0',
  },
};

export function SimulationBanner() {
  const { status, day, activeRoutes, loading, runSimulation } = useSimulation();
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
        <span>Ітерація {day}</span>
        {(status === 'stage1' || status === 'stage2') && activeRoutes.length > 0 && (
          <span>{activeRoutes.length} маршрут(ів) на карті</span>
        )}
      </div>

      {/* Action button */}
      <Button
        size="sm"
        onClick={runSimulation}
        disabled={loading}
        className={cn('h-7 text-xs', cfg.btnClasses)}
        variant="outline"
      >
        <BtnIcon className="size-3.5" data-icon="inline-start" />
        <span className="hidden sm:inline">{cfg.btnLabel}</span>
        <span className="sm:hidden">Далі</span>
      </Button>
    </div>
  );
}
