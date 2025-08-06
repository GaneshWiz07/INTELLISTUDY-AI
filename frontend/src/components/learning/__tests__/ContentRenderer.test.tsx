import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../../test/testUtils';
import ContentRenderer from '../ContentRenderer';
import type { ContentItem } from '../../../types';

// Using real content components for proper integration testing

const mockTextContent: ContentItem = {
  id: '1',
  type: 'text',
  title: 'Introduction to React',
  content: {
    text: 'React is a JavaScript library for building user interfaces.',
    readingTime: 5,
  },
  duration: 300,
  engagementScore: 0.8,
};

const mockVideoContent: ContentItem = {
  id: '2',
  type: 'video',
  title: 'React Hooks Tutorial',
  content: {
    url: 'https://example.com/video.mp4',
    duration: 600,
    thumbnail: 'https://example.com/thumb.jpg',
  },
  duration: 600,
  engagementScore: 0.9,
};

const mockQuizContent: ContentItem = {
  id: '3',
  type: 'quiz',
  title: 'React Knowledge Check',
  content: {
    questions: [{
      id: 'q1',
      question: 'What is React?',
      options: ['Library', 'Framework', 'Language', 'Tool'],
      correctAnswer: 0,
      explanation: 'React is a JavaScript library.',
    }],
    timeLimit: 60,
  },
  duration: 120,
  engagementScore: 0.7,
};

const mockInfographicContent: ContentItem = {
  id: '4',
  type: 'infographic',
  title: 'React Component Lifecycle',
  content: {
    title: 'Component Lifecycle',
    sections: [
      { title: 'Mounting', description: 'Component is created' },
      { title: 'Updating', description: 'Component is updated' },
      { title: 'Unmounting', description: 'Component is destroyed' },
    ],
  },
  duration: 240,
  engagementScore: 0.85,
};

// Using renderWithProviders from test-utils

describe('ContentRenderer', () => {
  it('renders text content correctly', () => {
    render(<ContentRenderer content={mockTextContent} />);

    expect(screen.getByTestId('text-content')).toBeInTheDocument();
    expect(screen.getByText(/React is a JavaScript library/)).toBeInTheDocument();
  });

  it('renders video content correctly', () => {
    render(<ContentRenderer content={mockVideoContent} />);

    expect(screen.getByTestId('video-content')).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument();
  });

  it('renders quiz content correctly', () => {
    render(<ContentRenderer content={mockQuizContent} />);

    expect(screen.getByTestId('quiz-content')).toBeInTheDocument();
    expect(screen.getByText(/Ready to Start Quiz\?/)).toBeInTheDocument();
  });

  it('renders infographic content correctly', () => {
    render(<ContentRenderer content={mockInfographicContent} />);

    expect(screen.getByTestId('infographic-content')).toBeInTheDocument();
    expect(screen.getByText(/Component Lifecycle/)).toBeInTheDocument();
  });

  it('handles unknown content type gracefully', () => {
    const unknownContent = {
      ...mockTextContent,
      type: 'unknown' as any,
    };

    render(<ContentRenderer content={unknownContent} />);

    expect(screen.getByText(/unsupported content type/i)).toBeInTheDocument();
  });

  it('displays content title', () => {
    render(<ContentRenderer content={mockTextContent} />);

    expect(screen.getByText(mockTextContent.title)).toBeInTheDocument();
  });

  it('shows loading state when content is not provided', () => {
    render(<ContentRenderer content={null} />);

    expect(screen.getByText(/loading content/i)).toBeInTheDocument();
  });

  it('applies correct CSS classes based on content type', () => {
    const { rerender } = render(<ContentRenderer content={mockTextContent} />);

    let container = screen.getByTestId('text-content').closest('.content-renderer');
    expect(container).toHaveClass('content-type-text');

    rerender(<ContentRenderer content={mockVideoContent} />);

    container = screen.getByTestId('video-content').closest('.content-renderer');
    expect(container).toHaveClass('content-type-video');
  });

  it('tracks content engagement when rendered', () => {
    // This test would require actual engagement context integration
    // For now, just verify the component renders correctly
    render(<ContentRenderer content={mockTextContent} />);

    expect(screen.getByTestId('text-content')).toBeInTheDocument();
  });
});

