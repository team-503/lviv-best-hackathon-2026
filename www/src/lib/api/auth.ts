import type { AuthResponseDto } from '@/types/api';
import { api } from '../api';

export function login(email: string, password: string): Promise<AuthResponseDto> {
  return api.post('/auth/login', { email, password });
}

export function register(name: string, email: string, password: string, role: string): Promise<AuthResponseDto> {
  return api.post('/auth/register', { name, email, password, role });
}

export function logout(): Promise<void> {
  return api.post('/auth/logout');
}
