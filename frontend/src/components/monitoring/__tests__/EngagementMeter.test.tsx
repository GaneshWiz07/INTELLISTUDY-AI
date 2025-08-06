import React from 'react';
import { render, screen } from '@testing-library/react';
import { EngagementMeter } from '../EngagementMeter';
import { EngagementProvider } from '../../../contexts/EngagementContext';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <EngagementProvider>
      {component}
    </EngagementProvider>
  );
};

describe('EngagementMeter', () => {
  it('renders with monitoring paused by default', () => {
    renderWithProvider(<EngagementMeter />);
    
    expect(screen.getByText('Engagement Level')).toBeInTheDocument();
    expect(screen.getByText('Engagement monitoring paused')).toBeInTheDocument();
  });

  it('renders in different sizes', () => {
    const { rerender } = renderWithProvider(<EngagementMeter size="small" />);
    expect(screen.getByText('Engagement Level')).toBeInTheDocument();
    
    rerender(
      <EngagementProvider>
        <EngagementMeter size="large" />
      </EngagementProvider>
    );
    expect(screen.getByText('Engagement Level')).toBeInTheDocument();
  });

  it('can hide details when showDetails is false', () => {
    renderWithProvider(<EngagementMeter showDetails={false} />);
    
    expect(screen.getByText('Engagement Level')).toBeInTheDocument();
    expect(screen.queryByText('Contributing Factors')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProvider(<EngagementMeter className="custom-class" />);
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

