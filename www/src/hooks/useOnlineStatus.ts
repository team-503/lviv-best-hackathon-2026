import { flushOfflineQueue, getOfflineQueueLength, QUEUE_CHANGE_EVENT } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { setOnline, setQueueLength, setSyncing } from '@/store/slices/connectionSlice';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useOnlineStatus(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOnline(navigator.onLine));
    dispatch(setQueueLength(getOfflineQueueLength()));

    async function syncQueue(): Promise<void> {
      const length = getOfflineQueueLength();
      if (length === 0) return;

      dispatch(setSyncing(true));
      toast.info('Синхронізація даних...', { id: 'sync' });
      try {
        await flushOfflineQueue((remaining) => dispatch(setQueueLength(remaining)));
        toast.success('Дані синхронізовано', { id: 'sync' });
      } catch {
        toast.error('Помилка синхронізації', { id: 'sync' });
      } finally {
        dispatch(setQueueLength(getOfflineQueueLength()));
        dispatch(setSyncing(false));
      }
    }

    function handleOnline(): void {
      dispatch(setOnline(true));
      toast.success("З'єднання відновлено");
      syncQueue();
    }

    function handleOffline(): void {
      dispatch(setOnline(false));
      toast.warning('Ви офлайн. Зміни зберігаються локально.');
    }

    function handleQueueChange(): void {
      dispatch(setQueueLength(getOfflineQueueLength()));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(QUEUE_CHANGE_EVENT, handleQueueChange);

    if (navigator.onLine) {
      syncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(QUEUE_CHANGE_EVENT, handleQueueChange);
    };
  }, [dispatch]);
}
