import { renderHook, act } from '@testing-library/react';
import { useBehaviorTracking } from '../useBehaviorTracking';

// Mock DOM methods
Object.defineProperty(document, 'hasFocus', {
  value: jest.fn(() => true),
  writable: true
});

describe('useBehaviorTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useBehaviorTracking());
    
    expect(result.current.behaviorData.mouseActivity).toBe(0);
    expect(result.current.behaviorData.scrollSpeed).toBe(0);
    expect(result.current.behaviorData.typingActivity).toBe(0);
    expect(result.current.behaviorData.focusTime).toBe(0);
    expect(result.current.behaviorData.clickFrequency).toBe(0);
    expect(result.current.isTracking).toBe(true);
  });

  it('can be disabled', () => {
    const { result } = renderHook(() => useBehaviorTracking({ enabled: false }));
    
    expect(result.current.isTracking).toBe(false);
  });

  it('allows custom tracking interval', () => {
    const { result } = renderHook(() => useBehaviorTracking({ trackingInterval: 2000 }));
    
    expect(result.current.isTracking).toBe(true);
  });

  it('provides reset functionality', () => {
    const { result } = renderHook(() => useBehaviorTracking());
    
    act(() => {
      result.current.resetTracking();
    });
    
    expect(result.current.behaviorData.mouseActivity).toBe(0);
    expect(result.current.behaviorData.scrollSpeed).toBe(0);
    expect(result.current.behaviorData.typingActivity).toBe(0);
    expect(result.current.behaviorData.focusTime).toBe(0);
    expect(result.current.behaviorData.clickFrequency).toBe(0);
  });

  it('tracks activity state', () => {
    const { result } = renderHook(() => useBehaviorTracking());
    
    expect(result.current.behaviorData.isActive).toBe(false);
    expect(result.current.behaviorData.lastActivity).toBeInstanceOf(Date);
  });
});