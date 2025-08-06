import type { APIError } from '../types';

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logError?: boolean;
  fallbackData?: any;
  retryable?: boolean;
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  autoHide?: number; // milliseconds
}

class ErrorService {
  private errorListeners: Array<(notification: ErrorNotification) => void> = [];
  private errorLog: Array<{ error: APIError; timestamp: Date; context?: string }> = [];

  // Subscribe to error notifications
  subscribe(listener: (notification: ErrorNotification) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  // Handle API errors with graceful degradation
  handleAPIError(
    error: APIError,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): any {
    const {
      showNotification = true,
      logError = true,
      fallbackData = null,
      retryable = false
    } = options;

    // Log error if requested
    if (logError) {
      this.logError(error, context);
    }

    // Show notification if requested
    if (showNotification) {
      this.showErrorNotification(error, retryable);
    }

    // Return fallback data for graceful degradation
    return fallbackData;
  }

  // Handle specific error types
  handleNetworkError(context?: string): any {
    const error: APIError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      timestamp: new Date(),
    };

    return this.handleAPIError(error, context, {
      showNotification: true,
      fallbackData: this.getOfflineData(context),
      retryable: true,
    });
  }

  handleAuthError(context?: string): any {
    const error: APIError = {
      code: 'AUTH_ERROR',
      message: 'Authentication failed. Please log in again.',
      timestamp: new Date(),
    };

    return this.handleAPIError(error, context, {
      showNotification: true,
      fallbackData: null,
      retryable: false,
    });
  }

  handlePermissionError(context?: string): any {
    const error: APIError = {
      code: 'PERMISSION_ERROR',
      message: 'You do not have permission to perform this action.',
      timestamp: new Date(),
    };

    return this.handleAPIError(error, context, {
      showNotification: true,
      fallbackData: null,
      retryable: false,
    });
  }

  handleServerError(context?: string): any {
    const error: APIError = {
      code: 'SERVER_ERROR',
      message: 'Server error occurred. Please try again later.',
      timestamp: new Date(),
    };

    return this.handleAPIError(error, context, {
      showNotification: true,
      fallbackData: this.getOfflineData(context),
      retryable: true,
    });
  }

  // Show error notification to user
  private showErrorNotification(error: APIError, retryable: boolean = false): void {
    const notification: ErrorNotification = {
      id: Date.now().toString(),
      type: this.getNotificationType(error.code),
      title: this.getErrorTitle(error.code),
      message: error.message,
      timestamp: new Date(),
      dismissible: true,
      autoHide: retryable ? undefined : 5000,
    };

    this.errorListeners.forEach(listener => listener(notification));
  }

  // Log error for debugging and analytics
  private logError(error: APIError, context?: string): void {
    const logEntry = {
      error,
      timestamp: new Date(),
      context,
    };

    this.errorLog.push(logEntry);

    // Keep only last 100 errors in memory
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error(`[${context || 'API'}] Error:`, error);
    }

    // In production, you might want to send to analytics service
    // Example: analytics.track('api_error', { error, context });
  }

  // Get offline/fallback data based on context
  private getOfflineData(context?: string): any {
    const offlineData = localStorage.getItem(`offline_${context}`);
    if (offlineData) {
      try {
        return JSON.parse(offlineData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get notification type based on error code
  private getNotificationType(errorCode: string): 'error' | 'warning' | 'info' {
    switch (errorCode) {
      case 'NETWORK_ERROR':
      case 'SERVER_ERROR':
        return 'warning';
      case 'AUTH_ERROR':
      case 'PERMISSION_ERROR':
        return 'error';
      default:
        return 'error';
    }
  }

  // Get user-friendly error title
  private getErrorTitle(errorCode: string): string {
    switch (errorCode) {
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'AUTH_ERROR':
        return 'Authentication Required';
      case 'PERMISSION_ERROR':
        return 'Access Denied';
      case 'SERVER_ERROR':
        return 'Server Issue';
      default:
        return 'Error';
    }
  }

  // Get error log for debugging
  getErrorLog(): Array<{ error: APIError; timestamp: Date; context?: string }> {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check if error is retryable
  isRetryable(error: APIError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'HTTP_500',
      'HTTP_502',
      'HTTP_503',
      'HTTP_504',
    ];
    return retryableCodes.includes(error.code);
  }

  // Get retry delay based on error type
  getRetryDelay(error: APIError, attempt: number = 1): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    switch (error.code) {
      case 'NETWORK_ERROR':
        return Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      case 'SERVER_ERROR':
      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
        return Math.min(baseDelay * attempt, maxDelay);
      default:
        return baseDelay;
    }
  }
}

export const errorService = new ErrorService();