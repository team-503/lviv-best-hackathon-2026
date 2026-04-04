import { cn } from '@/lib/utils';

type CriticalityLevel = 'normal' | 'needed' | 'critical' | 'urgent';

const CONFIG: Record<CriticalityLevel, { label: string; classes: string }> = {
  urgent: {
    label: 'Терміново',
    classes: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  critical: {
    label: 'Критично',
    classes: 'bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400',
  },
  needed: {
    label: 'Дуже потрібно',
    classes: 'bg-amber-400/15 text-amber-700 border-amber-400/30 dark:text-amber-400',
  },
  normal: {
    label: 'Нормально',
    classes: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  },
};

interface Props {
  level: CriticalityLevel;
  className?: string;
}

export function CriticalityBadge({ level, className }: Props) {
  const { label, classes } = CONFIG[level];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', classes, className)}>
      {label}
    </span>
  );
}
