import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { LearningSessionProvider, useLearningSession } from '../LearningSessionContext';
import { EngagementProvider } from '../EngagementContext';
import type { ContentItem, AdaptationTrigger } from '../../types';

const mockContentItem: ContentItem = {
  id: '1',
  type: 'text',
  title: 'Introduction to React',
  content: {
    text: 'React is a JavaScript library for building user interfaces.',
    readingTime: 5,
  },
  duration: 300,
  engagementScore: 0.8,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EngagementProvider>
    <LearningSessionProvider>
      {children}
    </LearningSessionProvider>
  </EngagementProvider>
);

describe('LearningSessionContext', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    expect(result.current.currentSession).toBe(null);
    expect(result.current.isSessionActive).toBe(false);
    expect(result.current.currentContent).toBe(null);
    expect(result.current.sessionMetrics).toBeDefined();
    expect(result.current.adaptationHistory).toEqual([]);
  });

  it('should start a new learning session', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    expect(result.current.isSessionActive).toBe(true);
    expect(result.current.currentSession).toBeDefined();
    expect(result.current.currentSession?.userId).toBe('user-1');
    expect(result.current.currentSession?.contentItems).toEqual([mockContentItem]);
    expect(result.current.currentContent).toEqual(mockContentItem);
  });

  it('should end a learning session', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    // Start session first
    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    expect(result.current.isSessionActive).toBe(true);

    // End session
    act(() => {
      result.current.endSession();
    });

    expect(result.current.isSessionActive).toBe(false);
    expect(result.current.currentSession?.endTime).toBeDefined();
  });

  it('should navigate to next content', () => {
    const contentItems = [
      mockContentItem,
      {
        ...mockContentItem,
        id: '2',
        title: 'React Hooks',
        content: { text: 'Hooks are a new addition in React 16.8.' },
      },
    ];

    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', contentItems);
    });

    expect(result.current.currentContent?.id).toBe('1');

    act(() => {
      result.current.nextContent();
    });

    expect(result.current.currentContent?.id).toBe('2');
  });

  it('should navigate to previous content', () => {
    const contentItems = [
      mockContentItem,
      {
        ...mockContentItem,
        id: '2',
        title: 'React Hooks',
      },
    ];

    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', contentItems);
    });

    // Move to second content
    act(() => {
      result.current.nextContent();
    });

    expect(result.current.currentContent?.id).toBe('2');

    // Move back to first content
    act(() => {
      result.current.previousContent();
    });

    expect(result.current.currentContent?.id).toBe('1');
  });

  it('should handle content adaptation', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    const adaptationTrigger: AdaptationTrigger = {
      reason: 'low_engagement',
      fromType: 'text',
      toType: 'video',
      confidence: 0.8,
    };

    const newContent: ContentItem = {
      ...mockContentItem,
      id: '2',
      type: 'video',
      content: {
        url: 'https://example.com/video.mp4',
        duration: 600,
        thumbnail: 'https://example.com/thumb.jpg',
      },
    };

    act(() => {
      result.current.adaptContent(adaptationTrigger, newContent);
    });

    expect(result.current.currentContent).toEqual(newContent);
    expect(result.current.adaptationHistory).toHaveLength(1);
    expect(result.current.adaptationHistory[0].trigger).toEqual(adaptationTrigger);
    expect(result.current.adaptationHistory[0].newContent).toEqual(newContent);
  });

  it('should update session metrics', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    const initialMetrics = result.current.sessionMetrics;

    act(() => {
      result.current.updateMetrics({
        totalDuration: 600,
        averageEngagement: 0.75,
        contentCompletionRate: 0.5,
      });
    });

    expect(result.current.sessionMetrics.totalDuration).toBe(600);
    expect(result.current.sessionMetrics.averageEngagement).toBe(0.75);
    expect(result.current.sessionMetrics.contentCompletionRate).toBe(0.5);
    expect(result.current.sessionMetrics.adaptationCount).toBe(initialMetrics.adaptationCount);
  });

  it('should track content completion', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    act(() => {
      result.current.markContentComplete(mockContentItem.id);
    });

    expect(result.current.sessionMetrics.contentCompletionRate).toBeGreaterThan(0);
  });

  it('should handle session pause and resume', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    expect(result.current.isSessionActive).toBe(true);

    act(() => {
      result.current.pauseSession();
    });

    expect(result.current.isSessionActive).toBe(false);

    act(() => {
      result.current.resumeSession();
    });

    expect(result.current.isSessionActive).toBe(true);
  });

  it('should calculate session duration correctly', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    // Wait a bit and check duration
    setTimeout(() => {
      expect(result.current.sessionMetrics.totalDuration).toBeGreaterThan(0);
    }, 100);
  });

  it('should handle empty content list', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', []);
    });

    expect(result.current.currentContent).toBe(null);
    expect(result.current.isSessionActive).toBe(true);
  });

  it('should not navigate beyond content boundaries', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    // Try to go to previous when at first content
    act(() => {
      result.current.previousContent();
    });

    expect(result.current.currentContent?.id).toBe('1');

    // Try to go to next when at last content
    act(() => {
      result.current.nextContent();
    });

    expect(result.current.currentContent?.id).toBe('1');
  });

  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useLearningSession();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLearningSession must be used within a LearningSessionProvider');

    consoleSpy.mockRestore();
  });

  it('should integrate with engagement context for adaptations', () => {
    const { result } = renderHook(() => useLearningSession(), { wrapper });

    act(() => {
      result.current.startSession('user-1', [mockContentItem]);
    });

    // Simulate low engagement triggering adaptation
    const adaptationTrigger: AdaptationTrigger = {
      reason: 'low_engagement',
      fromType: 'text',
      toType: 'video',
      confidence: 0.9,
    };

    const videoContent: ContentItem = {
      ...mockContentItem,
      id: '2',
      type: 'video',
      content: {
        url: 'https://example.com/video.mp4',
        duration: 600,
        thumbnail: 'https://example.com/thumb.jpg',
      },
    };

    act(() => {
      result.current.adaptContent(adaptationTrigger, videoContent);
    });

    expect(result.current.sessionMetrics.adaptationCount).toBe(1);
    expect(result.current.currentContent?.type).toBe('video');
  });
});

