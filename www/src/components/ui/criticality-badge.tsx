import { cn } from '@/lib/utils';
import type { CriticalityLevel } from '@/data/mockData';

const CONFIG: Record<CriticalityLevel, { label: string; classes: string }> = {
  urgent: {
    label: 'Терміново',
    classes: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  critical: {
    label: 'Критично',
    classes: 'bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400',
  },
  high: {
    label: 'Високий',
    classes: 'bg-amber-400/15 text-amber-700 border-amber-400/30 dark:text-amber-400',
  },
  medium: {
    label: 'Середній',
    classes: 'bg-yellow-400/15 text-yellow-700 border-yellow-400/30 dark:text-yellow-400',
  },
  normal: {
    label: 'Нормально',
    classes: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  },
};

interface Props {
  level: string;
  className?: string;
}

export function CriticalityBadge({ level, className }: Props) {
  const cfg = CONFIG[level as CriticalityLevel] ?? CONFIG.normal;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', cfg.classes, className)}>
      {cfg.label}
    </span>
  );
}
