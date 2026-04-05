const BASE_URL = import.meta.env.VITE_API_URL as string;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const OFFLINE_QUEUE_KEY = 'offline-queue';
export const QUEUE_CHANGE_EVENT = 'offline-queue-change' as const;
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

interface OfflineQueueEntry {
  id: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  path: string;
  body?: unknown;
}

function readQueue(): OfflineQueueEntry[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineQueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineQueueEntry[]): void {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOffline(method: OfflineQueueEntry['method'], path: string, body?: unknown): void {
  const queue = readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    method,
    path,
    body,
  });
  writeQueue(queue);
  window.dispatchEvent(new Event(QUEUE_CHANGE_EVENT));
}

export function getOfflineQueueLength(): number {
  return readQueue().length;
}

export async function flushOfflineQueue(onProgress?: (remaining: number) => void): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    try {
      if (entry.method === 'delete') {
        await api.delete(entry.path);
      } else {
        await api[entry.method](entry.path, entry.body);
      }
      writeQueue(readQueue().filter((e) => e.id !== entry.id));
    } catch {
      // leave failed entry in queue for next sync
    }
    onProgress?.(queue.length - i - 1);
  }
}

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
  const isMutating = MUTATING_METHODS.has(method);
  const parsedBody = isMutating && options.body ? JSON.parse(options.body as string) : undefined;
  const queueMethod = method.toLowerCase() as OfflineQueueEntry['method'];

  if (isMutating && !navigator.onLine) {
    enqueueOffline(queueMethod, path, parsedBody);
    return undefined as T;
  }

  if (isMutating) {
    headers['x-csrf-token'] = await ensureCsrfToken();
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    if (isMutating && error instanceof TypeError) {
      enqueueOffline(queueMethod, path, parsedBody);
      return undefined as T;
    }
    throw error;
  }

  if (response.status === 403 && isMutating) {
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
