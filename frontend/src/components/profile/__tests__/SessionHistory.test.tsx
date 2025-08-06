import React from 'react';
import { render, screen } from '@testing-library/react';
import SessionHistory from '../SessionHistory';
import type { LearningSession } from '../../../types';

const mockSessions: LearningSession[] = [
  {
    id: '1',
    userId: '1',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T10:45:00Z'),
    contentItems: [
      {
        id: 'c1',
        type: 'text',
        title: 'React Basics',
        content: 'React content',
        duration: 25,
        engagementScore: 0.85,
      },
      {
        id: 'c2',
        type: 'video',
        title: 'React Hooks',
        content: { url: 'video.mp4', thumbnail: 'thumb.jpg', duration: 20 },
        duration: 20,
        engagementScore: 0.92,
      },
    ],
    engagementHistory: [],
    adaptations: [],
    finalMetrics: {
      totalDuration: 45,
      averageEngagement: 0.88,
      contentCompletionRate: 1.0,
      adaptationCount: 1,
      emotionDistribution: { focused: 0.7, engaged: 0.3 },
      performanceScore: 0.85,
    },
  },
  {
    id: '2',
    userId: '1',
    startTime: new Date('2024-01-14T14:30:00Z'),
    endTime: new Date('2024-01-14T15:00:00Z'),
    contentItems: [
      {
        id: 'c3',
        type: 'quiz',
        title: 'JavaScript Quiz',
        content: { questions: [], timeLimit: 30 },
        duration: 30,
        engagementScore: 0.75,
      },
    ],
    engagementHistory: [],
    adaptations: [],
    finalMetrics: {
      totalDuration: 30,
      averageEngagement: 0.75,
      contentCompletionRate: 0.9,
      adaptationCount: 0,
      emotionDistribution: { focused: 0.5, confused: 0.3, engaged: 0.2 },
      performanceScore: 0.78,
    },
  },
];

describe('SessionHistory', () => {
  it('renders session history with sessions', () => {
    render(<SessionHistory sessions={mockSessions} />);

    expect(screen.getByText('Session History')).toBeInTheDocument();
    expect(screen.getByText('Last 2 sessions')).toBeInTheDocument();
  });

  it('displays session information correctly', () => {
    render(<SessionHistory sessions={mockSessions} />);

    // Check duration formatting
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();

    // Check engagement percentages
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();

    // Check completion rates
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();

    // Check performance scores
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('shows completed status for finished sessions', () => {
    render(<SessionHistory sessions={mockSessions} />);

    const completedStatuses = screen.getAllByText('Completed');
    expect(completedStatuses).toHaveLength(2);
  });

  it('displays content item counts', () => {
    render(<SessionHistory sessions={mockSessions} />);

    expect(screen.getByText('2 content items')).toBeInTheDocument();
    expect(screen.getByText('1 content item')).toBeInTheDocument();
  });

  it('shows adaptation counts when present', () => {
    render(<SessionHistory sessions={mockSessions} />);

    expect(screen.getByText('1 adaptation')).toBeInTheDocument();
  });

  it('displays primary emotions correctly', () => {
    render(<SessionHistory sessions={mockSessions} />);

    const emotionTexts = screen.getAllByText('Mostly focused');
    expect(emotionTexts.length).toBeGreaterThan(0);
  });

  it('shows session summary statistics', () => {
    render(<SessionHistory sessions={mockSessions} />);

    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('1h 15m')).toBeInTheDocument();

    expect(screen.getByText('Avg. Engagement')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument(); // (88 + 75) / 2 = 81.5 -> 82%
  });

  it('shows empty state when no sessions', () => {
    render(<SessionHistory sessions={[]} />);

    expect(screen.getByText('No Learning Sessions Yet')).toBeInTheDocument();
    expect(screen.getByText('Start your first learning session to see your progress here!')).toBeInTheDocument();
  });

  it('handles incomplete sessions', () => {
    const incompleteSessions: LearningSession[] = [
      {
        ...mockSessions[0],
        endTime: undefined,
      },
    ];

    render(<SessionHistory sessions={incompleteSessions} />);

    expect(screen.getByText('Incomplete')).toBeInTheDocument();
  });

  it('formats duration correctly for hours', () => {
    const longSession: LearningSession[] = [
      {
        ...mockSessions[0],
        finalMetrics: {
          ...mockSessions[0].finalMetrics,
          totalDuration: 90, // 1h 30m
        },
      },
    ];

    render(<SessionHistory sessions={longSession} />);

    const durationTexts = screen.getAllByText('1h 30m');
    expect(durationTexts.length).toBeGreaterThan(0);
  });

  it('formats duration correctly for exact hours', () => {
    const hourSession: LearningSession[] = [
      {
        ...mockSessions[0],
        finalMetrics: {
          ...mockSessions[0].finalMetrics,
          totalDuration: 120, // 2h
        },
      },
    ];

    render(<SessionHistory sessions={hourSession} />);

    const durationTexts = screen.getAllByText('2h');
    expect(durationTexts.length).toBeGreaterThan(0);
  });

  it('displays correct engagement bar colors', () => {
    const { container } = render(<SessionHistory sessions={mockSessions} />);

    const engagementBars = container.querySelectorAll('.engagement-fill');
    
    // First session has 88% engagement (should be green)
    expect(engagementBars[0]).toHaveStyle('background-color: rgb(40, 167, 69)');
    
    // Second session has 75% engagement (should be yellow)
    expect(engagementBars[1]).toHaveStyle('background-color: rgb(255, 193, 7)');
  });

  it('shows correct performance icons', () => {
    render(<SessionHistory sessions={mockSessions} />);

    // Performance scores of 85% and 78% should show star and thumbs up icons
    expect(screen.getByText('⭐')).toBeInTheDocument(); // 85% -> star
    expect(screen.getByText('👍')).toBeInTheDocument(); // 78% -> thumbs up
  });
});

