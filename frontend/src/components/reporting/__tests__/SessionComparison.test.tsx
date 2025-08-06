import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionComparison } from '../SessionComparison';
import type { ReportData } from '../../../types';
import { vi } from 'vitest';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div 
      data-testid="comparison-bar-chart" 
      data-chart-data={JSON.stringify(data)} 
      data-chart-options={JSON.stringify(options)}
    >
      Comparison Bar Chart
    </div>
  ),
  Line: ({ data, options }: any) => (
    <div 
      data-testid="comparison-line-chart" 
      data-chart-data={JSON.stringify(data)} 
      data-chart-options={JSON.stringify(options)}
    >
      Comparison Line Chart
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('SessionComparison', () => {
  const mockReportData: ReportData[] = [
    {
      sessionId: 'session-1',
      userId: 'user-123',
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
      contentEffectiveness: [
        { contentType: 'text', averageEngagement: 0.7, completionRate: 0.9, adaptationRate: 0.2 },
        { contentType: 'video', averageEngagement: 0.8, completionRate: 0.85, adaptationRate: 0.15 },
        { contentType: 'quiz', averageEngagement: 0.9, completionRate: 0.95, adaptationRate: 0.05 },
      ],
    },
    {
      sessionId: 'session-2',
      userId: 'user-123',
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
      engagementTrend: [],
      contentEffectiveness: [
        { contentType: 'text', averageEngagement: 0.65, completionRate: 0.8, adaptationRate: 0.3 },
        { contentType: 'video', averageEngagement: 0.75, completionRate: 0.82, adaptationRate: 0.18 },
        { contentType: 'quiz', averageEngagement: 0.85, completionRate: 0.9, adaptationRate: 0.1 },
      ],
    },
    {
      sessionId: 'session-3',
      userId: 'user-123',
      metrics: {
        totalDuration: 1500,
        averageEngagement: 0.82,
        contentCompletionRate: 0.92,
        adaptationCount: 2,
        emotionDistribution: {
          focused: 0.7,
          engaged: 0.2,
          confused: 0.1,
        },
        performanceScore: 0.88,
      },
      engagementTrend: [],
      contentEffectiveness: [
        { contentType: 'text', averageEngagement: 0.8, completionRate: 0.95, adaptationRate: 0.1 },
        { contentType: 'video', averageEngagement: 0.85, completionRate: 0.9, adaptationRate: 0.12 },
        { contentType: 'quiz', averageEngagement: 0.92, completionRate: 0.98, adaptationRate: 0.02 },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders session comparison header', () => {
    render(<SessionComparison reportData={mockReportData} />);
    
    expect(screen.getByText('Session Comparison')).toBeInTheDocument();
    expect(screen.getByText('Compare multiple learning sessions to identify patterns and improvements')).toBeInTheDocument();
  });

  it('displays session checkboxes', () => {
    render(<SessionComparison reportData={mockReportData} />);
    
    expect(screen.getByText('Select Sessions to Compare (up to 4):')).toBeInTheDocument();
    expect(screen.getByText('Session 1')).toBeInTheDocument();
    expect(screen.getByText('Session 2')).toBeInTheDocument();
    expect(screen.getByText('Session 3')).toBeInTheDocument();
    
    // Check for performance scores
    expect(screen.getByText('(80%)')).toBeInTheDocument();
    expect(screen.getByText('(72%)')).toBeInTheDocument();
    expect(screen.getByText('(88%)')).toBeInTheDocument();
  });

  it('allows session selection', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    const session2Checkbox = screen.getByRole('checkbox', { name: /Session 2/ });
    
    await user.click(session1Checkbox);
    await user.click(session2Checkbox);
    
    expect(session1Checkbox).toBeChecked();
    expect(session2Checkbox).toBeChecked();
  });

  it('shows comparison controls when sessions are selected', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Emotion Distribution')).toBeInTheDocument();
    expect(screen.getByText('Content Effectiveness')).toBeInTheDocument();
  });

  it('displays metrics comparison chart by default', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    expect(screen.getByTestId('comparison-bar-chart')).toBeInTheDocument();
    
    const chartElement = screen.getByTestId('comparison-bar-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets).toHaveLength(3); // Engagement, Completion, Performance
    expect(chartData.datasets[0].label).toBe('Average Engagement (%)');
    expect(chartData.datasets[1].label).toBe('Completion Rate (%)');
    expect(chartData.datasets[2].label).toBe('Performance Score (%)');
  });

  it('switches to emotion distribution view', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    const emotionButton = screen.getByText('Emotion Distribution');
    await user.click(emotionButton);
    
    expect(emotionButton).toHaveClass('active');
    expect(screen.getByTestId('comparison-bar-chart')).toBeInTheDocument();
    
    const chartElement = screen.getByTestId('comparison-bar-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets[0].label).toBe('Focused');
    expect(chartData.datasets[1].label).toBe('Engaged');
  });

  it('switches to content effectiveness view', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    const contentButton = screen.getByText('Content Effectiveness');
    await user.click(contentButton);
    
    expect(contentButton).toHaveClass('active');
    expect(screen.getByTestId('comparison-line-chart')).toBeInTheDocument();
    
    const chartElement = screen.getByTestId('comparison-line-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets[0].label).toBe('Text Engagement');
    expect(chartData.datasets[1].label).toBe('Video Engagement');
    expect(chartData.datasets[2].label).toBe('Quiz Engagement');
  });

  it('shows insights when multiple sessions are selected', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    const session2Checkbox = screen.getByRole('checkbox', { name: /Session 2/ });
    
    await user.click(session1Checkbox);
    await user.click(session2Checkbox);
    
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    
    // Should show performance comparison insight
    expect(screen.getByText(/Session \d+ performed \d+% better than Session \d+/)).toBeInTheDocument();
  });

  it('shows session summary table', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText('Session 1')).toBeInTheDocument();
    expect(screen.getByText('30m 0s')).toBeInTheDocument(); // 1800 seconds
    expect(screen.getByText('75%')).toBeInTheDocument(); // engagement
    expect(screen.getByText('85%')).toBeInTheDocument(); // completion
    expect(screen.getByText('3')).toBeInTheDocument(); // adaptations
    expect(screen.getByText('80%')).toBeInTheDocument(); // score
  });

  it('limits selection to 4 sessions', async () => {
    const user = userEvent.setup();
    
    // Add a 4th session to test the limit
    const extendedData = [
      ...mockReportData,
      {
        ...mockReportData[0],
        sessionId: 'session-4',
        metrics: { ...mockReportData[0].metrics, performanceScore: 0.9 },
      },
    ];
    
    render(<SessionComparison reportData={extendedData} />);
    
    // Select 4 sessions
    const checkboxes = screen.getAllByRole('checkbox');
    for (let i = 0; i < 4; i++) {
      await user.click(checkboxes[i]);
    }
    
    // Try to select a 5th session - should show alert
    await user.click(checkboxes[4] || checkboxes[0]); // Fallback in case there are only 4
    
    expect(window.alert).toHaveBeenCalledWith('You can compare up to 4 sessions at once');
  });

  it('shows no data message when no sessions are selected', () => {
    render(<SessionComparison reportData={mockReportData} />);
    
    expect(screen.getByText('Select sessions to compare their performance metrics')).toBeInTheDocument();
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    render(<SessionComparison reportData={mockReportData} />);
    
    const sessionComparison = document.querySelector('.session-comparison');
    expect(sessionComparison).toBeInTheDocument();
    
    const comparisonHeader = document.querySelector('.comparison-header');
    expect(comparisonHeader).toBeInTheDocument();
    
    const sessionSelector = document.querySelector('.session-selector');
    expect(sessionSelector).toBeInTheDocument();
    
    // Select a session to show more elements
    const session1Checkbox = screen.getByRole('checkbox', { name: /Session 1/ });
    await user.click(session1Checkbox);
    
    const comparisonControls = document.querySelector('.comparison-controls');
    expect(comparisonControls).toBeInTheDocument();
    
    const comparisonChart = document.querySelector('.comparison-chart');
    expect(comparisonChart).toBeInTheDocument();
  });

  it('handles empty report data gracefully', () => {
    render(<SessionComparison reportData={[]} />);
    
    expect(screen.getByText('Session Comparison')).toBeInTheDocument();
    expect(screen.getByText('Select Sessions to Compare (up to 4):')).toBeInTheDocument();
    
    // Should not show any session checkboxes
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });
});

