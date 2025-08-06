import { apiService } from './api';
import type {
  EngagementPoint,
  ReportData,
  SessionMetrics,
  APIResponse,
  ContentEffectiveness,
  EmotionState,
  BehaviorMetrics,
} from '../types';

interface EngagementBatch {
  sessionId: string;
  userId: string;
  engagementPoints: EngagementPoint[];
}

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  contentType?: string;
  engagementLevel?: string;
  limit?: number;
}

interface EmotionAnalysisRequest {
  sessionId: string;
  imageData?: string; // Base64 encoded image from webcam
  behaviorMetrics: BehaviorMetrics;
  timestamp: Date;
}

interface PerformanceMetrics {
  userId: string;
  timeRange: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalSessions: number;
    totalLearningTime: number;
    averageEngagement: number;
    improvementRate: number;
    streakDays: number;
  };
}

class AnalyticsService {
  // Engagement data submission
  async submitEngagementData(
    engagementData: EngagementPoint
  ): Promise<APIResponse<void>> {
    try {
      const response = await apiService.post<void>(
        '/analytics/engagement',
        engagementData
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockSubmitEngagementData(engagementData);
    }
  }

  async submitEngagementBatch(
    batch: EngagementBatch
  ): Promise<APIResponse<void>> {
    try {
      const response = await apiService.post<void>(
        '/analytics/engagement/batch',
        batch
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockSubmitEngagementBatch(batch);
    }
  }

  // Emotion analysis
  async analyzeEmotion(
    request: EmotionAnalysisRequest
  ): Promise<APIResponse<EmotionState>> {
    try {
      const response = await apiService.post<EmotionState>(
        '/analytics/emotion/analyze',
        request
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockAnalyzeEmotion(request);
    }
  }

  async getEmotionHistory(
    sessionId: string
  ): Promise<APIResponse<EmotionState[]>> {
    try {
      const response = await apiService.get<EmotionState[]>(
        `/analytics/emotion/session/${sessionId}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetEmotionHistory(sessionId);
    }
  }

  // Reports and metrics
  async getReports(
    userId: string,
    filters?: ReportFilters
  ): Promise<APIResponse<ReportData[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.set('startDate', filters.startDate.toISOString());
      if (filters?.endDate) queryParams.set('endDate', filters.endDate.toISOString());
      if (filters?.contentType) queryParams.set('contentType', filters.contentType);
      if (filters?.engagementLevel) queryParams.set('engagementLevel', filters.engagementLevel);
      if (filters?.limit) queryParams.set('limit', filters.limit.toString());

      const url = `/analytics/reports/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ReportData[]>(url);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetReports(userId, filters);
    }
  }

  async getSessionMetrics(
    sessionId: string
  ): Promise<APIResponse<SessionMetrics>> {
    try {
      const response = await apiService.get<SessionMetrics>(
        `/analytics/session/${sessionId}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetSessionMetrics(sessionId);
    }
  }

  async getUserPerformance(
    userId: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<APIResponse<PerformanceMetrics>> {
    try {
      const response = await apiService.get<PerformanceMetrics>(
        `/analytics/performance/${userId}?timeRange=${timeRange}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetUserPerformance(userId, timeRange);
    }
  }

  async getContentEffectiveness(
    userId?: string,
    contentType?: string
  ): Promise<APIResponse<ContentEffectiveness[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.set('userId', userId);
      if (contentType) queryParams.set('contentType', contentType);

      const url = `/analytics/content-effectiveness${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ContentEffectiveness[]>(url);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetContentEffectiveness(userId, contentType);
    }
  }

  // Comparative analytics
  async compareUserPerformance(
    userIds: string[],
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<APIResponse<PerformanceMetrics[]>> {
    try {
      const response = await apiService.post<PerformanceMetrics[]>(
        '/analytics/compare/users',
        { userIds, timeRange }
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockCompareUserPerformance(userIds, timeRange);
    }
  }

  async getEngagementTrends(
    userId: string,
    days: number = 30
  ): Promise<APIResponse<{ date: string; averageEngagement: number }[]>> {
    try {
      const response = await apiService.get<{ date: string; averageEngagement: number }[]>(
        `/analytics/trends/engagement/${userId}?days=${days}`
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockGetEngagementTrends(userId, days);
    }
  }

  // Export functionality
  async exportReport(
    userId: string,
    format: 'pdf' | 'csv',
    filters?: ReportFilters
  ): Promise<APIResponse<{ downloadUrl: string }>> {
    try {
      const response = await apiService.post<{ downloadUrl: string }>(
        `/analytics/export/${userId}`,
        { format, filters }
      );
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return this.mockExportReport(userId, format, filters);
    }
  }

  // Mock methods for development fallback
  private async mockSubmitEngagementData(
    _engagementData: EngagementPoint
  ): Promise<APIResponse<void>> {
    return Promise.resolve({
      success: true,
      data: undefined,
    });
  }

  private async mockSubmitEngagementBatch(
    _batch: EngagementBatch
  ): Promise<APIResponse<void>> {
    return Promise.resolve({
      success: true,
      data: undefined,
    });
  }

  private async mockAnalyzeEmotion(
    _request: EmotionAnalysisRequest
  ): Promise<APIResponse<EmotionState>> {
    const emotions = ['focused', 'confused', 'bored', 'engaged', 'frustrated'] as const;
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    return Promise.resolve({
      success: true,
      data: {
        primary: randomEmotion,
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        timestamp: new Date(),
      },
    });
  }

  private async mockGetEmotionHistory(
    _sessionId: string
  ): Promise<APIResponse<EmotionState[]>> {
    const emotions = ['focused', 'confused', 'bored', 'engaged', 'frustrated'] as const;
    const history = Array.from({ length: 10 }, (_, i) => ({
      primary: emotions[Math.floor(Math.random() * emotions.length)],
      confidence: Math.random() * 0.4 + 0.6,
      timestamp: new Date(Date.now() - i * 60000), // Every minute
    }));

    return Promise.resolve({
      success: true,
      data: history,
    });
  }

  private async mockGetReports(
    _userId: string,
    _filters?: ReportFilters
  ): Promise<APIResponse<ReportData[]>> {
    return Promise.resolve({
      success: true,
      data: [
        {
          sessionId: '1',
          userId: _userId,
          metrics: {
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
          },
          engagementTrend: [],
          contentEffectiveness: [],
        },
      ],
    });
  }

  private async mockGetSessionMetrics(
    _sessionId: string
  ): Promise<APIResponse<SessionMetrics>> {
    return Promise.resolve({
      success: true,
      data: {
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
      },
    });
  }

  private async mockGetUserPerformance(
    userId: string,
    _timeRange: 'day' | 'week' | 'month' | 'year'
  ): Promise<APIResponse<PerformanceMetrics>> {
    return Promise.resolve({
      success: true,
      data: {
        userId,
        timeRange: _timeRange,
        metrics: {
          totalSessions: 15,
          totalLearningTime: 27000, // 7.5 hours
          averageEngagement: 0.78,
          improvementRate: 0.12,
          streakDays: 5,
        },
      },
    });
  }

  private async mockGetContentEffectiveness(
    _userId?: string,
    _contentType?: string
  ): Promise<APIResponse<ContentEffectiveness[]>> {
    return Promise.resolve({
      success: true,
      data: [
        {
          contentType: 'text',
          averageEngagement: 0.7,
          completionRate: 0.85,
          adaptationRate: 0.2,
        },
        {
          contentType: 'video',
          averageEngagement: 0.85,
          completionRate: 0.9,
          adaptationRate: 0.1,
        },
        {
          contentType: 'quiz',
          averageEngagement: 0.9,
          completionRate: 0.75,
          adaptationRate: 0.15,
        },
      ],
    });
  }

  private async mockCompareUserPerformance(
    userIds: string[],
    timeRange: 'day' | 'week' | 'month' | 'year'
  ): Promise<APIResponse<PerformanceMetrics[]>> {
    const mockData = userIds.map((userId, index) => ({
      userId,
      timeRange,
      metrics: {
        totalSessions: 10 + index * 5,
        totalLearningTime: 18000 + index * 9000,
        averageEngagement: 0.7 + index * 0.05,
        improvementRate: 0.1 + index * 0.02,
        streakDays: 3 + index * 2,
      },
    }));

    return Promise.resolve({
      success: true,
      data: mockData,
    });
  }

  private async mockGetEngagementTrends(
    _userId: string,
    days: number
  ): Promise<APIResponse<{ date: string; averageEngagement: number }[]>> {
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        averageEngagement: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      };
    });

    return Promise.resolve({
      success: true,
      data: trends.reverse(),
    });
  }

  private async mockExportReport(
    _userId: string,
    _format: 'pdf' | 'csv',
    _filters?: ReportFilters
  ): Promise<APIResponse<{ downloadUrl: string }>> {
    return Promise.resolve({
      success: true,
      data: {
        downloadUrl: `/mock-reports/user-${_userId}-report.${_format}`,
      },
    });
  }
}

export const analyticsService = new AnalyticsService();
