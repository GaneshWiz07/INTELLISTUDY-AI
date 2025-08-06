import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

interface OfflineStatus {
  isOnline: boolean;
  queueLength: number;
  isProcessing: boolean;
  oldestRequest?: Date;
}

export const useOfflineStatus = (): OfflineStatus => {
  const [isOnline, setIsOnline] = useState(offlineService.getOnlineStatus());
  const [queueStatus, setQueueStatus] = useState(offlineService.getQueueStatus());

  useEffect(() => {
    // Subscribe to online status changes
    const unsubscribeOnline = offlineService.subscribe(setIsOnline);

    // Update queue status periodically
    const updateQueueStatus = () => {
      setQueueStatus(offlineService.getQueueStatus());
    };

    const interval = setInterval(updateQueueStatus, 1000);
    updateQueueStatus(); // Initial update

    return () => {
      unsubscribeOnline();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    queueLength: queueStatus.queueLength,
    isProcessing: queueStatus.isProcessing,
    oldestRequest: queueStatus.oldestRequest,
  };
};