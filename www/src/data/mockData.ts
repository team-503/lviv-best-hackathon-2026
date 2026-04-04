export type CriticalityLevel = 'normal' | 'medium' | 'high' | 'critical' | 'urgent';

// ─── Helpers ───
export const CRITICALITY_CONFIG: Record<CriticalityLevel, { label: string; color: string; priority: number }> = {
  urgent: { label: 'Терміново', color: 'destructive', priority: 5 },
  critical: { label: 'Критично', color: 'warning', priority: 4 },
  high: { label: 'Високий', color: 'secondary', priority: 3 },
  medium: { label: 'Середній', color: 'secondary', priority: 2 },
  normal: { label: 'Нормально', color: 'outline', priority: 1 },
};
