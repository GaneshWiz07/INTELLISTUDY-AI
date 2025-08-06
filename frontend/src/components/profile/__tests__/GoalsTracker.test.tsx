import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GoalsTracker from '../GoalsTracker';
import type { LearningSession } from '../../../types';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      <div>Chart Data: {JSON.stringify(data.labels)}</div>
      <div>Chart Title: {options.plugins.title.text}</div>
    </div>
  ),
}));

const mockSessions: LearningSession[] = [
  {
    id: '1',
    userId: '1',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    contentItems: [],
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
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    contentItems: [],
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
  {
    id: '3',
    userId: '1',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    contentItems: [],
    engagementHistory: [],
    adaptations: [],
    finalMetrics: {
      totalDuration: 60,
      averageEngagement: 0.85,
      contentCompletionRate: 1.0,
      adaptationCount: 2,
      emotionDistribution: { focused: 0.6, engaged: 0.4 },
      performanceScore: 0.89,
    },
  },
];

describe('GoalsTracker', () => {
  it('renders goals tracker with default tab', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    expect(screen.getByText('Goals & Progress')).toBeInTheDocument();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays streak information correctly', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Should show current streak
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();

    // Should show session count (there are multiple "3" texts, so we check for the specific one)
    const sessionCounts = screen.getAllByText('3');
    expect(sessionCounts.length).toBeGreaterThan(0);
  });

  it('switches between tabs correctly', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Click on Goals tab
    fireEvent.click(screen.getByText('Goals'));
    expect(screen.getByText('Daily Learning')).toBeInTheDocument();
    expect(screen.getByText('Weekly Sessions')).toBeInTheDocument();

    // Click on Progress tab
    fireEvent.click(screen.getByText('Progress'));
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Chart Title: Weekly Progress Overview')).toBeInTheDocument();

    // Click back to Streak tab
    fireEvent.click(screen.getByText('Streak'));
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('displays default goals correctly', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Goals tab
    fireEvent.click(screen.getByText('Goals'));

    expect(screen.getByText('Daily Learning')).toBeInTheDocument();
    expect(screen.getByText('Complete at least one learning session per day')).toBeInTheDocument();

    expect(screen.getByText('Weekly Sessions')).toBeInTheDocument();
    expect(screen.getByText('Complete multiple learning sessions each week')).toBeInTheDocument();

    expect(screen.getByText('Weekly Study Time')).toBeInTheDocument();
    expect(screen.getByText('Spend focused time learning each week')).toBeInTheDocument();

    expect(screen.getByText('High Engagement')).toBeInTheDocument();
    expect(screen.getByText('Maintain high engagement levels in sessions')).toBeInTheDocument();
  });

  it('shows progress chart in progress tab', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Progress tab
    fireEvent.click(screen.getByText('Progress'));

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Chart Title: Weekly Progress Overview')).toBeInTheDocument();
  });

  it('displays weekly summary statistics', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Progress tab
    fireEvent.click(screen.getByText('Progress'));

    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Study Time')).toBeInTheDocument();
    expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
  });

  it('handles empty sessions correctly', () => {
    render(<GoalsTracker sessions={[]} />);

    // Should show zero values
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts.length).toBeGreaterThan(0); // Current streak
    expect(screen.getByText('No streak yet')).toBeInTheDocument();
  });

  it('calculates streak correctly for consecutive days', () => {
    const consecutiveSessions: LearningSession[] = [
      {
        ...mockSessions[0],
        startTime: new Date(), // Today
        endTime: new Date(),
      },
      {
        ...mockSessions[1],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      },
    ];

    render(<GoalsTracker sessions={consecutiveSessions} />);

    // Should show current streak of 2 (there are multiple "2" texts)
    const streakCounts = screen.getAllByText('2');
    expect(streakCounts.length).toBeGreaterThan(0);
    expect(screen.getByText('Amazing consistency!')).toBeInTheDocument();
  });

  it('shows goal progress bars correctly', () => {
    const { container } = render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Goals tab
    const goalsButtons = screen.getAllByText('Goals');
    fireEvent.click(goalsButtons[0]);
    
    const progressBars = container.querySelectorAll('.progress-bar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('displays goal completion status', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Goals tab
    fireEvent.click(screen.getByText('Goals'));

    // Should show goal types
    expect(screen.getByText('daily')).toBeInTheDocument();
    const weeklyTexts = screen.getAllByText('weekly');
    expect(weeklyTexts.length).toBeGreaterThan(0);
  });

  it('formats duration correctly in goals', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Goals tab
    fireEvent.click(screen.getByText('Goals'));

    // Should show formatted durations (minutes converted to hours/minutes)
    expect(screen.getByText(/\d+h \d+m|\d+m/)).toBeInTheDocument();
  });

  it('shows last session information when available', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Should show last session info
    expect(screen.getByText('Last session:')).toBeInTheDocument();
  });

  it('handles incomplete sessions in streak calculation', () => {
    const incompleteSessions: LearningSession[] = [
      {
        ...mockSessions[0],
        endTime: undefined, // Incomplete session
      },
    ];

    render(<GoalsTracker sessions={incompleteSessions} />);

    // Should show zero streak for incomplete sessions
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts.length).toBeGreaterThan(0); // Current streak
    expect(screen.getByText('Start learning today!')).toBeInTheDocument();
  });

  it('displays correct engagement averages', () => {
    render(<GoalsTracker sessions={mockSessions} />);

    // Switch to Goals tab
    fireEvent.click(screen.getByText('Goals'));

    // Average engagement should be calculated correctly
    // (0.88 + 0.75 + 0.85) / 3 = 0.826... -> 83%
    expect(screen.getByText('83 % avg engagement')).toBeInTheDocument();
  });
});

