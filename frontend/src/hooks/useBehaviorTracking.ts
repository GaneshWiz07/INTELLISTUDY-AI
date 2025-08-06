import { useState, useEffect, useCallback, useRef } from 'react';
import type { BehaviorMetrics } from '../types';

interface BehaviorTrackingOptions {
  trackingInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface BehaviorTrackingData extends BehaviorMetrics {
  isActive: boolean;
  lastActivity: Date;
}

export const useBehaviorTracking = (options: BehaviorTrackingOptions = {}) => {
  const { trackingInterval = 1000, enabled = true } = options;
  
  const [behaviorData, setBehaviorData] = useState<BehaviorTrackingData>({
    mouseActivity: 0,
    scrollSpeed: 0,
    typingActivity: 0,
    focusTime: 0,
    clickFrequency: 0,
    isActive: false,
    lastActivity: new Date()
  });

  // Refs to track activity counters
  const mouseMovements = useRef(0);
  const scrollEvents = useRef(0);
  const keystrokes = useRef(0);
  const clicks = useRef(0);
  const focusStartTime = useRef<number | null>(null);
  const totalFocusTime = useRef(0);
  const lastActivityTime = useRef(Date.now());

  // Reset counters
  const resetCounters = useCallback(() => {
    mouseMovements.current = 0;
    scrollEvents.current = 0;
    keystrokes.current = 0;
    clicks.current = 0;
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
    setBehaviorData(prev => ({
      ...prev,
      lastActivity: new Date(),
      isActive: true
    }));
  }, []);

  // Mouse activity tracking
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = () => {
      mouseMovements.current++;
      updateActivity();
    };

    const handleClick = () => {
      clicks.current++;
      updateActivity();
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [enabled, updateActivity]);

  // Scroll tracking
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      scrollEvents.current++;
      updateActivity();
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, updateActivity]);

  // Keyboard activity tracking
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = () => {
      keystrokes.current++;
      updateActivity();
    };

    const handleKeyDown = () => {
      keystrokes.current++;
      updateActivity();
    };

    document.addEventListener('keypress', handleKeyPress, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, updateActivity]);

  // Focus tracking
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      focusStartTime.current = Date.now();
      updateActivity();
    };

    const handleBlur = () => {
      if (focusStartTime.current) {
        const focusSession = Date.now() - focusStartTime.current;
        totalFocusTime.current += focusSession;
        focusStartTime.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize focus tracking if page is already focused
    if (document.hasFocus()) {
      handleFocus();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Add any remaining focus time
      if (focusStartTime.current) {
        const focusSession = Date.now() - focusStartTime.current;
        totalFocusTime.current += focusSession;
      }
    };
  }, [enabled, updateActivity]);

  // Periodic metrics calculation
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const intervalSeconds = trackingInterval / 1000;
      
      // Calculate metrics per second
      const mouseActivityRate = mouseMovements.current / intervalSeconds;
      const scrollSpeedRate = scrollEvents.current / intervalSeconds;
      const typingActivityRate = keystrokes.current / intervalSeconds;
      const clickFrequencyRate = clicks.current / intervalSeconds;
      
      // Calculate focus time (including current session if focused)
      let currentFocusTime = totalFocusTime.current;
      if (focusStartTime.current) {
        currentFocusTime += now - focusStartTime.current;
      }
      const focusTimeSeconds = currentFocusTime / 1000;
      
      // Determine if user is currently active (activity within last 5 seconds)
      const timeSinceLastActivity = now - lastActivityTime.current;
      const isCurrentlyActive = timeSinceLastActivity < 5000;

      setBehaviorData(() => ({
        mouseActivity: mouseActivityRate,
        scrollSpeed: scrollSpeedRate,
        typingActivity: typingActivityRate,
        focusTime: focusTimeSeconds,
        clickFrequency: clickFrequencyRate,
        isActive: isCurrentlyActive,
        lastActivity: new Date(lastActivityTime.current)
      }));

      // Reset counters for next interval
      resetCounters();
    }, trackingInterval);

    return () => clearInterval(interval);
  }, [enabled, trackingInterval, resetCounters]);

  // Reset all tracking data
  const resetTracking = useCallback(() => {
    resetCounters();
    totalFocusTime.current = 0;
    focusStartTime.current = document.hasFocus() ? Date.now() : null;
    lastActivityTime.current = Date.now();
    
    setBehaviorData({
      mouseActivity: 0,
      scrollSpeed: 0,
      typingActivity: 0,
      focusTime: 0,
      clickFrequency: 0,
      isActive: false,
      lastActivity: new Date()
    });
  }, [resetCounters]);

  return {
    behaviorData,
    resetTracking,
    isTracking: enabled
  };
};