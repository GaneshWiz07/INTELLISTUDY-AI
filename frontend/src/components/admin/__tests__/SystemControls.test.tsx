import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SystemControls } from '../SystemControls';

describe('SystemControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders system monitoring header', () => {
    render(<SystemControls />);
    
    expect(screen.getByText('System Monitoring & Controls')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('displays system status components', () => {
    render(<SystemControls />);
    
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Adaptation Engine')).toBeInTheDocument();
    expect(screen.getByText('Data Collection')).toBeInTheDocument();
    expect(screen.getByText('Analytics Processing')).toBeInTheDocument();
  });

  it('shows system component toggle buttons', () => {
    render(<SystemControls />);
    
    const toggleButtons = screen.getAllByText(/Enable|Disable/);
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it('displays backend triggers section', () => {
    render(<SystemControls />);
    
    expect(screen.getByText('Backend Integration Triggers')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
  });

  it('shows trigger cards with actions', () => {
    render(<SystemControls />);
    
    expect(screen.getByText('Recalculate Engagement Metrics')).toBeInTheDocument();
    expect(screen.getByText('Update Adaptation Rules')).toBeInTheDocument();
    expect(screen.getByText('Sync User Data')).toBeInTheDocument();
    
    const runButtons = screen.getAllByText('Run Now');
    expect(runButtons.length).toBeGreaterThan(0);
  });

  it('allows filtering triggers by category', () => {
    render(<SystemControls />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'analytics' } });
    
    expect(screen.getByDisplayValue('Analytics')).toBeInTheDocument();
  });

  it('handles trigger execution', async () => {
    render(<SystemControls />);
    
    const runButtons = screen.getAllByText('Run Now');
    fireEvent.click(runButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument();
    });
  });

  it('toggles system components', () => {
    render(<SystemControls />);
    
    const toggleButtons = screen.getAllByText(/Enable|Disable/);
    const initialText = toggleButtons[0].textContent;
    
    fireEvent.click(toggleButtons[0]);
    
    // The button text should change after clicking
    expect(toggleButtons[0].textContent).not.toBe(initialText);
  });

  it('displays status indicators with colors', () => {
    const { container } = render(<SystemControls />);
    
    const statusIcons = container.querySelectorAll('.status-icon');
    expect(statusIcons.length).toBeGreaterThan(0);
    
    // Check that status icons have color styles
    statusIcons.forEach(icon => {
      expect(icon).toHaveStyle('color: rgb(16, 185, 129)'); // active color or similar
    });
  });

  it('shows trigger categories with badges', () => {
    render(<SystemControls />);
    
    const categoryBadges = screen.container.querySelectorAll('.category-badge');
    expect(categoryBadges.length).toBeGreaterThan(0);
  });

  it('displays last run information for triggers', () => {
    render(<SystemControls />);
    
    expect(screen.getByText('Last run:')).toBeInTheDocument();
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    const { container } = render(<SystemControls />);
    
    expect(container.querySelector('.system-controls')).toBeInTheDocument();
    expect(container.querySelector('.system-status')).toBeInTheDocument();
    expect(container.querySelector('.backend-triggers')).toBeInTheDocument();
    expect(container.querySelector('.triggers-grid')).toBeInTheDocument();
  });
});

