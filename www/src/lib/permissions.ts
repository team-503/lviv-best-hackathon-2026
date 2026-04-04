import { supabase } from './supabase';

export type ResourceType = 'point' | 'warehouse';
export type PermissionLevel = 'none' | 'read' | 'write';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
}

export interface UserPermission {
  id: number;
  user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  permissions: string[];
}

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

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .order('display_name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserPermissions(userId: string): Promise<UserPermission[]> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function upsertPermission(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  permissions: string[],
  existingId?: number,
): Promise<void> {
  if (existingId !== undefined) {
    const { error } = await supabase
      .from('user_permissions')
      .update({ permissions })
      .eq('id', existingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_permissions').insert({
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      permissions,
    });
    if (error) throw error;
  }
}

export async function deletePermission(id: number): Promise<void> {
  const { error } = await supabase.from('user_permissions').delete().eq('id', id);
  if (error) throw error;
}
