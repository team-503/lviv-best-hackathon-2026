import { flush, getQueueLength, QUEUE_CHANGE_EVENT } from '@/lib/offline-queue';
import { useAppDispatch } from '@/store/hooks';
import { setOnline, setQueueLength, setSyncing } from '@/store/slices/connectionSlice';
import { useEffect } from 'react';

export function useOnlineStatus(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOnline(navigator.onLine));
    dispatch(setQueueLength(getQueueLength()));

    async function syncQueue(): Promise<void> {
      const length = getQueueLength();
      if (length === 0) return;

      dispatch(setSyncing(true));
      try {
        await flush((remaining) => dispatch(setQueueLength(remaining)));
      } finally {
        dispatch(setQueueLength(getQueueLength()));
        dispatch(setSyncing(false));
      }
    }

    function handleOnline(): void {
      dispatch(setOnline(true));
      syncQueue();
    }

    function handleOffline(): void {
      dispatch(setOnline(false));
    }

    function handleQueueChange(): void {
      dispatch(setQueueLength(getQueueLength()));
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
