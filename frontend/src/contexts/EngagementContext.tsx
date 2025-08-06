import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  EngagementPoint,
  BehaviorMetrics,
  EmotionState,
  EngagementLevel,
  ContentContext
} from '../types';

// Engagement Context Types
export interface EngagementContextType {
  webcamEnabled: boolean;
  emotionState: EmotionState;
  behaviorMetrics: BehaviorMetrics;
  engagementLevel: EngagementLevel;
  isMonitoring: boolean;
  toggleWebcam: () => void;
  updateEngagement: (level: EngagementLevel) => void;
  updateEmotionState: (emotion: EmotionState) => void;
  updateBehaviorMetrics: (metrics: Partial<BehaviorMetrics>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getEngagementPoint: (contentContext: ContentContext) => EngagementPoint;
  resetMetrics: () => void;
}

// Engagement State
interface EngagementState {
  webcamEnabled: boolean;
  emotionState: EmotionState;
  behaviorMetrics: BehaviorMetrics;
  engagementLevel: EngagementLevel;
  isMonitoring: boolean;
  lastActivity: Date;
}

// Engagement Actions
type EngagementAction =
  | { type: 'TOGGLE_WEBCAM' }
  | { type: 'UPDATE_ENGAGEMENT'; payload: EngagementLevel }
  | { type: 'UPDATE_EMOTION'; payload: EmotionState }
  | { type: 'UPDATE_BEHAVIOR'; payload: Partial<BehaviorMetrics> }
  | { type: 'START_MONITORING' }
  | { type: 'STOP_MONITORING' }
  | { type: 'RESET_METRICS' }
  | { type: 'UPDATE_ACTIVITY' };

// Initial state
const initialBehaviorMetrics: BehaviorMetrics = {
  mouseActivity: 0,
  scrollSpeed: 0,
  typingActivity: 0,
  focusTime: 0,
  clickFrequency: 0
};

const initialEmotionState: EmotionState = {
  primary: 'focused',
  confidence: 0.5,
  timestamp: new Date()
};

const initialState: EngagementState = {
  webcamEnabled: false,
  emotionState: initialEmotionState,
  behaviorMetrics: initialBehaviorMetrics,
  engagementLevel: 'medium',
  isMonitoring: false,
  lastActivity: new Date()
};

// Reducer function
const engagementReducer = (
  state: EngagementState,
  action: EngagementAction
): EngagementState => {
  switch (action.type) {
    case 'TOGGLE_WEBCAM':
      return {
        ...state,
        webcamEnabled: !state.webcamEnabled
      };

    case 'UPDATE_ENGAGEMENT':
      return {
        ...state,
        engagementLevel: action.payload
      };

    case 'UPDATE_EMOTION':
      return {
        ...state,
        emotionState: action.payload
      };

    case 'UPDATE_BEHAVIOR':
      return {
        ...state,
        behaviorMetrics: {
          ...state.behaviorMetrics,
          ...action.payload
        },
        lastActivity: new Date()
      };

    case 'START_MONITORING':
      return {
        ...state,
        isMonitoring: true,
        lastActivity: new Date()
      };

    case 'STOP_MONITORING':
      return {
        ...state,
        isMonitoring: false
      };

    case 'RESET_METRICS':
      return {
        ...state,
        behaviorMetrics: initialBehaviorMetrics,
        emotionState: {
          ...initialEmotionState,
          timestamp: new Date()
        },
        engagementLevel: 'medium',
        lastActivity: new Date()
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date()
      };

    default:
      return state;
  }
};

// Create context
const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

// Provider component
interface EngagementProviderProps {
  children: ReactNode;
}

export const EngagementProvider: React.FC<EngagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(engagementReducer, initialState);

