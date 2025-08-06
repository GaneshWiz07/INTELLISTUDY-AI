import React, { useState, useEffect } from 'react';
import { AttentionTrendChart } from './AttentionTrendChart';
import { EmotionTimeline } from './EmotionTimeline';
import { ExportControls } from './ExportControls';
import { SessionComparison } from './SessionComparison';
// import { analyticsService } from '../../services/analyticsService';
import type { ReportData, EngagementPoint } from '../../types';
import './ReportingDashboard.css';

interface ReportingDashboardProps {
  userId: string;
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  userId,
}) => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to show loading state in tests
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // For now, we'll use mock data since the API isn't implemented
        const mockReportData: ReportData[] = [
          {
            sessionId: 'session-1',
            userId,
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
            engagementTrend: generateMockEngagementTrend(),
            contentEffectiveness: [
              { contentType: 'text', averageEngagement: 0.7, completionRate: 0.9, adaptationRate: 0.2 },
              { contentType: 'video', averageEngagement: 0.8, completionRate: 0.85, adaptationRate: 0.15 },
              { contentType: 'quiz', averageEngagement: 0.9, completionRate: 0.95, adaptationRate: 0.05 },
            ],
          },
          {
            sessionId: 'session-2',
            userId,
            metrics: {
              totalDuration: 2100,
              averageEngagement: 0.68,
              contentCompletionRate: 0.78,
              adaptationCount: 5,
              emotionDistribution: {
                focused: 0.5,
                engaged: 0.25,
                confused: 0.15,
                bored: 0.1,
              },
              performanceScore: 0.72,
            },
            engagementTrend: generateMockEngagementTrend(),
            contentEffectiveness: [
              { contentType: 'text', averageEngagement: 0.65, completionRate: 0.8, adaptationRate: 0.3 },
              { contentType: 'video', averageEngagement: 0.75, completionRate: 0.82, adaptationRate: 0.18 },
              { contentType: 'quiz', averageEngagement: 0.85, completionRate: 0.9, adaptationRate: 0.1 },
            ],
          },
        ];

        setReportData(mockReportData);
        if (mockReportData.length > 0) {
          setSelectedSession(mockReportData[0].sessionId);
        }
      } catch (err) {
        setError('Failed to load report data');
        console.error('Error loading report data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [userId]);

  const generateMockEngagementTrend = (): EngagementPoint[] => {
    const points: EngagementPoint[] = [];
    const startTime = new Date();
    
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(startTime.getTime() + i * 60000); // Every minute
      const level = Math.random() > 0.3 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';
      const emotions = ['focused', 'engaged', 'confused', 'bored', 'frustrated'] as const;
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      points.push({
        timestamp,
        level: level as 'high' | 'medium' | 'low',
        emotionState: {
          primary: emotion,
          confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
          timestamp,
        },
        behaviorMetrics: {
          mouseActivity: Math.random() * 100,
          scrollSpeed: Math.random() * 50,
          typingActivity: Math.random() * 30,
          focusTime: Math.random() * 60,
          clickFrequency: Math.random() * 10,
        },
        contentContext: {
          contentId: `content-${Math.floor(i / 10) + 1}`,
          contentType: ['text', 'video', 'quiz'][Math.floor(Math.random() * 3)] as any,
          position: i % 10,
        },
      });
    }
    
    return points;
  };

  const selectedSessionData = reportData.find(
    (report) => report.sessionId === selectedSession
  );

  if (isLoading) {
    return (
      <div className="reporting-dashboard">
        <div className="loading-state">
          <div className="loading-spinner" data-testid="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-dashboard">
        <div className="error-state">
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">Learning Analytics Dashboard</h1>
          <p className="text-neutral-600">Comprehensive insights into your learning patterns and engagement</p>
        </header>

      <div className="session-selector">
        <label htmlFor="session-select">Select Session:</label>
        <select
          id="session-select"
          value={selectedSession || ''}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          {reportData.map((report) => (
            <option key={report.sessionId} value={report.sessionId}>
              Session {report.sessionId.split('-')[1]} - Score: {Math.round(report.metrics.performanceScore * 100)}%
            </option>
          ))}
        </select>
      </div>

      {selectedSessionData && (
        <div className="analytics-content">
          <div className="metrics-overview">
            <div className="metric-card">
              <h3>Session Duration</h3>
              <div className="metric-value">
                {Math.floor(selectedSessionData.metrics.totalDuration / 60)}m {selectedSessionData.metrics.totalDuration % 60}s
              </div>
            </div>
            <div className="metric-card">
              <h3>Average Engagement</h3>
              <div className="metric-value">
                {Math.round(selectedSessionData.metrics.averageEngagement * 100)}%
              </div>
            </div>
            <div className="metric-card">
              <h3>Completion Rate</h3>
              <div className="metric-value">
                {Math.round(selectedSessionData.metrics.contentCompletionRate * 100)}%
              </div>
            </div>
            <div className="metric-card">
              <h3>Adaptations</h3>
              <div className="metric-value">
                {selectedSessionData.metrics.adaptationCount}
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-section">
              <h2>Attention Trend Over Time</h2>
              <AttentionTrendChart engagementData={selectedSessionData.engagementTrend} />
            </div>

            <div className="chart-section">
              <h2>Emotion Timeline</h2>
              <EmotionTimeline engagementData={selectedSessionData.engagementTrend} />
            </div>
          </div>

          <div className="emotion-distribution">
            <h2>Emotion Distribution</h2>
            <div className="emotion-bars">
              {Object.entries(selectedSessionData.metrics.emotionDistribution).map(([emotion, percentage]) => (
                <div key={emotion} className="emotion-bar">
                  <label>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</label>
                  <div className="bar-container">
                    <div 
                      className={`bar bar-${emotion}`}
                      style={{ width: `${percentage * 100}%` }}
                    ></div>
                    <span className="percentage">{Math.round(percentage * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ExportControls 
            reportData={reportData} 
            selectedSessionId={selectedSession} 
          />

          <SessionComparison reportData={reportData} />
        </div>
      )}
      </div>
    </div>
  );
};

