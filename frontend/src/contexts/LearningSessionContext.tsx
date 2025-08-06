import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  LearningSession,
  SessionMetrics,
  ContentItem,
  EngagementLevel,
  ContentType,
  AdaptationTrigger,
  ContentAdaptation,
  EngagementPoint,
  EmotionState,
  BehaviorMetrics
} from '../types';
import { adaptationEngine } from '../utils/adaptationEngine';
import type { AdaptationContext } from '../utils/adaptationEngine';

// Learning Session Context Types
export interface LearningSessionContextType {
  currentSession: LearningSession | null;
  engagementLevel: EngagementLevel;
  contentType: ContentType;
  adaptContent: (trigger: AdaptationTrigger, reason?: string) => void;
  sessionMetrics: SessionMetrics;
  startSession: (userId: string, initialContent: ContentItem[]) => void;
  endSession: () => void;
  updateEngagementLevel: (level: EngagementLevel) => void;
  addEngagementPoint: (point: EngagementPoint) => void;
  getCurrentContent: () => ContentItem | null;
  isSessionActive: boolean;
  evaluateAdaptation: (emotionState?: EmotionState, behaviorMetrics?: BehaviorMetrics) => void;
  contentStartTime: Date | null;
}

// Learning Session State
interface LearningSessionState {
  currentSession: LearningSession | null;
  engagementLevel: EngagementLevel;
  contentType: ContentType;
  sessionMetrics: SessionMetrics;
  isSessionActive: boolean;
  contentStartTime: Date | null;
}

// Learning Session Actions
type LearningSessionAction =
  | { type: 'START_SESSION'; payload: { userId: string; initialContent: ContentItem[] } }
  | { type: 'END_SESSION' }
  | { type: 'UPDATE_ENGAGEMENT'; payload: EngagementLevel }
  | { type: 'ADAPT_CONTENT'; payload: { trigger: AdaptationTrigger; reason: string; newType: ContentType; newContent?: Partial<ContentItem> } }
  | { type: 'ADD_ENGAGEMENT_POINT'; payload: EngagementPoint }
  | { type: 'UPDATE_METRICS'; payload: Partial<SessionMetrics> }
  | { type: 'SET_CONTENT_START_TIME'; payload: Date };

// Initial state
const initialState: LearningSessionState = {
  currentSession: null,
  engagementLevel: 'medium',
  contentType: 'text',
  sessionMetrics: {
    totalDuration: 0,
    averageEngagement: 0,
    contentCompletionRate: 0,
    adaptationCount: 0,
    emotionDistribution: {},
    performanceScore: 0
  },
  isSessionActive: false,
  contentStartTime: null
};