  // Mouse activity tracking
  useEffect(() => {
    if (!state.isMonitoring) return;

    let mouseMovements = 0;
    let clicks = 0;
    let scrollEvents = 0;
    let keystrokes = 0;

    const handleMouseMove = () => {
      mouseMovements++;
      dispatch({ type: 'UPDATE_ACTIVITY' });
    };

    const handleClick = () => {
      clicks++;
      dispatch({ type: 'UPDATE_ACTIVITY' });
    };

    const handleScroll = () => {
      scrollEvents++;
      dispatch({ type: 'UPDATE_ACTIVITY' });
    };

    const handleKeyPress = () => {
      keystrokes++;
      dispatch({ type: 'UPDATE_ACTIVITY' });
    };

    const handleFocus = () => {
      dispatch({ type: 'UPDATE_ACTIVITY' });
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('keypress', handleKeyPress);
    window.addEventListener('focus', handleFocus);

    // Update metrics every 5 seconds
    const metricsInterval = setInterval(() => {
      const now = Date.now();
      // const fiveSecondsAgo = now - 5000;
      
      // Calculate focus time based on last activity
      const timeSinceLastActivity = now - state.lastActivity.getTime();
      const focusTime = timeSinceLastActivity < 10000 ? 5 : 0; // Consider focused if activity within 10 seconds

      // Calculate scroll speed (events per second)
      const scrollSpeed = scrollEvents / 5;

      // Calculate click frequency (clicks per second)
      const clickFrequency = clicks / 5;

      dispatch({
        type: 'UPDATE_BEHAVIOR',
        payload: {
          mouseActivity: mouseMovements / 5, // movements per second
          scrollSpeed,
          typingActivity: keystrokes / 5, // keystrokes per second
          focusTime: state.behaviorMetrics.focusTime + focusTime,
          clickFrequency
        }
      });

      // Reset counters
      mouseMovements = 0;
      clicks = 0;
      scrollEvents = 0;
      keystrokes = 0;
    }, 5000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('focus', handleFocus);
      clearInterval(metricsInterval);
    };
  }, [state.isMonitoring, state.lastActivity]);

  // Auto-calculate engagement level based on behavior metrics
  useEffect(() => {
    if (!state.isMonitoring) return;

    const { mouseActivity, scrollSpeed, typingActivity, clickFrequency } = state.behaviorMetrics;
    
    // Simple engagement calculation based on activity levels
    const activityScore = (mouseActivity * 0.3) + (scrollSpeed * 0.2) + (typingActivity * 0.3) + (clickFrequency * 0.2);
    
    let newEngagementLevel: EngagementLevel;
    if (activityScore > 2) {
      newEngagementLevel = 'high';
    } else if (activityScore > 0.5) {
      newEngagementLevel = 'medium';
    } else {
      newEngagementLevel = 'low';
    }

    // Only update if engagement level changed
    if (newEngagementLevel !== state.engagementLevel) {
      dispatch({ type: 'UPDATE_ENGAGEMENT', payload: newEngagementLevel });
    }
  }, [state.behaviorMetrics, state.isMonitoring, state.engagementLevel]);

  // Context methods
  const toggleWebcam = useCallback(() => {
    dispatch({ type: 'TOGGLE_WEBCAM' });
  }, []);

  const updateEngagement = useCallback((level: EngagementLevel) => {
    dispatch({ type: 'UPDATE_ENGAGEMENT', payload: level });
  }, []);

  const updateEmotionState = useCallback((emotion: EmotionState) => {
    dispatch({ type: 'UPDATE_EMOTION', payload: emotion });
  }, []);

  const updateBehaviorMetrics = useCallback((metrics: Partial<BehaviorMetrics>) => {
    dispatch({ type: 'UPDATE_BEHAVIOR', payload: metrics });
  }, []);

  const startMonitoring = useCallback(() => {
    dispatch({ type: 'START_MONITORING' });
  }, []);

  const stopMonitoring = useCallback(() => {
    dispatch({ type: 'STOP_MONITORING' });
  }, []);

  const resetMetrics = useCallback(() => {
    dispatch({ type: 'RESET_METRICS' });
  }, []);

  const getEngagementPoint = useCallback((contentContext: ContentContext): EngagementPoint => {
    return {
      timestamp: new Date(),
      level: state.engagementLevel,
      emotionState: state.emotionState,
      behaviorMetrics: state.behaviorMetrics,
      contentContext
    };
  }, [state.engagementLevel, state.emotionState, state.behaviorMetrics]);

  const contextValue: EngagementContextType = {
    webcamEnabled: state.webcamEnabled,
    emotionState: state.emotionState,
    behaviorMetrics: state.behaviorMetrics,
    engagementLevel: state.engagementLevel,
    isMonitoring: state.isMonitoring,
    toggleWebcam,
    updateEngagement,
    updateEmotionState,
    updateBehaviorMetrics,
    startMonitoring,
    stopMonitoring,
    getEngagementPoint,
    resetMetrics
  };

  return (
    <EngagementContext.Provider value={contextValue}>
      {children}
    </EngagementContext.Provider>
  );
};

// Custom hook to use the context
export const useEngagement = (): EngagementContextType => {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
};

