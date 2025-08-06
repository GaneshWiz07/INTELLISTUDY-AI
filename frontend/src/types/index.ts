// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  preferences: LearningPreferences;
  createdAt: Date;
}

export interface LearningPreferences {
  preferredContentType: ContentType;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration: number;
  adaptationSensitivity: 'low' | 'medium' | 'high';
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Content Types
export type ContentType = 'text' | 'video' | 'quiz' | 'infographic';
export type EngagementLevel = 'high' | 'medium' | 'low';

// Learning Session Types
export interface LearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  contentItems: ContentItem[];
  engagementHistory: EngagementPoint[];
  adaptations: ContentAdaptation[];
  finalMetrics: SessionMetrics;
}

export interface TextData {
  text: string;
  readingTime: number;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: TextData | VideoData | QuizData | InfographicData;
  duration: number;
  engagementScore: number;
}

export interface VideoData {
  url: string;
  thumbnail: string;
  duration: number;
}

export interface QuizData {
  questions: QuizQuestion[];
  timeLimit?: number;
}

export interface InfographicData {
  title: string;
  sections: Array<{
    title: string;
    description: string;
  }>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Engagement Types
export interface EngagementPoint {
  timestamp: Date;
  level: EngagementLevel;
  emotionState: EmotionState;
  behaviorMetrics: BehaviorMetrics;
  contentContext: ContentContext;
}

export interface BehaviorMetrics {
  mouseActivity: number;
  scrollSpeed: number;
  typingActivity: number;
  focusTime: number;
  clickFrequency: number;
}

export interface EmotionState {
  primary: 'focused' | 'confused' | 'bored' | 'engaged' | 'frustrated';
  confidence: number;
  timestamp: Date;
}

export interface ContentContext {
  contentId: string;
  contentType: ContentType;
  position: number;
}

export interface ContentAdaptation {
  id: string;
  timestamp: Date;
  fromType: ContentType;
  toType: ContentType;
  trigger: AdaptationTrigger;
  reason: string;
}

export type AdaptationTrigger =
  | 'engagement'
  | 'emotion'
  | 'behavior'
  | 'manual';

// Analytics Types
export interface SessionMetrics {
  totalDuration: number;
  averageEngagement: number;
  contentCompletionRate: number;
  adaptationCount: number;
  emotionDistribution: Record<string, number>;
  performanceScore: number;
}

export interface ReportData {
  sessionId: string;
  userId: string;
  metrics: SessionMetrics;
  engagementTrend: EngagementPoint[];
  contentEffectiveness: ContentEffectiveness[];
}

export interface ContentEffectiveness {
  contentType: ContentType;
  averageEngagement: number;
  completionRate: number;
  adaptationRate: number;
}

// API Types
export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
