import React from 'react';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from '../OfflineIndicator';

// Mock the useOfflineStatus hook
const mockUseOfflineStatus = vi.fn();
vi.mock('../../../hooks/useOfflineStatus', () => ({
  useOfflineStatus: () => mockUseOfflineStatus(),
}));

describe('OfflineIndicator', () => {
  it('does not render when online', () => {
    mockUseOfflineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      lastOnline: new Date(),
      connectionQuality: 'good',
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders offline indicator when offline', () => {
    mockUseOfflineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      lastOnline: new Date(Date.now() - 30000), // 30 seconds ago
      connectionQuality: 'poor',
    });

    render(<OfflineIndicator />);

    expect(screen.getByText(/you are currently offline/i)).toBeInTheDocument();
    expect(screen.getByText(/some features may not be available/i)).toBeInTheDocument();
  });

  it('shows last online time when offline', () => {
    const lastOnline = new Date(Date.now() - 60000); // 1 minute ago
    mockUseOfflineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      lastOnline,
      connectionQuality: 'poor',
    });

    render(<OfflineIndicator />);

    expect(screen.getByText(/last online:/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes when offline', () => {
    mockUseOfflineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      lastOnline: new Date(),
      connectionQuality: 'poor',
    });

    render(<OfflineIndicator />);

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('applies correct CSS classes when offline', () => {
    mockUseOfflineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      lastOnline: new Date(),
      connectionQuality: 'poor',
    });

    render(<OfflineIndicator />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('offline-indicator');
  });
});

