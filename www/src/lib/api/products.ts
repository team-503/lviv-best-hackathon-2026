import { api } from '../api';
import type { ProductResponseDto } from '@/types/api';

export function getProducts(): Promise<ProductResponseDto[]> {
  return api.get('/products');
}

export function createProduct(name: string): Promise<ProductResponseDto> {
  return api.post('/products', { name });
}

export function deleteProduct(id: number): Promise<void> {
  return api.delete(`/products/${id}`);
}
