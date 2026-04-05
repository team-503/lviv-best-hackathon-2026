const BASE_URL = import.meta.env.VITE_API_URL as string;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/csrf/token`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch CSRF token');
  const data = await res.json();
  const token: string = data.token;
  csrfToken = token;
  csrfTokenPromise = null;
  return token;
}

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken();
  }
  return csrfTokenPromise;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.message ?? response.statusText);
  }
  return response.json();
}

function isCsrfError(body: Record<string, unknown>): boolean {
  return body.message === 'invalid csrf token';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const method = (options.method ?? 'GET').toUpperCase();
  if (MUTATING_METHODS.has(method)) {
    headers['x-csrf-token'] = await ensureCsrfToken();
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 403 && MUTATING_METHODS.has(method)) {
    const body = await response.json().catch(() => ({}));
    if (isCsrfError(body)) {
      csrfToken = null;
      headers['x-csrf-token'] = await fetchCsrfToken();
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers,
      });
      return handleResponse<T>(retry);
    }
    throw new ApiError(response.status, body.message ?? response.statusText);
  }

  return handleResponse<T>(response);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', ...(body !== undefined && { body: JSON.stringify(body) }) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
