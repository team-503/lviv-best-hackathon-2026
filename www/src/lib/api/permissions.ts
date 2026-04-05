import { api } from '../api';
import type { PermissionResponseDto } from '@/types/api';

export function getPermissions(): Promise<PermissionResponseDto[]> {
  return api.get('/permissions');
}

export function createPermission(data: {
  userId: string;
  resourceType: string;
  resourceId: number;
  permissions: string[];
}): Promise<PermissionResponseDto> {
  return api.post('/permissions', data);
}

export function updatePermission(id: number, permissions: string[]): Promise<PermissionResponseDto> {
  return api.put(`/permissions/${id}`, { permissions });
}

export function deletePermission(id: number): Promise<void> {
  return api.delete(`/permissions/${id}`);
}
