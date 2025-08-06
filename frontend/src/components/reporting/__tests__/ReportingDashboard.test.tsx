import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportingDashboard } from '../ReportingDashboard';
import { vi } from 'vitest';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Line Chart Mock
    </div>
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Bar Chart Mock
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}));

describe('ReportingDashboard', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Learning Analytics Dashboard')).toBeInTheDocument();
    });
  });

  it('renders dashboard with mock data after loading', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Analytics Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Comprehensive insights into your learning patterns and engagement')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Session:')).toBeInTheDocument();
  });

  it('displays session metrics correctly', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Session Duration')).toBeInTheDocument();
    });

    expect(screen.getByText('Average Engagement')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Adaptations')).toBeInTheDocument();
    
    // Check for metric values
    expect(screen.getByText('30m 0s')).toBeInTheDocument(); // 1800 seconds = 30 minutes
    expect(screen.getByText('75%')).toBeInTheDocument(); // 0.75 * 100
    expect(screen.getByText('85%')).toBeInTheDocument(); // 0.85 * 100
    expect(screen.getByText('3')).toBeInTheDocument(); // adaptationCount
  });

  it('renders attention trend chart', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Attention Trend Over Time')).toBeInTheDocument();
    });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders emotion timeline chart', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Emotion Timeline')).toBeInTheDocument();
    });

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('displays emotion distribution', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Emotion Distribution')).toBeInTheDocument();
    });

    // Use more specific selectors to avoid multiple matches
    const emotionDistribution = document.querySelector('.emotion-distribution');
    expect(emotionDistribution).toBeInTheDocument();
    expect(emotionDistribution).toHaveTextContent('Focused');
    expect(emotionDistribution).toHaveTextContent('Engaged');
    expect(emotionDistribution).toHaveTextContent('Confused');
    
    // Check for percentage values
    expect(screen.getByText('60%')).toBeInTheDocument(); // focused: 0.6
    expect(screen.getByText('30%')).toBeInTheDocument(); // engaged: 0.3
    expect(screen.getByText('10%')).toBeInTheDocument(); // confused: 0.1
  });

  it('allows session selection', async () => {
    const user = userEvent.setup();
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Select Session:')).toBeInTheDocument();
    });

    const sessionSelect = screen.getByLabelText('Select Session:');
    expect(sessionSelect).toBeInTheDocument();
    
    // Should have multiple session options
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    
    // Test session selection
    await user.selectOptions(sessionSelect, 'session-2');
    
    await waitFor(() => {
      // Should update metrics for the new session
      expect(screen.getByText('35m 0s')).toBeInTheDocument(); // 2100 seconds = 35 minutes
      expect(screen.getByText('68%')).toBeInTheDocument(); // 0.68 * 100
      expect(screen.getByText('78%')).toBeInTheDocument(); // 0.78 * 100
      expect(screen.getByText('5')).toBeInTheDocument(); // adaptationCount
    });
  });

  it('handles empty data gracefully', async () => {
    // Mock empty data scenario
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(<ReportingDashboard userId="empty-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Analytics Dashboard')).toBeInTheDocument();
    });
    
    console.error = originalConsoleError;
  });

  it('applies correct CSS classes', async () => {
    render(<ReportingDashboard userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Analytics Dashboard')).toBeInTheDocument();
    });

    const dashboard = screen.getByText('Learning Analytics Dashboard').closest('.reporting-dashboard');
    expect(dashboard).toBeInTheDocument();
    
    const header = screen.getByText('Learning Analytics Dashboard').closest('.dashboard-header');
    expect(header).toBeInTheDocument();
    
    const metricsOverview = document.querySelector('.metrics-overview');
    expect(metricsOverview).toBeInTheDocument();
    
    const chartsContainer = document.querySelector('.charts-container');
    expect(chartsContainer).toBeInTheDocument();
  });
});

