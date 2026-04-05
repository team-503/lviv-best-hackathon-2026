import { api } from '../api';
import type { ProfileResponseDto, UserResponseDto } from '@/types/api';

export function getMyProfile(): Promise<ProfileResponseDto> {
  return api.get('/profiles/me');
}

export function getUsers(): Promise<UserResponseDto[]> {
  return api.get('/profiles/users');
}
