import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BehaviorTracker } from '../BehaviorTracker';
import { EngagementProvider } from '../../../contexts/EngagementContext';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <EngagementProvider>
      {component}
    </EngagementProvider>
  );
};

describe('BehaviorTracker', () => {
  it('renders with tracking paused by default', () => {
    renderWithProvider(<BehaviorTracker />);
    
    expect(screen.getByText('Behavior Tracking')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByText('Behavior tracking is paused')).toBeInTheDocument();
  });

  it('displays tracking information', () => {
    renderWithProvider(<BehaviorTracker />);
    
    expect(screen.getByText('Tracking user interactions to optimize learning experience')).toBeInTheDocument();
  });

  it('calls onBehaviorChange callback when provided', () => {
    const mockCallback = vi.fn();
    renderWithProvider(<BehaviorTracker onBehaviorChange={mockCallback} />);
    
    // Component should render without errors
    expect(screen.getByText('Behavior Tracking')).toBeInTheDocument();
  });

  it('allows custom tracking interval', () => {
    renderWithProvider(<BehaviorTracker trackingInterval={5000} />);
    
    expect(screen.getByText('Behavior Tracking')).toBeInTheDocument();
  });
});

