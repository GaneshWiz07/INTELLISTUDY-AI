import React from 'react';
import { render, screen } from '@testing-library/react';
import { AttentionTrendChart } from '../AttentionTrendChart';
import type { EngagementPoint } from '../../../types';
import { vi } from 'vitest';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div 
      data-testid="attention-line-chart" 
      data-chart-data={JSON.stringify(data)} 
      data-chart-options={JSON.stringify(options)}
    >
      Attention Trend Line Chart
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
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}));

describe('AttentionTrendChart', () => {
  const mockEngagementData: EngagementPoint[] = [
    {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      level: 'high',
      emotionState: {
        primary: 'focused',
        confidence: 0.9,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      },
      behaviorMetrics: {
        mouseActivity: 80,
        scrollSpeed: 20,
        typingActivity: 15,
        focusTime: 45,
        clickFrequency: 5,
      },
      contentContext: {
        contentId: 'content-1',
        contentType: 'text',
        position: 0,
      },
    },
    {
      timestamp: new Date('2024-01-01T10:01:00Z'),
      level: 'medium',
      emotionState: {
        primary: 'engaged',
        confidence: 0.8,
        timestamp: new Date('2024-01-01T10:01:00Z'),
      },
      behaviorMetrics: {
        mouseActivity: 60,
        scrollSpeed: 15,
        typingActivity: 10,
        focusTime: 30,
        clickFrequency: 3,
      },
      contentContext: {
        contentId: 'content-1',
        contentType: 'text',
        position: 1,
      },
    },
    {
      timestamp: new Date('2024-01-01T10:02:00Z'),
      level: 'low',
      emotionState: {
        primary: 'bored',
        confidence: 0.7,
        timestamp: new Date('2024-01-01T10:02:00Z'),
      },
      behaviorMetrics: {
        mouseActivity: 20,
        scrollSpeed: 5,
        typingActivity: 2,
        focusTime: 10,
        clickFrequency: 1,
      },
      contentContext: {
        contentId: 'content-2',
        contentType: 'video',
        position: 0,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chart component', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    expect(screen.getByTestId('attention-line-chart')).toBeInTheDocument();
    expect(screen.getByText('Attention Trend Line Chart')).toBeInTheDocument();
  });

  it('displays chart legend with attention levels', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    expect(screen.getByText('High Attention')).toBeInTheDocument();
    expect(screen.getByText('Medium Attention')).toBeInTheDocument();
    expect(screen.getByText('Low Attention')).toBeInTheDocument();
  });

  it('shows chart insights', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    expect(screen.getByText('Peak Attention:')).toBeInTheDocument();
    expect(screen.getByText('1 high-attention periods')).toBeInTheDocument();
    
    expect(screen.getByText('Average Focus:')).toBeInTheDocument();
    expect(screen.getByText('28s per interval')).toBeInTheDocument(); // (45+30+10)/3 = 28.33 rounded to 28
  });

  it('passes correct data to chart component', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    const chartElement = screen.getByTestId('attention-line-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    // Check labels (formatted times)
    expect(chartData.labels).toHaveLength(3);
    // Just check that labels are formatted as time strings
    expect(chartData.labels[0]).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    expect(chartData.labels[1]).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    expect(chartData.labels[2]).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    
    // Check datasets
    expect(chartData.datasets).toHaveLength(2);
    
    // Check attention level data (high=3, medium=2, low=1)
    const attentionDataset = chartData.datasets[0];
    expect(attentionDataset.label).toBe('Attention Level');
    expect(attentionDataset.data).toEqual([3, 2, 1]);
    
    // Check focus time data (scaled to 0-3 range)
    const focusDataset = chartData.datasets[1];
    expect(focusDataset.label).toBe('Focus Time');
    expect(focusDataset.data).toEqual([2.25, 1.5, 0.5]); // [45/20, 30/20, 10/20]
  });

  it('handles empty data gracefully', () => {
    render(<AttentionTrendChart engagementData={[]} />);
    
    expect(screen.getByTestId('attention-line-chart')).toBeInTheDocument();
    expect(screen.getByText('0 high-attention periods')).toBeInTheDocument();
    expect(screen.getByText('0s per interval')).toBeInTheDocument(); // NaN becomes 0 when rounded
  });

  it('applies correct CSS classes', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    const chartContainer = document.querySelector('.attention-trend-chart');
    expect(chartContainer).toBeInTheDocument();
    
    const chartElement = document.querySelector('.chart-container');
    expect(chartElement).toBeInTheDocument();
    
    const legend = document.querySelector('.chart-legend');
    expect(legend).toBeInTheDocument();
    
    const insights = document.querySelector('.chart-insights');
    expect(insights).toBeInTheDocument();
  });

  it('displays correct legend colors', () => {
    render(<AttentionTrendChart engagementData={mockEngagementData} />);
    
    const highLegend = document.querySelector('.legend-color.high');
    expect(highLegend).toBeInTheDocument();
    
    const mediumLegend = document.querySelector('.legend-color.medium');
    expect(mediumLegend).toBeInTheDocument();
    
    const lowLegend = document.querySelector('.legend-color.low');
    expect(lowLegend).toBeInTheDocument();
  });

  it('calculates insights correctly with different data', () => {
    const highEngagementData: EngagementPoint[] = [
      ...mockEngagementData,
      {
        ...mockEngagementData[0],
        timestamp: new Date('2024-01-01T10:03:00Z'),
        level: 'high',
        behaviorMetrics: { ...mockEngagementData[0].behaviorMetrics, focusTime: 60 },
      },
      {
        ...mockEngagementData[0],
        timestamp: new Date('2024-01-01T10:04:00Z'),
        level: 'high',
        behaviorMetrics: { ...mockEngagementData[0].behaviorMetrics, focusTime: 50 },
      },
    ];

    render(<AttentionTrendChart engagementData={highEngagementData} />);
    
    expect(screen.getByText('3 high-attention periods')).toBeInTheDocument();
    expect(screen.getByText('39s per interval')).toBeInTheDocument(); // (45+30+10+60+50)/5 = 39
  });
});