// Reducer function
const learningSessionReducer = (
  state: LearningSessionState,
  action: LearningSessionAction
): LearningSessionState => {
  switch (action.type) {
    case 'START_SESSION': {
      const { userId, initialContent } = action.payload;
      const newSession: LearningSession = {
        id: `session_${Date.now()}`,
        userId,
        startTime: new Date(),
        contentItems: initialContent,
        engagementHistory: [],
        adaptations: [],
        finalMetrics: initialState.sessionMetrics
      };

      return {
        ...state,
        currentSession: newSession,
        isSessionActive: true,
        contentType: initialContent[0]?.type || 'text',
        sessionMetrics: initialState.sessionMetrics,
        contentStartTime: new Date()
      };
    }

    case 'END_SESSION': {
      if (!state.currentSession) return state;

      const endTime = new Date();
      const totalDuration = endTime.getTime() - state.currentSession.startTime.getTime();
      
      const finalMetrics: SessionMetrics = {
        ...state.sessionMetrics,
        totalDuration: totalDuration / 1000 // Convert to seconds
      };

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          endTime,
          finalMetrics
        },
        isSessionActive: false
      };
    }

    case 'UPDATE_ENGAGEMENT': {
      return {
        ...state,
        engagementLevel: action.payload
      };
    }

    case 'ADAPT_CONTENT': {
      if (!state.currentSession) return state;

      const { trigger, reason, newType, newContent } = action.payload;
      const adaptation: ContentAdaptation = {
        id: `adaptation_${Date.now()}`,
        timestamp: new Date(),
        fromType: state.contentType,
        toType: newType,
        trigger,
        reason
      };

      // Update content items if new content is provided
      let updatedContentItems = state.currentSession.contentItems;
      if (newContent) {
        const currentContentIndex = updatedContentItems.findIndex(
          item => item.type === state.contentType
        );
        
        if (currentContentIndex !== -1) {
          // Update existing content item
          updatedContentItems = [...updatedContentItems];
          updatedContentItems[currentContentIndex] = {
            ...updatedContentItems[currentContentIndex],
            ...newContent,
            type: newType
          };
        } else {
          // Add new content item
          const newContentItem: ContentItem = {
            id: `content_${Date.now()}`,
            type: newType,
            title: newContent.title || `Adapted ${newType} content`,
            content: newContent.content || {
              text: 'Adapted content',
              readingTime: 5,
            },
            duration: newContent.duration || 300,
            engagementScore: 5
          };
          updatedContentItems = [...updatedContentItems, newContentItem];
        }
      }

      const updatedSession = {
        ...state.currentSession,
        adaptations: [...state.currentSession.adaptations, adaptation],
        contentItems: updatedContentItems
      };

      const updatedMetrics = {
        ...state.sessionMetrics,
        adaptationCount: state.sessionMetrics.adaptationCount + 1
      };

      return {
        ...state,
        currentSession: updatedSession,
        contentType: newType,
        sessionMetrics: updatedMetrics,
        contentStartTime: new Date() // Reset content start time
      };
    }

    case 'ADD_ENGAGEMENT_POINT': {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        engagementHistory: [...state.currentSession.engagementHistory, action.payload]
      };

      // Calculate average engagement
      const engagementLevels = updatedSession.engagementHistory.map(point => {
        switch (point.level) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 2;
        }
      });

      const averageEngagement = engagementLevels.length > 0 
        ? engagementLevels.reduce((sum, level) => sum + level, 0) / engagementLevels.length
        : 0;

      // Update emotion distribution
      const emotionDistribution = { ...state.sessionMetrics.emotionDistribution };
      const emotion = action.payload.emotionState.primary;
      emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;

      const updatedMetrics = {
        ...state.sessionMetrics,
        averageEngagement,
        emotionDistribution
      };

      return {
        ...state,
        currentSession: updatedSession,
        sessionMetrics: updatedMetrics
      };
    }

    case 'UPDATE_METRICS': {
      return {
        ...state,
        sessionMetrics: {
          ...state.sessionMetrics,
          ...action.payload
        }
      };
    }

    case 'SET_CONTENT_START_TIME': {
      return {
        ...state,
        contentStartTime: action.payload
      };
    }

    default:
      return state;
  }
};

// Create context
const LearningSessionContext = createContext<LearningSessionContextType | undefined>(undefined);

// Provider component
interface LearningSessionProviderProps {
  children: ReactNode;
}

