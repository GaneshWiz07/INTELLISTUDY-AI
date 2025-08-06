import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { ReportData } from '../../types';
import './SessionComparison.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SessionComparisonProps {
  reportData: ReportData[];
}

export const SessionComparison: React.FC<SessionComparisonProps> = ({
  reportData,
}) => {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [comparisonView, setComparisonView] = useState<'metrics' | 'emotions' | 'content'>('metrics');

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      } else if (prev.length < 4) { // Limit to 4 sessions for readability
        return [...prev, sessionId];
      } else {
        alert('You can compare up to 4 sessions at once');
        return prev;
      }
    });
  };

  const selectedSessionsData = reportData.filter(report => 
    selectedSessions.includes(report.sessionId)
  );

  const getMetricsComparisonData = () => {
    const labels = selectedSessionsData.map(session => 
      `Session ${session.sessionId.split('-')[1]}`
    );

    return {
      labels,
      datasets: [
        {
          label: 'Average Engagement (%)',
          data: selectedSessionsData.map(session => 
            Math.round(session.metrics.averageEngagement * 100)
          ),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 2,
        },
        {
          label: 'Completion Rate (%)',
          data: selectedSessionsData.map(session => 
            Math.round(session.metrics.contentCompletionRate * 100)
          ),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 2,
        },
        {
          label: 'Performance Score (%)',
          data: selectedSessionsData.map(session => 
            Math.round(session.metrics.performanceScore * 100)
          ),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 2,
        },
      ],
    };
  };

  const getEmotionComparisonData = () => {
    const emotions = ['focused', 'engaged', 'confused', 'bored', 'frustrated'];
    const colors = {
      focused: '#10b981',
      engaged: '#3b82f6',
      confused: '#f59e0b',
      bored: '#6b7280',
      frustrated: '#ef4444',
    };

    const labels = selectedSessionsData.map(session => 
      `Session ${session.sessionId.split('-')[1]}`
    );

    return {
      labels,
      datasets: emotions.map(emotion => ({
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: selectedSessionsData.map(session => 
          Math.round((session.metrics.emotionDistribution[emotion] || 0) * 100)
        ),
        backgroundColor: colors[emotion as keyof typeof colors] + '80',
        borderColor: colors[emotion as keyof typeof colors],
        borderWidth: 2,
      })),
    };
  };

  const getContentEffectivenessData = () => {
    const contentTypes = ['text', 'video', 'quiz'];
    const colors = {
      text: '#3b82f6',
      video: '#10b981',
      quiz: '#f59e0b',
    };

    const labels = selectedSessionsData.map(session => 
      `Session ${session.sessionId.split('-')[1]}`
    );

    return {
      labels,
      datasets: contentTypes.map(contentType => {
        const data = selectedSessionsData.map(session => {
          const content = session.contentEffectiveness.find(c => c.contentType === contentType);
          return content ? Math.round(content.averageEngagement * 100) : 0;
        });

        return {
          label: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Engagement`,
          data,
          borderColor: colors[contentType as keyof typeof colors],
          backgroundColor: colors[contentType as keyof typeof colors] + '20',
          borderWidth: 3,
          pointBackgroundColor: colors[contentType as keyof typeof colors],
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
        };
      }),
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const renderComparisonChart = () => {
    if (selectedSessionsData.length === 0) {
      return (
        <div className="no-data-message">
          <p>Select sessions to compare their performance metrics</p>
        </div>
      );
    }

    switch (comparisonView) {
      case 'metrics':
        return <Bar data={getMetricsComparisonData()} options={chartOptions} />;
      case 'emotions':
        return <Bar data={getEmotionComparisonData()} options={chartOptions} />;
      case 'content':
        return <Line data={getContentEffectivenessData()} options={lineChartOptions} />;
      default:
        return null;
    }
  };

  const getComparisonInsights = () => {
    if (selectedSessionsData.length < 2) return null;

    const insights = [];
    
    // Performance comparison
    const performances = selectedSessionsData.map(s => s.metrics.performanceScore);
    const bestPerformance = Math.max(...performances);
    const worstPerformance = Math.min(...performances);
    const bestSession = selectedSessionsData.find(s => s.metrics.performanceScore === bestPerformance);
    const worstSession = selectedSessionsData.find(s => s.metrics.performanceScore === worstPerformance);
    
    if (bestSession && worstSession && bestSession !== worstSession) {
      insights.push({
        type: 'performance',
        message: `Session ${bestSession.sessionId.split('-')[1]} performed ${Math.round((bestPerformance - worstPerformance) * 100)}% better than Session ${worstSession.sessionId.split('-')[1]}`,
      });
    }

    // Engagement comparison
    const engagements = selectedSessionsData.map(s => s.metrics.averageEngagement);
    const avgEngagement = engagements.reduce((sum, eng) => sum + eng, 0) / engagements.length;
    const highEngagementSessions = selectedSessionsData.filter(s => s.metrics.averageEngagement > avgEngagement);
    
    if (highEngagementSessions.length > 0) {
      insights.push({
        type: 'engagement',
        message: `${highEngagementSessions.length} out of ${selectedSessionsData.length} sessions had above-average engagement (${Math.round(avgEngagement * 100)}%)`,
      });
    }

    // Adaptation comparison
    const adaptations = selectedSessionsData.map(s => s.metrics.adaptationCount);
    const maxAdaptations = Math.max(...adaptations);
    const minAdaptations = Math.min(...adaptations);
    
    if (maxAdaptations > minAdaptations) {
      insights.push({
        type: 'adaptation',
        message: `Adaptation count varied from ${minAdaptations} to ${maxAdaptations}, indicating different learning patterns`,
      });
    }

    return insights;
  };

  const insights = getComparisonInsights();

  return (
    <div className="session-comparison">
      <div className="comparison-header">
        <h3>Session Comparison</h3>
        <p>Compare multiple learning sessions to identify patterns and improvements</p>
      </div>

      <div className="session-selector">
        <h4>Select Sessions to Compare (up to 4):</h4>
        <div className="session-checkboxes">
          {reportData.map((report) => (
            <label key={report.sessionId} className="session-checkbox">
              <input
                type="checkbox"
                checked={selectedSessions.includes(report.sessionId)}
                onChange={() => handleSessionToggle(report.sessionId)}
              />
              <span className="checkbox-label">
                Session {report.sessionId.split('-')[1]} 
                <span className="session-score">
                  ({Math.round(report.metrics.performanceScore * 100)}%)
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {selectedSessions.length > 0 && (
        <>
          <div className="comparison-controls">
            <div className="view-selector">
              <button
                className={`view-btn ${comparisonView === 'metrics' ? 'active' : ''}`}
                onClick={() => setComparisonView('metrics')}
              >
                Performance Metrics
              </button>
              <button
                className={`view-btn ${comparisonView === 'emotions' ? 'active' : ''}`}
                onClick={() => setComparisonView('emotions')}
              >
                Emotion Distribution
              </button>
              <button
                className={`view-btn ${comparisonView === 'content' ? 'active' : ''}`}
                onClick={() => setComparisonView('content')}
              >
                Content Effectiveness
              </button>
            </div>
          </div>

          <div className="comparison-chart">
            <div className="chart-container">
              {renderComparisonChart()}
            </div>
          </div>

          {insights && insights.length > 0 && (
            <div className="comparison-insights">
              <h4>Key Insights</h4>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.type}`}>
                    <div className="insight-icon">
                      {insight.type === 'performance' && '🎯'}
                      {insight.type === 'engagement' && '📈'}
                      {insight.type === 'adaptation' && '🔄'}
                    </div>
                    <p>{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="comparison-summary">
            <h4>Session Summary</h4>
            <div className="summary-table">
              <div className="summary-header">
                <div>Session</div>
                <div>Duration</div>
                <div>Engagement</div>
                <div>Completion</div>
                <div>Adaptations</div>
                <div>Score</div>
              </div>
              {selectedSessionsData.map((session) => (
                <div key={session.sessionId} className="summary-row">
                  <div className="session-id">
                    Session {session.sessionId.split('-')[1]}
                  </div>
                  <div>
                    {Math.floor(session.metrics.totalDuration / 60)}m {session.metrics.totalDuration % 60}s
                  </div>
                  <div>
                    {Math.round(session.metrics.averageEngagement * 100)}%
                  </div>
                  <div>
                    {Math.round(session.metrics.contentCompletionRate * 100)}%
                  </div>
                  <div>
                    {session.metrics.adaptationCount}
                  </div>
                  <div className="score-cell">
                    {Math.round(session.metrics.performanceScore * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

