import { apiService } from './api';
import type { APIResponse } from '../types';

interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface OfflineData {
  key: string;
  data: any;
  timestamp: Date;
  expiresAt?: Date;
}

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private requestQueue: QueuedRequest[] = [];
  private offlineData: Map<string, OfflineData> = new Map();
  private onlineListeners: Array<(isOnline: boolean) => void> = [];
  private readonly STORAGE_KEY = 'neuroadaptive_offline_data';
  private readonly QUEUE_KEY = 'neuroadaptive_request_queue';

  constructor() {
    this.initializeOfflineSupport();
    this.loadOfflineData();
    this.loadRequestQueue();
  }

  // Initialize offline support
  private initializeOfflineSupport(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Periodically check connection status
    setInterval(() => {
      this.checkConnectionStatus();
    }, 30000); // Check every 30 seconds
  }

  // Handle online event
  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyOnlineListeners(true);
    this.processRequestQueue();
  };

  // Handle offline event
  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyOnlineListeners(false);
  };

  // Check connection status by making a lightweight request
  private async checkConnectionStatus(): Promise<void> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOnline !== this.isOnline) {
        this.notifyOnlineListeners(this.isOnline);
        if (this.isOnline) {
          this.processRequestQueue();
        }
      }
    } catch {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      if (wasOnline !== this.isOnline) {
        this.notifyOnlineListeners(false);
      }
    }
  }

  // Subscribe to online/offline status changes
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.onlineListeners.push(listener);
    return () => {
      this.onlineListeners = this.onlineListeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of online status changes
  private notifyOnlineListeners(isOnline: boolean): void {
    this.onlineListeners.forEach(listener => listener(isOnline));
  }

  // Get current online status
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Queue request for later execution when online
  queueRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    maxRetries: number = 3
  ): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        method,
        url,
        data,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries,
        resolve,
        reject,
      };

      this.requestQueue.push(queuedRequest);
      this.saveRequestQueue();

      // If we're online, process immediately
      if (this.isOnline) {
        this.processRequestQueue();
      }
    });
  }

  // Process queued requests when online
  private async processRequestQueue(): Promise<void> {
    if (!this.isOnline || this.requestQueue.length === 0) {
      return;
    }

    const requestsToProcess = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requestsToProcess) {
      try {
        let response: APIResponse<any>;

        switch (request.method) {
          case 'GET':
            response = await apiService.get(request.url);
            break;
          case 'POST':
            response = await apiService.post(request.url, request.data);
            break;
          case 'PUT':
            response = await apiService.put(request.url, request.data);
            break;
          case 'PATCH':
            response = await apiService.patch(request.url, request.data);
            break;
          case 'DELETE':
            response = await apiService.delete(request.url);
            break;
          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }

        request.resolve(response);
      } catch (error) {
        request.retryCount++;

        if (request.retryCount < request.maxRetries) {
          // Re-queue for retry
          this.requestQueue.push(request);
        } else {
          request.reject(error);
        }
      }
    }

    this.saveRequestQueue();
  }

  // Store data for offline access
  storeOfflineData(key: string, data: any, expirationMinutes?: number): void {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: new Date(),
      expiresAt: expirationMinutes 
        ? new Date(Date.now() + expirationMinutes * 60 * 1000)
        : undefined,
    };

    this.offlineData.set(key, offlineData);
    this.saveOfflineData();
  }

  // Retrieve offline data
  getOfflineData<T>(key: string): T | null {
    const offlineData = this.offlineData.get(key);
    
    if (!offlineData) {
      return null;
    }

    // Check if data has expired
    if (offlineData.expiresAt && offlineData.expiresAt < new Date()) {
      this.offlineData.delete(key);
      this.saveOfflineData();
      return null;
    }

    return offlineData.data;
  }

  // Remove offline data
  removeOfflineData(key: string): void {
    this.offlineData.delete(key);
    this.saveOfflineData();
  }

  // Clear all offline data
  clearOfflineData(): void {
    this.offlineData.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get all offline data keys
  getOfflineDataKeys(): string[] {
    return Array.from(this.offlineData.keys());
  }

  // Check if data exists offline
  hasOfflineData(key: string): boolean {
    return this.offlineData.has(key) && this.getOfflineData(key) !== null;
  }

  // Save offline data to localStorage
  private saveOfflineData(): void {
    try {
      const dataArray = Array.from(this.offlineData.entries()).map(([key, data]) => ({
        key: key,
        data: data,
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataArray));
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  }

  // Load offline data from localStorage
  private loadOfflineData(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const dataArray = JSON.parse(storedData);
        dataArray.forEach((item: any) => {
          const offlineData: OfflineData = {
            key: item.key,
            data: item.data,
            timestamp: new Date(item.timestamp),
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
          };
          this.offlineData.set(item.key, offlineData);
        });

        // Clean up expired data
        this.cleanupExpiredData();
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error);
    }
  }

  // Save request queue to localStorage
  private saveRequestQueue(): void {
    try {
      const queueData = this.requestQueue.map(request => ({
        ...request,
        resolve: undefined, // Can't serialize functions
        reject: undefined,
      }));
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queueData));
    } catch (error) {
      console.warn('Failed to save request queue:', error);
    }
  }

  // Load request queue from localStorage
  private loadRequestQueue(): void {
    try {
      const storedQueue = localStorage.getItem(this.QUEUE_KEY);
      if (storedQueue) {
        // Note: We can't restore the resolve/reject functions,
        // so these requests will be lost on page reload
        // In a production app, you might want to implement a different strategy
        localStorage.removeItem(this.QUEUE_KEY);
      }
    } catch (error) {
      console.warn('Failed to load request queue:', error);
    }
  }

  // Clean up expired offline data
  private cleanupExpiredData(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    this.offlineData.forEach((data, key) => {
      if (data.expiresAt && data.expiresAt < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.offlineData.delete(key);
    });

    if (keysToDelete.length > 0) {
      this.saveOfflineData();
    }
  }

  // Get queue status
  getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    oldestRequest?: Date;
  } {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isOnline && this.requestQueue.length > 0,
      oldestRequest: this.requestQueue.length > 0 
        ? this.requestQueue[0].timestamp 
        : undefined,
    };
  }

  // Clear request queue
  clearRequestQueue(): void {
    this.requestQueue = [];
    localStorage.removeItem(this.QUEUE_KEY);
  }

  // Cleanup on destroy
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

export const offlineService = new OfflineService();