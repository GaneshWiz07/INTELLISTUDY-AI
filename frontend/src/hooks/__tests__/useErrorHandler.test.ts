import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { errorService } from '../../services/errorService';
import { notificationService } from '../../services/notificationService';
import type { APIError } from '../../types';

// Mock the services
vi.mock('../../services/errorService');
vi.mock('../../services/notificationService');

const mockErrorService = vi.mocked(errorService);
const mockNotificationService = vi.mocked(notificationService);

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with all error handling methods', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.handleError).toBeDefined();
    expect(result.current.handleNetworkError).toBeDefined();
    expect(result.current.handleAuthError).toBeDefined();
    expect(result.current.handlePermissionError).toBeDefined();
    expect(result.current.handleServerError).toBeDefined();
  });

  it('should handle API errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockError: APIError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: { field: 'email' },
      timestamp: new Date(),
    };

    const mockHandleResult = { handled: true, shouldRetry: false };
    mockErrorService.handleAPIError.mockReturnValue(mockHandleResult);

    act(() => {
      const result_value = result.current.handleError(mockError, 'login form');
      expect(result_value).toEqual(mockHandleResult);
    });

    expect(mockErrorService.handleAPIError).toHaveBeenCalledWith(
      mockError,
      'login form',
      {}
    );
  });

  it('should handle API errors with custom options', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockError: APIError = {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: null,
      timestamp: new Date(),
    };

    const options = {
      showNotification: false,
      retry: true,
      maxRetries: 3,
    };

    act(() => {
      result.current.handleError(mockError, 'API call', options);
    });

    expect(mockErrorService.handleAPIError).toHaveBeenCalledWith(
      mockError,
      'API call',
      options
    );
  });

  it('should subscribe to error notifications when showNotification is not false', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockError: APIError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: null,
      timestamp: new Date(),
    };

    const mockSubscribeCallback = vi.fn();
    mockErrorService.subscribe.mockImplementation((callback) => {
      mockSubscribeCallback.mockImplementation(callback);
      return () => {}; // unsubscribe function
    });

    act(() => {
      result.current.handleError(mockError);
    });

    expect(mockErrorService.subscribe).toHaveBeenCalled();

    // Simulate notification
    const mockNotification = {
      type: 'error' as const,
      title: 'Error',
      message: 'Something went wrong',
      dismissible: true,
      autoHide: true,
      id: 'error-1',
    };

    act(() => {
      mockSubscribeCallback(mockNotification);
    });

    expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
      'error',
      'Error',
      'Something went wrong',
      {
        dismissible: true,
        autoHide: true,
        id: 'error-1',
      }
    );
  });

  it('should not subscribe to notifications when showNotification is false', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockError: APIError = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: null,
      timestamp: new Date(),
    };

    act(() => {
      result.current.handleError(mockError, 'form', { showNotification: false });
    });

    expect(mockErrorService.subscribe).not.toHaveBeenCalled();
  });

  it('should handle network errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockHandleResult = { handled: true, shouldRetry: true };
    mockErrorService.handleNetworkError.mockReturnValue(mockHandleResult);

    act(() => {
      const result_value = result.current.handleNetworkError('API request');
      expect(result_value).toEqual(mockHandleResult);
    });

    expect(mockErrorService.handleNetworkError).toHaveBeenCalledWith('API request');
  });

  it('should handle auth errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockHandleResult = { handled: true, shouldRedirect: true };
    mockErrorService.handleAuthError.mockReturnValue(mockHandleResult);

    act(() => {
      const result_value = result.current.handleAuthError('token validation');
      expect(result_value).toEqual(mockHandleResult);
    });

    expect(mockErrorService.handleAuthError).toHaveBeenCalledWith('token validation');
  });

  it('should handle permission errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockHandleResult = { handled: true, showMessage: true };
    mockErrorService.handlePermissionError.mockReturnValue(mockHandleResult);

    act(() => {
      const result_value = result.current.handlePermissionError('admin access');
      expect(result_value).toEqual(mockHandleResult);
    });

    expect(mockErrorService.handlePermissionError).toHaveBeenCalledWith('admin access');
  });

  it('should handle server errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockHandleResult = { handled: true, shouldRetry: false };
    mockErrorService.handleServerError.mockReturnValue(mockHandleResult);

    act(() => {
      const result_value = result.current.handleServerError('database operation');
      expect(result_value).toEqual(mockHandleResult);
    });

    expect(mockErrorService.handleServerError).toHaveBeenCalledWith('database operation');
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useErrorHandler());

    const firstRender = {
      handleError: result.current.handleError,
      handleNetworkError: result.current.handleNetworkError,
      handleAuthError: result.current.handleAuthError,
      handlePermissionError: result.current.handlePermissionError,
      handleServerError: result.current.handleServerError,
    };

    rerender();

    expect(result.current.handleError).toBe(firstRender.handleError);
    expect(result.current.handleNetworkError).toBe(firstRender.handleNetworkError);
    expect(result.current.handleAuthError).toBe(firstRender.handleAuthError);
    expect(result.current.handlePermissionError).toBe(firstRender.handlePermissionError);
    expect(result.current.handleServerError).toBe(firstRender.handleServerError);
  });
});