import { renderHook, act } from '@testing-library/react';
import { useOfflineStatus } from '../useOfflineStatus';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useOfflineStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Clean up event listeners
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
  });

  it('should initialize with current online status', () => {
    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should initialize as offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should update status when coming back online', () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOnline).toBe(false);

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should provide last online timestamp', () => {
    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.lastOnline).toBeInstanceOf(Date);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const beforeOffline = new Date();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // lastOnline should be close to when we went offline
    expect(result.current.lastOnline.getTime()).toBeGreaterThanOrEqual(beforeOffline.getTime() - 100);
    expect(result.current.lastOnline.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should update last online timestamp when coming back online', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineStatus());

    const initialLastOnline = result.current.lastOnline;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Come back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.lastOnline.getTime()).toBeGreaterThan(initialLastOnline.getTime());
  });

  it('should provide connection quality indicator', () => {
    const { result } = renderHook(() => useOfflineStatus());

    // When online, should have connection quality
    expect(result.current.connectionQuality).toBeDefined();
    expect(['good', 'poor', 'unknown']).toContain(result.current.connectionQuality);
  });

  it('should handle rapid online/offline changes', () => {
    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOnline).toBe(true);

    // Rapid offline/online changes
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineStatus());

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});