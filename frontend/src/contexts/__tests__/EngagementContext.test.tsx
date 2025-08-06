import { render, renderHook, act } from '@testing-library/react';
import { EngagementProvider, useEngagement } from '../EngagementContext';
import type { EmotionState, ContentContext } from '../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EngagementProvider>{children}</EngagementProvider>
);

describe('EngagementContext', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    expect(result.current.webcamEnabled).toBe(false);
    expect(result.current.engagementLevel).toBe('medium');
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.emotionState.primary).toBe('focused');
  });

  it('should toggle webcam correctly', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    act(() => {
      result.current.toggleWebcam();
    });

    expect(result.current.webcamEnabled).toBe(true);

    act(() => {
      result.current.toggleWebcam();
    });

    expect(result.current.webcamEnabled).toBe(false);
  });

  it('should update engagement level', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    act(() => {
      result.current.updateEngagement('high');
    });

    expect(result.current.engagementLevel).toBe('high');
  });

  it('should update emotion state', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    const newEmotionState: EmotionState = {
      primary: 'confused',
      confidence: 0.8,
      timestamp: new Date()
    };

    act(() => {
      result.current.updateEmotionState(newEmotionState);
    });

    expect(result.current.emotionState.primary).toBe('confused');
    expect(result.current.emotionState.confidence).toBe(0.8);
  });

  it('should update behavior metrics', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    act(() => {
      result.current.updateBehaviorMetrics({
        mouseActivity: 5,
        scrollSpeed: 2
      });
    });

    expect(result.current.behaviorMetrics.mouseActivity).toBe(5);
    expect(result.current.behaviorMetrics.scrollSpeed).toBe(2);
  });

  it('should start and stop monitoring', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    act(() => {
      result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);

    act(() => {
      result.current.stopMonitoring();
    });

    expect(result.current.isMonitoring).toBe(false);
  });

  it('should reset metrics correctly', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    // Set some values first
    act(() => {
      result.current.updateBehaviorMetrics({
        mouseActivity: 10,
        scrollSpeed: 5
      });
      result.current.updateEngagement('high');
    });

    // Reset metrics
    act(() => {
      result.current.resetMetrics();
    });

    expect(result.current.behaviorMetrics.mouseActivity).toBe(0);
    expect(result.current.behaviorMetrics.scrollSpeed).toBe(0);
    expect(result.current.engagementLevel).toBe('medium');
  });

  it('should generate engagement point correctly', () => {
    const { result } = renderHook(() => useEngagement(), { wrapper });

    const contentContext: ContentContext = {
      contentId: 'content1',
      contentType: 'text',
      position: 0
    };

    act(() => {
      result.current.updateEngagement('high');
    });

    const engagementPoint = result.current.getEngagementPoint(contentContext);

    expect(engagementPoint.level).toBe('high');
    expect(engagementPoint.contentContext).toEqual(contentContext);
    expect(engagementPoint.timestamp).toBeInstanceOf(Date);
    expect(engagementPoint.emotionState).toBeDefined();
    expect(engagementPoint.behaviorMetrics).toBeDefined();
  });
});

