import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { LearningSession } from '../../types';
import './GoalsTracker.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  deadline?: Date;
}

interface GoalsTrackerProps {
  sessions: LearningSession[];
  goals?: Goal[];
}

const GoalsTracker: React.FC<GoalsTrackerProps> = ({ sessions, goals = [] }) => {
  const [activeTab, setActiveTab] = useState<'streak' | 'goals' | 'progress'>('streak');

  // Calculate learning streak
  const calculateStreak = (): { current: number; longest: number; lastSession: Date | null } => {
    if (sessions.length === 0) {
      return { current: 0, longest: 0, lastSession: null };
    }

    const sortedSessions = [...sessions]
      .filter(session => session.endTime) // Only completed sessions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    if (sortedSessions.length === 0) {
      return { current: 0, longest: 0, lastSession: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    const lastSessionDate = new Date(sortedSessions[0].startTime);
    
    // Check if last session was today or yesterday
    const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      currentStreak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedSessions.length; i++) {
        const currentDate = new Date(sortedSessions[i - 1].startTime);
        const prevDate = new Date(sortedSessions[i].startTime);
        const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < sortedSessions.length; i++) {
      const currentDate = new Date(sortedSessions[i - 1].startTime);
      const prevDate = new Date(sortedSessions[i].startTime);
      const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: longestStreak,
      lastSession: lastSessionDate,
    };
  };

  // Generate default goals based on user activity
  const generateDefaultGoals = (): Goal[] => {
    const avgSessionsPerWeek = sessions.length > 0 ? Math.ceil(sessions.length / 4) : 3; // Assume 4 weeks of data
    const avgDurationPerSession = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.finalMetrics.totalDuration, 0) / sessions.length 
      : 30;

    return [
      {
        id: 'daily-session',
        title: 'Daily Learning',
        description: 'Complete at least one learning session per day',
        target: 1,
        current: calculateStreak().current > 0 ? 1 : 0,
        unit: 'session',
        type: 'daily',
        createdAt: new Date(),
      },
      {
        id: 'weekly-sessions',
        title: 'Weekly Sessions',
        description: 'Complete multiple learning sessions each week',
        target: Math.max(3, avgSessionsPerWeek),
        current: sessions.filter(s => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return s.startTime >= weekAgo;
        }).length,
        unit: 'sessions',
        type: 'weekly',
        createdAt: new Date(),
      },
      {
        id: 'weekly-duration',
        title: 'Weekly Study Time',
        description: 'Spend focused time learning each week',
        target: Math.max(120, avgDurationPerSession * avgSessionsPerWeek),
        current: sessions
          .filter(s => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return s.startTime >= weekAgo;
          })
          .reduce((sum, s) => sum + s.finalMetrics.totalDuration, 0),
        unit: 'minutes',
        type: 'weekly',
        createdAt: new Date(),
      },
      {
        id: 'engagement-goal',
        title: 'High Engagement',
        description: 'Maintain high engagement levels in sessions',
        target: 80,
        current: sessions.length > 0 
          ? Math.round((sessions.reduce((sum, s) => sum + s.finalMetrics.averageEngagement, 0) / sessions.length) * 100)
          : 0,
        unit: '% avg engagement',
        type: 'weekly',
        createdAt: new Date(),
      },
    ];
  };

  const allGoals = goals.length > 0 ? goals : generateDefaultGoals();
  const streak = calculateStreak();

  // Generate progress chart data
  const generateProgressData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dailyEngagement = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => 
        s.startTime >= dayStart && s.startTime <= dayEnd && s.endTime
      );

      return daySessions.length > 0 
        ? daySessions.reduce((sum, s) => sum + s.finalMetrics.averageEngagement, 0) / daySessions.length
        : 0;
    });

    const dailyDuration = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => 
        s.startTime >= dayStart && s.startTime <= dayEnd && s.endTime
      );

      return daySessions.reduce((sum, s) => sum + s.finalMetrics.totalDuration, 0);
    });

    return {
      labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Engagement Level',
          data: dailyEngagement.map(e => e * 100),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Study Time (minutes)',
          data: dailyDuration,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Progress Overview',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Engagement (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Study Time (minutes)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#28a745';
    if (percentage >= 75) return '#17a2b8';
    if (percentage >= 50) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="goals-tracker">
      <div className="section-header">
        <h2>Goals & Progress</h2>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            Streak
          </button>
          <button
            className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
          <button
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        </div>
      </div>

      {activeTab === 'streak' && (
        <div className="streak-section">
          <div className="streak-cards">
            <div className="streak-card current">
              <div className="streak-icon">🔥</div>
              <div className="streak-content">
                <div className="streak-number">{streak.current}</div>
                <div className="streak-label">Current Streak</div>
                <div className="streak-subtitle">
                  {streak.current === 0 ? 'Start learning today!' : 
                   streak.current === 1 ? 'Keep it up!' : 
                   'Amazing consistency!'}
                </div>
              </div>
            </div>

            <div className="streak-card longest">
              <div className="streak-icon">🏆</div>
              <div className="streak-content">
                <div className="streak-number">{streak.longest}</div>
                <div className="streak-label">Longest Streak</div>
                <div className="streak-subtitle">
                  {streak.longest === 0 ? 'No streak yet' : 
                   streak.longest < streak.current ? 'New record!' : 
                   'Personal best'}
                </div>
              </div>
            </div>

            <div className="streak-card sessions">
              <div className="streak-icon">📚</div>
              <div className="streak-content">
                <div className="streak-number">{sessions.filter(s => s.endTime).length}</div>
                <div className="streak-label">Total Sessions</div>
                <div className="streak-subtitle">
                  {sessions.length === 0 ? 'Start your journey' : 'Sessions completed'}
                </div>
              </div>
            </div>
          </div>

          {streak.lastSession && (
            <div className="last-session-info">
              <span className="last-session-label">Last session:</span>
              <span className="last-session-date">
                {streak.lastSession.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="goals-section">
          <div className="goals-list">
            {allGoals.map((goal) => {
              const percentage = getProgressPercentage(goal.current, goal.target);
              const isCompleted = percentage >= 100;
              
              return (
                <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="goal-header">
                    <div className="goal-info">
                      <h3 className="goal-title">{goal.title}</h3>
                      <p className="goal-description">{goal.description}</p>
                    </div>
                    <div className="goal-status">
                      {isCompleted ? (
                        <div className="status-icon completed">✅</div>
                      ) : (
                        <div className="status-icon pending">⏳</div>
                      )}
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getProgressColor(percentage),
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      <span className="progress-current">
                        {goal.unit === 'minutes' ? formatDuration(goal.current) : `${goal.current} ${goal.unit}`}
                      </span>
                      <span className="progress-target">
                        / {goal.unit === 'minutes' ? formatDuration(goal.target) : `${goal.target} ${goal.unit}`}
                      </span>
                      <span className="progress-percentage">({percentage}%)</span>
                    </div>
                  </div>

                  <div className="goal-meta">
                    <span className="goal-type">{goal.type}</span>
                    {goal.deadline && (
                      <span className="goal-deadline">
                        Due: {goal.deadline.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="progress-section">
          <div className="chart-container">
            <Line data={generateProgressData()} options={chartOptions} />
          </div>
          
          <div className="progress-summary">
            <div className="summary-card">
              <h4>This Week</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Sessions</span>
                  <span className="stat-value">
                    {sessions.filter(s => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return s.startTime >= weekAgo && s.endTime;
                    }).length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Study Time</span>
                  <span className="stat-value">
                    {formatDuration(
                      sessions
                        .filter(s => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return s.startTime >= weekAgo && s.endTime;
                        })
                        .reduce((sum, s) => sum + s.finalMetrics.totalDuration, 0)
                    )}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Engagement</span>
                  <span className="stat-value">
                    {sessions.filter(s => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return s.startTime >= weekAgo && s.endTime;
                    }).length > 0 
                      ? Math.round(
                          (sessions
                            .filter(s => {
                              const weekAgo = new Date();
                              weekAgo.setDate(weekAgo.getDate() - 7);
                              return s.startTime >= weekAgo && s.endTime;
                            })
                            .reduce((sum, s) => sum + s.finalMetrics.averageEngagement, 0) / 
                           sessions.filter(s => {
                             const weekAgo = new Date();
                             weekAgo.setDate(weekAgo.getDate() - 7);
                             return s.startTime >= weekAgo && s.endTime;
                           }).length) * 100
                        )
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTracker;

