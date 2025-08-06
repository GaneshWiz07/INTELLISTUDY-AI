import { apiService } from './api';
import { offlineService } from './offlineService';
import { errorService } from './errorService';
import type { APIResponse, APIError } from '../types';

interface ApiOptions {
  useOfflineQueue?: boolean;
  cacheKey?: string;
  cacheExpirationMinutes?: number;
  showErrorNotification?: boolean;
  fallbackData?: any;
  maxRetries?: number;
}

class EnhancedApiService {
  // Enhanced GET request with offline support and caching
  async get<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useOfflineQueue = true,
      cacheKey,
      cacheExpirationMinutes = 30,
      showErrorNotification = true,
      fallbackData = null,
      maxRetries = 3,
    } = options;

    // Check for cached data first
    if (cacheKey) {
      const cachedData = offlineService.getOfflineData<APIResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // If offline and queue is enabled, queue the request
      if (!offlineService.getOnlineStatus() && useOfflineQueue) {
        return await offlineService.queueRequest<T>('GET', url, undefined, maxRetries);
      }

      const response = await apiService.get<T>(url);

      // Cache successful response
      if (cacheKey && response.success) {
        offlineService.storeOfflineData(cacheKey, response, cacheExpirationMinutes);
      }

      return response;
    } catch (error) {
      return this.handleError<T>(error as APIError, 'GET', {
        showErrorNotification,
        fallbackData,
        cacheKey,
      });
    }
  }

  // Enhanced POST request with offline support
  async post<T>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useOfflineQueue = true,
      showErrorNotification = true,
      fallbackData = null,
      maxRetries = 3,
    } = options;

    try {
      // If offline and queue is enabled, queue the request
      if (!offlineService.getOnlineStatus() && useOfflineQueue) {
        return await offlineService.queueRequest<T>('POST', url, data, maxRetries);
      }

      return await apiService.post<T>(url, data);
    } catch (error) {
      return this.handleError<T>(error as APIError, 'POST', {
        showErrorNotification,
        fallbackData,
      });
    }
  }

  // Enhanced PUT request with offline support
  async put<T>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useOfflineQueue = true,
      showErrorNotification = true,
      fallbackData = null,
      maxRetries = 3,
    } = options;

    try {
      // If offline and queue is enabled, queue the request
      if (!offlineService.getOnlineStatus() && useOfflineQueue) {
        return await offlineService.queueRequest<T>('PUT', url, data, maxRetries);
      }

      return await apiService.put<T>(url, data);
    } catch (error) {
      return this.handleError<T>(error as APIError, 'PUT', {
        showErrorNotification,
        fallbackData,
      });
    }
  }

  // Enhanced PATCH request with offline support
  async patch<T>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useOfflineQueue = true,
      showErrorNotification = true,
      fallbackData = null,
      maxRetries = 3,
    } = options;

    try {
      // If offline and queue is enabled, queue the request
      if (!offlineService.getOnlineStatus() && useOfflineQueue) {
        return await offlineService.queueRequest<T>('PATCH', url, data, maxRetries);
      }

      return await apiService.patch<T>(url, data);
    } catch (error) {
      return this.handleError<T>(error as APIError, 'PATCH', {
        showErrorNotification,
        fallbackData,
      });
    }
  }

  // Enhanced DELETE request with offline support
  async delete<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useOfflineQueue = true,
      showErrorNotification = true,
      fallbackData = null,
      maxRetries = 3,
    } = options;

    try {
      // If offline and queue is enabled, queue the request
      if (!offlineService.getOnlineStatus() && useOfflineQueue) {
        return await offlineService.queueRequest<T>('DELETE', url, undefined, maxRetries);
      }

      return await apiService.delete<T>(url);
    } catch (error) {
      return this.handleError<T>(error as APIError, 'DELETE', {
        showErrorNotification,
        fallbackData,
      });
    }
  }

  // File upload with progress tracking
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    options: ApiOptions = {}
  ): Promise<APIResponse<T>> {
    const { showErrorNotification = true, fallbackData = null } = options;

    try {
      return await apiService.upload<T>(url, formData, (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      });
    } catch (error) {
      return this.handleError<T>(error as APIError, 'UPLOAD', {
        showErrorNotification,
        fallbackData,
      });
    }
  }

  // File download
  async download(
    url: string,
    filename?: string,
    options: ApiOptions = {}
  ): Promise<void> {
    const { showErrorNotification = true } = options;

    try {
      await apiService.download(url, filename);
    } catch (error) {
      errorService.handleAPIError(error as APIError, 'DOWNLOAD', {
        showNotification: showErrorNotification,
      });
      throw error;
    }
  }

  // Clear cached data
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      offlineService.removeOfflineData(cacheKey);
    } else {
      offlineService.clearOfflineData();
    }
  }

  // Get cached data
  getCachedData<T>(cacheKey: string): T | null {
    return offlineService.getOfflineData<T>(cacheKey);
  }

  // Check if data is cached
  hasCachedData(cacheKey: string): boolean {
    return offlineService.hasOfflineData(cacheKey);
  }

  // Handle errors with graceful degradation
  private handleError<T>(
    error: APIError,
    method: string,
    options: {
      showErrorNotification?: boolean;
      fallbackData?: any;
      cacheKey?: string;
    }
  ): APIResponse<T> {
    const { showErrorNotification = true, fallbackData = null, cacheKey } = options;

    // Try to get cached data as fallback
    let fallback = fallbackData;
    if (!fallback && cacheKey) {
      fallback = offlineService.getOfflineData(cacheKey);
    }

    // Handle the error through error service
    const result = errorService.handleAPIError(error, method, {
      showNotification: showErrorNotification,
      fallbackData: fallback,
      retryable: errorService.isRetryable(error),
    });

    // Return fallback response structure
    return {
      success: false,
      data: result,
      message: error.message,
    };
  }
}

export const enhancedApiService = new EnhancedApiService();