export const LearningSessionProvider: React.FC<LearningSessionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(learningSessionReducer, initialState);

  // Enhanced content adaptation using adaptation engine
  const evaluateAdaptation = useCallback((emotionState?: EmotionState, behaviorMetrics?: BehaviorMetrics) => {
    if (!state.currentSession || !state.contentStartTime) return;

    const now = new Date();
    const timeInCurrentContent = Math.floor((now.getTime() - state.contentStartTime.getTime()) / 1000);

    const context: AdaptationContext = {
      currentContentType: state.contentType,
      engagementLevel: state.engagementLevel,
      emotionState,
      behaviorMetrics,
      sessionHistory: state.currentSession,
      timeInCurrentContent,
      adaptationCount: state.sessionMetrics.adaptationCount
    };

    const adaptationResult = adaptationEngine.evaluateAdaptation(context);

    if (adaptationResult.shouldAdapt) {
      const currentContent = getCurrentContent();
      if (currentContent) {
        const newContent = adaptationEngine.createContentContinuity(
          state.contentType,
          adaptationResult.newContentType,
          currentContent
        );

        dispatch({
          type: 'ADAPT_CONTENT',
          payload: {
            trigger: adaptationResult.rule?.trigger || 'manual',
            reason: adaptationResult.reason,
            newType: adaptationResult.newContentType,
            newContent
          }
        });
      }
    }
  }, [state.currentSession, state.contentStartTime, state.contentType, state.engagementLevel, state.sessionMetrics.adaptationCount]);

  // Context methods
  const startSession = useCallback((userId: string, initialContent: ContentItem[]) => {
    dispatch({ type: 'START_SESSION', payload: { userId, initialContent } });
  }, []);

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const updateEngagementLevel = useCallback((level: EngagementLevel) => {
    dispatch({ type: 'UPDATE_ENGAGEMENT', payload: level });
  }, []);

  const adaptContent = useCallback((trigger: AdaptationTrigger, reason?: string) => {
    if (!state.currentSession || !state.contentStartTime) return;

    const now = new Date();
    const timeInCurrentContent = Math.floor((now.getTime() - state.contentStartTime.getTime()) / 1000);

    const context: AdaptationContext = {
      currentContentType: state.contentType,
      engagementLevel: state.engagementLevel,
      sessionHistory: state.currentSession,
      timeInCurrentContent,
      adaptationCount: state.sessionMetrics.adaptationCount
    };

    // For manual adaptations, use simple cycling logic
    let newType: ContentType;
    if (trigger === 'manual') {
      switch (state.contentType) {
        case 'text': newType = 'video'; break;
        case 'video': newType = 'quiz'; break;
        case 'quiz': newType = 'infographic'; break;
        case 'infographic': newType = 'text'; break;
        default: newType = 'text';
      }
    } else {
      // Use adaptation engine for other triggers
      const adaptationResult = adaptationEngine.evaluateAdaptation(context);
      newType = adaptationResult.shouldAdapt ? adaptationResult.newContentType : state.contentType;
    }

    if (newType !== state.contentType) {
      const currentContent = getCurrentContent();
      if (currentContent) {
        const newContent = adaptationEngine.createContentContinuity(
          state.contentType,
          newType,
          currentContent
        );

        const adaptationReason = reason || `Content adapted due to ${trigger} trigger`;
        
        dispatch({
          type: 'ADAPT_CONTENT',
          payload: { trigger, reason: adaptationReason, newType, newContent }
        });
      }
    }
  }, [state.currentSession, state.contentStartTime, state.contentType, state.engagementLevel, state.sessionMetrics.adaptationCount]);

  const addEngagementPoint = useCallback((point: EngagementPoint) => {
    dispatch({ type: 'ADD_ENGAGEMENT_POINT', payload: point });
  }, []);

  const getCurrentContent = useCallback((): ContentItem | null => {
    if (!state.currentSession || state.currentSession.contentItems.length === 0) {
      return null;
    }
    
    // Return the first content item that matches the current content type
    return state.currentSession.contentItems.find(item => item.type === state.contentType) || 
           state.currentSession.contentItems[0];
  }, [state.currentSession, state.contentType]);

  const contextValue: LearningSessionContextType = {
    currentSession: state.currentSession,
    engagementLevel: state.engagementLevel,
    contentType: state.contentType,
    sessionMetrics: state.sessionMetrics,
    isSessionActive: state.isSessionActive,
    contentStartTime: state.contentStartTime,
    startSession,
    endSession,
    updateEngagementLevel,
    adaptContent,
    addEngagementPoint,
    getCurrentContent,
    evaluateAdaptation
  };

  return (
    <LearningSessionContext.Provider value={contextValue}>
      {children}
    </LearningSessionContext.Provider>
  );
};

// Custom hook to use the context
export const useLearningSession = (): LearningSessionContextType => {
  const context = useContext(LearningSessionContext);
  if (context === undefined) {
    throw new Error('useLearningSession must be used within a LearningSessionProvider');
  }
  return context;
};

