import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    document.removeEventListener('keydown', () => {});
  });

  afterEach(() => {
    // Clean up
    document.removeEventListener('keydown', () => {});
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    expect(result.current.currentFocusIndex).toBe(-1);
    expect(result.current.isNavigating).toBe(false);
  });

  it('should handle arrow key navigation', () => {
    const mockElements = [
      { focus: vi.fn(), getAttribute: vi.fn(() => '0') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '1') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '2') },
    ] as any[];

    // Mock querySelectorAll to return our mock elements
    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    const { result } = renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
    }));

    // Simulate ArrowDown key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    expect(result.current.currentFocusIndex).toBe(0);
    expect(mockElements[0].focus).toHaveBeenCalled();
  });

  it('should handle arrow up navigation', () => {
    const mockElements = [
      { focus: vi.fn(), getAttribute: vi.fn(() => '0') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '1') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '2') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    const { result } = renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
    }));

    // Start from index 1
    act(() => {
      result.current.setFocusIndex(1);
    });

    // Simulate ArrowUp key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event);
    });

    expect(result.current.currentFocusIndex).toBe(0);
    expect(mockElements[0].focus).toHaveBeenCalled();
  });

  it('should wrap around at boundaries', () => {
    const mockElements = [
      { focus: vi.fn(), getAttribute: vi.fn(() => '0') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '1') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '2') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    const { result } = renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
      wrap: true,
    }));

    // Start from last index
    act(() => {
      result.current.setFocusIndex(2);
    });

    // Simulate ArrowDown key press (should wrap to first)
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    expect(result.current.currentFocusIndex).toBe(0);
    expect(mockElements[0].focus).toHaveBeenCalled();
  });

  it('should not wrap around when wrap is disabled', () => {
    const mockElements = [
      { focus: vi.fn(), getAttribute: vi.fn(() => '0') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '1') },
      { focus: vi.fn(), getAttribute: vi.fn(() => '2') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    const { result } = renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
      wrap: false,
    }));

    // Start from last index
    act(() => {
      result.current.setFocusIndex(2);
    });

    // Simulate ArrowDown key press (should stay at last)
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    expect(result.current.currentFocusIndex).toBe(2);
    expect(mockElements[2].focus).toHaveBeenCalled();
  });

  it('should handle Enter key activation', () => {
    const mockOnActivate = vi.fn();
    const mockElements = [
      { focus: vi.fn(), click: vi.fn(), getAttribute: vi.fn(() => '0') },
      { focus: vi.fn(), click: vi.fn(), getAttribute: vi.fn(() => '1') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
      onActivate: mockOnActivate,
    }));

    // Set focus to first element
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    // Simulate Enter key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
    });

    expect(mockOnActivate).toHaveBeenCalledWith(0, mockElements[0]);
    expect(mockElements[0].click).toHaveBeenCalled();
  });

  it('should handle Space key activation', () => {
    const mockOnActivate = vi.fn();
    const mockElements = [
      { focus: vi.fn(), click: vi.fn(), getAttribute: vi.fn(() => '0') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: true,
      onActivate: mockOnActivate,
    }));

    // Set focus to first element
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    // Simulate Space key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(mockOnActivate).toHaveBeenCalledWith(0, mockElements[0]);
    expect(mockElements[0].click).toHaveBeenCalled();
  });

  it('should not handle keys when disabled', () => {
    const mockElements = [
      { focus: vi.fn(), getAttribute: vi.fn(() => '0') },
    ] as any[];

    vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);

    const { result } = renderHook(() => useKeyboardNavigation({
      selector: '[data-keyboard-nav]',
      enabled: false,
    }));

    // Simulate ArrowDown key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    expect(result.current.currentFocusIndex).toBe(-1);
    expect(mockElements[0].focus).not.toHaveBeenCalled();
  });

  it('should reset focus index', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    act(() => {
      result.current.setFocusIndex(5);
    });

    expect(result.current.currentFocusIndex).toBe(5);

    act(() => {
      result.current.resetFocus();
    });

    expect(result.current.currentFocusIndex).toBe(-1);
  });

  it('should update navigation state correctly', () => {
    const { result } = renderHook(() => useKeyboardNavigation({
      enabled: true,
    }));

    expect(result.current.isNavigating).toBe(false);

    // Start navigation
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
    });

    expect(result.current.isNavigating).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation({
      enabled: true,
    }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});