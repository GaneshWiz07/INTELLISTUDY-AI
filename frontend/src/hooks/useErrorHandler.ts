import { useCallback } from 'react';
import { errorService, type ErrorHandlerOptions } from '../services/errorService';
import { notificationService } from '../services/notificationService';
import type { APIError } from '../types';

interface UseErrorHandlerReturn {
  handleError: (error: APIError, context?: string, options?: ErrorHandlerOptions) => any;
  handleNetworkError: (context?: string) => any;
  handleAuthError: (context?: string) => any;
  handlePermissionError: (context?: string) => any;
  handleServerError: (context?: string) => any;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((
    error: APIError,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    // Subscribe to error notifications if not already subscribed
    if (options.showNotification !== false) {
      errorService.subscribe((notification) => {
        notificationService.addNotification(
          notification.type,
          notification.title,
          notification.message,
          {
            dismissible: notification.dismissible,
            autoHide: notification.autoHide,
            id: notification.id,
          }
        );
      });
    }

    return errorService.handleAPIError(error, context, options);
  }, []);

  const handleNetworkError = useCallback((context?: string) => {
    return errorService.handleNetworkError(context);
  }, []);

  const handleAuthError = useCallback((context?: string) => {
    return errorService.handleAuthError(context);
  }, []);

  const handlePermissionError = useCallback((context?: string) => {
    return errorService.handlePermissionError(context);
  }, []);

  const handleServerError = useCallback((context?: string) => {
    return errorService.handleServerError(context);
  }, []);

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    handlePermissionError,
    handleServerError,
  };
};