import { api } from './api';

export const QUEUE_CHANGE_EVENT = 'offline-queue-change' as const;

interface QueueEntry {
  id: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  path: string;
  body?: unknown;
}

const STORAGE_KEY = 'offline-queue';

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueue(method: QueueEntry['method'], path: string, body?: unknown): void {
  const queue = readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    method,
    path,
    body,
  });
  writeQueue(queue);
}

export function getQueueLength(): number {
  return readQueue().length;
}

export async function flush(onProgress?: (remaining: number) => void): Promise<void> {
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
