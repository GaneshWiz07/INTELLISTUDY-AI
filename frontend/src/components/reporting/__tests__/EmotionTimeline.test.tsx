import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmotionTimeline } from '../EmotionTimeline';
import type { EngagementPoint } from '../../../types';
import { vi } from 'vitest';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div 
      data-testid="emotion-bar-chart" 
      data-chart-data={JSON.stringify(data)} 
      data-chart-options={JSON.stringify(options)}
    >
      Emotion Timeline Bar Chart
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
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('EmotionTimeline', () => {
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
        primary: 'confused',
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
    {
      timestamp: new Date('2024-01-01T10:03:00Z'),
      level: 'medium',
      emotionState: {
        primary: 'bored',
        confidence: 0.6,
        timestamp: new Date('2024-01-01T10:03:00Z'),
      },
      behaviorMetrics: {
        mouseActivity: 30,
        scrollSpeed: 8,
        typingActivity: 5,
        focusTime: 15,
        clickFrequency: 2,
      },
      contentContext: {
        contentId: 'content-2',
        contentType: 'video',
        position: 1,
      },
    },
    {
      timestamp: new Date('2024-01-01T10:04:00Z'),
      level: 'high',
      emotionState: {
        primary: 'frustrated',
        confidence: 0.8,
        timestamp: new Date('2024-01-01T10:04:00Z'),
      },
      behaviorMetrics: {
        mouseActivity: 90,
        scrollSpeed: 25,
        typingActivity: 20,
        focusTime: 40,
        clickFrequency: 8,
      },
      contentContext: {
        contentId: 'content-3',
        contentType: 'quiz',
        position: 0,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chart component', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    expect(screen.getByTestId('emotion-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Emotion Timeline Bar Chart')).toBeInTheDocument();
  });

  it('displays emotion legend with all emotion types', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    expect(screen.getByText('Focused')).toBeInTheDocument();
    expect(screen.getByText('Engaged')).toBeInTheDocument();
    expect(screen.getByText('Confused')).toBeInTheDocument();
    expect(screen.getByText('Bored')).toBeInTheDocument();
    expect(screen.getByText('Frustrated')).toBeInTheDocument();
  });

  it('shows top emotions section', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    expect(screen.getByText('Top Emotions')).toBeInTheDocument();
    
    // Should show top 3 emotions with rankings
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    
    // Each emotion appears once, so each should be 20% (1/5 * 100)
    const percentages = screen.getAllByText('20%');
    expect(percentages).toHaveLength(3); // Top 3 emotions shown
  });

  it('shows session summary section', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText('Most Frequent:')).toBeInTheDocument();
    expect(screen.getByText('Avg Confidence:')).toBeInTheDocument();
    
    // Average confidence: (0.9 + 0.8 + 0.7 + 0.6 + 0.8) / 5 = 0.76 = 76%
    expect(screen.getByText('76%')).toBeInTheDocument();
  });

  it('passes correct data to chart component', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    const chartElement = screen.getByTestId('emotion-bar-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    // Should group data into intervals (5 points = 1 interval since we group by 5)
    expect(chartData.labels).toHaveLength(1);
    // Just check that label is formatted as time string
    expect(chartData.labels[0]).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    
    // Check dataset
    expect(chartData.datasets).toHaveLength(1);
    const dataset = chartData.datasets[0];
    expect(dataset.label).toBe('Emotion Intensity');
    
    // Average intensity: (5 + 4 + 2 + 1 + 1) / 5 = 2.6
    expect(dataset.data).toEqual([2.6]);
  });

  it('handles empty data gracefully', () => {
    render(<EmotionTimeline engagementData={[]} />);
    
    expect(screen.getByTestId('emotion-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Top Emotions')).toBeInTheDocument();
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText('Most Frequent:')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<EmotionTimeline engagementData={mockEngagementData} />);
    
    const timelineContainer = document.querySelector('.emotion-timeline');
    expect(timelineContainer).toBeInTheDocument();
    
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
    
    const legend = document.querySelector('.emotion-legend');
    expect(legend).toBeInTheDocument();
    
    const insights = document.querySelector('.emotion-insights');
    expect(insights).toBeInTheDocument();
  });

  it('displays correct emotion statistics', () => {
    // Create data with repeated emotions to test statistics
    const repeatedEmotionData: EngagementPoint[] = [
      { ...mockEngagementData[0], emotionState: { ...mockEngagementData[0].emotionState, primary: 'focused' } },
      { ...mockEngagementData[1], emotionState: { ...mockEngagementData[1].emotionState, primary: 'focused' } },
      { ...mockEngagementData[2], emotionState: { ...mockEngagementData[2].emotionState, primary: 'engaged' } },
    ];

    render(<EmotionTimeline engagementData={repeatedEmotionData} />);
    
    // focused appears 2/3 times = 67%, engaged appears 1/3 times = 33%
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows correct most frequent emotion', () => {
    const focusedData: EngagementPoint[] = [
      { ...mockEngagementData[0], emotionState: { ...mockEngagementData[0].emotionState, primary: 'focused' } },
      { ...mockEngagementData[1], emotionState: { ...mockEngagementData[1].emotionState, primary: 'focused' } },
      { ...mockEngagementData[2], emotionState: { ...mockEngagementData[2].emotionState, primary: 'engaged' } },
    ];

    render(<EmotionTimeline engagementData={focusedData} />);
    
    // Most frequent should be 'focused'
    const summarySection = screen.getByText('Session Summary').closest('.insight-section');
    expect(summarySection).toHaveTextContent('focused');
  });

  it('calculates average confidence correctly', () => {
    const specificConfidenceData: EngagementPoint[] = [
      { ...mockEngagementData[0], emotionState: { ...mockEngagementData[0].emotionState, confidence: 1.0 } },
      { ...mockEngagementData[1], emotionState: { ...mockEngagementData[1].emotionState, confidence: 0.8 } },
    ];

    render(<EmotionTimeline engagementData={specificConfidenceData} />);
    
    // Average: (1.0 + 0.8) / 2 = 0.9 = 90%
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});

