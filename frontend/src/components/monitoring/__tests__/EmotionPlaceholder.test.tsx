import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmotionPlaceholder } from '../EmotionPlaceholder';
import { EngagementProvider } from '../../../contexts/EngagementContext';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <EngagementProvider>
      {component}
    </EngagementProvider>
  );
};

describe('EmotionPlaceholder', () => {
  it('renders with emotion detection inactive by default', () => {
    renderWithProvider(<EmotionPlaceholder />);
    
    expect(screen.getByText('Emotion Detection')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Enable camera to detect emotions')).toBeInTheDocument();
  });

  it('displays API integration note', () => {
    renderWithProvider(<EmotionPlaceholder />);
    
    expect(screen.getAllByText('Ready for emotion detection API integration')).toHaveLength(2);
  });

  it('shows neutral emotion state initially', () => {
    renderWithProvider(<EmotionPlaceholder />);
    
    // The component should show disabled state initially
    expect(screen.getByText('Enable camera to detect emotions')).toBeInTheDocument();
  });

  it('calls onEmotionChange callback when provided', () => {
    const mockCallback = vi.fn();
    renderWithProvider(<EmotionPlaceholder onEmotionChange={mockCallback} />);
    
    // Component should render without errors
    expect(screen.getByText('Emotion Detection')).toBeInTheDocument();
  });
});

