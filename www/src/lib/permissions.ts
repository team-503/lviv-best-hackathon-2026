export type ResourceType = 'point' | 'warehouse';
export type PermissionLevel = 'none' | 'read' | 'write';

export function getLevel(perms?: string[]): PermissionLevel {
  if (!perms?.length) return 'none';
  if (perms.includes('write')) return 'write';
  return 'read';
}

export function levelToArray(level: PermissionLevel): string[] {
  if (level === 'write') return ['read', 'write'];
  if (level === 'read') return ['read'];
  return [];
}
