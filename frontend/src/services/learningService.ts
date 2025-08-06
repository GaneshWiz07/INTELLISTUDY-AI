import { apiService } from './api';
import type { 
  LearningSession, 
  ContentItem, 
  APIResponse, 
  AdaptationTrigger,
  EngagementLevel,
  ContentType 
} from '../types';

interface CreateSessionRequest {
  userId: string;
  preferences?: {
    preferredContentType?: ContentType;
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    sessionDuration?: number;
  };
}

interface AdaptContentRequest {
  sessionId: string;
  trigger: AdaptationTrigger;
  currentEngagement: EngagementLevel;
  currentContentId: string;
  reason?: string;
}

interface UpdateSessionRequest {
  sessionId: string;
  engagementData?: any;
  completedContentIds?: string[];
  currentProgress?: number;
}

class LearningService {
  async createSession(
    request: CreateSessionRequest
  ): Promise<APIResponse<LearningSession>> {
    try {
      const response = await apiService.post<LearningSession>(
        '/content/session',
        request
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockCreateSession(request);
    }
  }

  async getSession(
    sessionId: string
  ): Promise<APIResponse<LearningSession>> {
    try {
      const response = await apiService.get<LearningSession>(
        `/content/session/${sessionId}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetSession(sessionId);
    }
  }

  async updateSession(
    request: UpdateSessionRequest
  ): Promise<APIResponse<LearningSession>> {
    try {
      const response = await apiService.put<LearningSession>(
        `/content/session/${request.sessionId}`,
        request
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockUpdateSession(request);
    }
  }

  async endSession(
    sessionId: string
  ): Promise<APIResponse<LearningSession>> {
    try {
      const response = await apiService.post<LearningSession>(
        `/content/session/${sessionId}/end`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockEndSession(sessionId);
    }
  }

  async adaptContent(
    request: AdaptContentRequest
  ): Promise<APIResponse<ContentItem>> {
    try {
      const response = await apiService.post<ContentItem>(
        '/content/adapt',
        request
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockAdaptContent(request);
    }
  }

  async getContent(
    contentId: string
  ): Promise<APIResponse<ContentItem>> {
    try {
      const response = await apiService.get<ContentItem>(
        `/content/${contentId}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetContent(contentId);
    }
  }

  async getRecommendations(
    userId: string,
    options?: {
      contentType?: ContentType;
      difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
      limit?: number;
    }
  ): Promise<APIResponse<ContentItem[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.contentType) queryParams.set('type', options.contentType);
      if (options?.difficultyLevel) queryParams.set('difficulty', options.difficultyLevel);
      if (options?.limit) queryParams.set('limit', options.limit.toString());

      const url = `/content/recommendations/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ContentItem[]>(url);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetRecommendations(userId, options);
    }
  }

  async searchContent(
    query: string,
    filters?: {
      contentType?: ContentType;
      difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
      limit?: number;
    }
  ): Promise<APIResponse<ContentItem[]>> {
    try {
      const response = await apiService.post<ContentItem[]>(
        '/content/search',
        { query, filters }
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockSearchContent(query, filters);
    }
  }

  // Mock methods for development fallback
  private async mockCreateSession(
    request: CreateSessionRequest
  ): Promise<APIResponse<LearningSession>> {
    return Promise.resolve({
      success: true,
      data: {
        id: Date.now().toString(),
        userId: request.userId,
        startTime: new Date(),
        contentItems: [],
        engagementHistory: [],
        adaptations: [],
        finalMetrics: {
          totalDuration: 0,
          averageEngagement: 0,
          contentCompletionRate: 0,
          adaptationCount: 0,
          emotionDistribution: {},
          performanceScore: 0,
        },
      },
    });
  }

  private async mockGetSession(
    sessionId: string
  ): Promise<APIResponse<LearningSession>> {
    return Promise.resolve({
      success: true,
      data: {
        id: sessionId,
        userId: '1',
        startTime: new Date(),
        contentItems: [
          {
            id: '1',
            type: 'text',
            title: 'Introduction to Machine Learning',
            content: {
              text: 'Machine learning is a subset of artificial intelligence...',
              readingTime: 5,
            },
            duration: 300,
            engagementScore: 0.8,
          },
        ],
        engagementHistory: [],
        adaptations: [],
        finalMetrics: {
          totalDuration: 0,
          averageEngagement: 0,
          contentCompletionRate: 0,
          adaptationCount: 0,
          emotionDistribution: {},
          performanceScore: 0,
        },
      },
    });
  }

  private async mockUpdateSession(
    request: UpdateSessionRequest
  ): Promise<APIResponse<LearningSession>> {
    return this.mockGetSession(request.sessionId);
  }

  private async mockEndSession(
    sessionId: string
  ): Promise<APIResponse<LearningSession>> {
    const session = await this.mockGetSession(sessionId);
    if (session.data) {
      session.data.endTime = new Date();
      session.data.finalMetrics = {
        totalDuration: 1800,
        averageEngagement: 0.75,
        contentCompletionRate: 0.85,
        adaptationCount: 3,
        emotionDistribution: {
          focused: 0.6,
          engaged: 0.3,
          confused: 0.1,
        },
        performanceScore: 0.8,
      };
    }
    return session;
  }

  private async mockAdaptContent(
    request: AdaptContentRequest
  ): Promise<APIResponse<ContentItem>> {
    const contentTypes: ContentType[] = ['text', 'video', 'quiz', 'infographic'];
    const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

    return Promise.resolve({
      success: true,
      data: {
        id: Date.now().toString(),
        type: randomType,
        title: `Adapted ${randomType} Content`,
        content: {
          text: `This is adapted ${randomType} content based on ${request.trigger} trigger.`,
          readingTime: 5,
        },
        duration: 300,
        engagementScore: 0,
      },
    });
  }

  private async mockGetContent(
    contentId: string
  ): Promise<APIResponse<ContentItem>> {
    return Promise.resolve({
      success: true,
      data: {
        id: contentId,
        type: 'text',
        title: 'Sample Content',
        content: {
          text: 'This is sample content for testing purposes.',
          readingTime: 5,
        },
        duration: 300,
        engagementScore: 0.7,
      },
    });
  }

  private async mockGetRecommendations(
    _userId: string,
    _options?: any
  ): Promise<APIResponse<ContentItem[]>> {
    return Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          type: 'text',
          title: 'Recommended Reading',
          content: {
            text: 'This is a recommended text content.',
            readingTime: 10,
          },
          duration: 600,
          engagementScore: 0.8,
        },
        {
          id: '2',
          type: 'video',
          title: 'Recommended Video',
          content: { url: '/mock-video.mp4', thumbnail: '/mock-thumb.jpg', duration: 300 },
          duration: 300,
          engagementScore: 0.9,
        },
      ],
    });
  }

  private async mockSearchContent(
    _query: string,
    _filters?: any
  ): Promise<APIResponse<ContentItem[]>> {
    return Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          type: 'text',
          title: 'Search Result 1',
          content: {
            text: 'This is a search result.',
            readingTime: 7,
          },
          duration: 400,
          engagementScore: 0.7,
        },
      ],
    });
  }
}

export const learningService = new LearningService();
