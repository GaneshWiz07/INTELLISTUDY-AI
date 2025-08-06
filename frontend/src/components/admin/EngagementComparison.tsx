import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import './EngagementComparison.css';

interface UserEngagementData {
  user: User;
  sessions: SessionEngagementData[];
  averageEngagement: number;
  totalSessions: number;
}

interface SessionEngagementData {
  sessionId: string;
  date: Date;
  duration: number;
  averageEngagement: number;
  contentCompletionRate: number;
  adaptationCount: number;
}

// Mock data for demonstration
const mockEngagementData: UserEngagementData[] = [
  {
    user: {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'student',
      preferences: {
        preferredContentType: 'video',
        difficultyLevel: 'intermediate',
        sessionDuration: 45,
        adaptationSensitivity: 'high',
      },
      createdAt: new Date('2024-01-15'),
    },
    sessions: [
      {
        sessionId: 's1',
        date: new Date('2024-02-01'),
        duration: 45,
        averageEngagement: 0.85,
        contentCompletionRate: 0.92,
        adaptationCount: 2,
      },
      {
        sessionId: 's2',
        date: new Date('2024-02-03'),
        duration: 40,
        averageEngagement: 0.78,
        contentCompletionRate: 0.88,
        adaptationCount: 3,
      },
      {
        sessionId: 's3',
        date: new Date('2024-02-05'),
        duration: 50,
        averageEngagement: 0.91,
        contentCompletionRate: 0.95,
        adaptationCount: 1,
      },
    ],
    averageEngagement: 0.85,
    totalSessions: 3,
  },
  {
    user: {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      role: 'student',
      preferences: {
        preferredContentType: 'text',
        difficultyLevel: 'beginner',
        sessionDuration: 30,
        adaptationSensitivity: 'medium',
      },
      createdAt: new Date('2024-01-20'),
    },
    sessions: [
      {
        sessionId: 's4',
        date: new Date('2024-02-02'),
        duration: 30,
        averageEngagement: 0.72,
        contentCompletionRate: 0.85,
        adaptationCount: 4,
      },
      {
        sessionId: 's5',
        date: new Date('2024-02-04'),
        duration: 35,
        averageEngagement: 0.68,
        contentCompletionRate: 0.80,
        adaptationCount: 5,
      },
    ],
    averageEngagement: 0.70,
    totalSessions: 2,
  },
  {
    user: {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      role: 'student',
      preferences: {
        preferredContentType: 'quiz',
        difficultyLevel: 'intermediate',
        sessionDuration: 40,
        adaptationSensitivity: 'high',
      },
      createdAt: new Date('2024-01-25'),
    },
    sessions: [
      {
        sessionId: 's6',
        date: new Date('2024-02-01'),
        duration: 42,
        averageEngagement: 0.88,
        contentCompletionRate: 0.90,
        adaptationCount: 2,
      },
      {
        sessionId: 's7',
        date: new Date('2024-02-06'),
        duration: 38,
        averageEngagement: 0.82,
        contentCompletionRate: 0.87,
        adaptationCount: 3,
      },
    ],
    averageEngagement: 0.85,
    totalSessions: 2,
  },
];

export const EngagementComparison: React.FC = () => {
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'engagement' | 'sessions'>('engagement');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Simulate API call
    const loadEngagementData = async () => {
      setLoading(true);
      // In real app: const response = await analyticsService.getUserEngagementComparison();
      await new Promise(resolve => setTimeout(resolve, 800));
      setEngagementData(mockEngagementData);
      setLoading(false);
    };

    loadEngagementData();
  }, []);

  const sortedData = [...engagementData].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.user.name.localeCompare(b.user.name);
        break;
      case 'engagement':
        comparison = a.averageEngagement - b.averageEngagement;
        break;
      case 'sessions':
        comparison = a.totalSessions - b.totalSessions;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 0.8) return '#10b981'; // green
    if (engagement >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="engagement-comparison">
        <div className="engagement-comparison__header">
          <h3>Cross-User Engagement Comparison</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="engagement-comparison">
      <div className="engagement-comparison__header">
        <h3>Cross-User Engagement Comparison</h3>
        <div className="comparison-controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'engagement' | 'sessions')}
              className="sort-select"
            >
              <option value="engagement">Engagement</option>
              <option value="name">Name</option>
              <option value="sessions">Sessions</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="engagement-comparison__content">
        <div className="users-overview">
          {sortedData.map((userData) => (
            <div
              key={userData.user.id}
              className={`user-card ${selectedUsers.includes(userData.user.id) ? 'selected' : ''}`}
              onClick={() => handleUserSelection(userData.user.id)}
            >
              <div className="user-card__header">
                <div className="user-info">
                  <h4>{userData.user.name}</h4>
                  <p className="user-email">{userData.user.email}</p>
                </div>
                <div className="engagement-indicator">
                  <div
                    className="engagement-circle"
                    style={{ backgroundColor: getEngagementColor(userData.averageEngagement) }}
                  >
                    {formatPercentage(userData.averageEngagement)}
                  </div>
                </div>
              </div>
              
              <div className="user-stats">
                <div className="stat">
                  <span className="stat-label">Sessions</span>
                  <span className="stat-value">{userData.totalSessions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Duration</span>
                  <span className="stat-value">
                    {Math.round(userData.sessions.reduce((sum, s) => sum + s.duration, 0) / userData.sessions.length)}m
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Completion</span>
                  <span className="stat-value">
                    {formatPercentage(userData.sessions.reduce((sum, s) => sum + s.contentCompletionRate, 0) / userData.sessions.length)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedUsers.length > 0 && (
          <div className="detailed-comparison">
            <h4>Session-wise Comparison ({selectedUsers.length} users selected)</h4>
            <div className="sessions-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Engagement</th>
                    <th>Completion</th>
                    <th>Adaptations</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData
                    .filter(userData => selectedUsers.includes(userData.user.id))
                    .flatMap(userData => 
                      userData.sessions.map(session => ({
                        ...session,
                        userName: userData.user.name,
                        userId: userData.user.id,
                      }))
                    )
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((session, _index) => (
                      <tr key={`${session.userId}-${session.sessionId}`}>
                        <td className="user-name">{session.userName}</td>
                        <td className="session-date">{formatDate(session.date)}</td>
                        <td className="session-duration">{session.duration}m</td>
                        <td className="session-engagement">
                          <span
                            className="engagement-badge"
                            style={{ backgroundColor: getEngagementColor(session.averageEngagement) }}
                          >
                            {formatPercentage(session.averageEngagement)}
                          </span>
                        </td>
                        <td className="session-completion">
                          {formatPercentage(session.contentCompletionRate)}
                        </td>
                        <td className="session-adaptations">{session.adaptationCount}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedUsers.length === 0 && (
          <div className="selection-prompt">
            <p>Click on user cards above to compare their session details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementComparison;

