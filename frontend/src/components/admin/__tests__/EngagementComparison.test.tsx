import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EngagementComparison } from '../EngagementComparison';

describe('EngagementComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<EngagementComparison />);
    
    expect(screen.getByText('Loading engagement data...')).toBeInTheDocument();
    expect(screen.getByText('Cross-User Engagement Comparison')).toBeInTheDocument();
  });

  it('displays engagement data after loading', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('alice.johnson@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('David Wilson')).toBeInTheDocument();
  });

  it('renders sort controls', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engagement')).toBeInTheDocument();
    expect(screen.getByTitle(/Sort/)).toBeInTheDocument();
  });

  it('allows sorting by different criteria', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    const sortSelect = screen.getByDisplayValue('Engagement');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    expect(screen.getByDisplayValue('Name')).toBeInTheDocument();
  });

  it('toggles sort order when button is clicked', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    const sortOrderBtn = screen.getByTitle(/Sort/);
    const initialText = sortOrderBtn.textContent;
    
    fireEvent.click(sortOrderBtn);
    
    expect(sortOrderBtn.textContent).not.toBe(initialText);
  });

  it('shows selection prompt when no users are selected', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Click on user cards above to compare their session details')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('allows user selection and shows detailed comparison', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click on Alice's card to select her
    const aliceCard = screen.getByText('Alice Johnson').closest('.user-card');
    fireEvent.click(aliceCard!);

    expect(screen.getByText(/Session-wise Comparison \(1 users selected\)/)).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
  });

  it('displays engagement percentages correctly', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument(); // Alice's engagement
    }, { timeout: 2000 });

    expect(screen.getByText('70%')).toBeInTheDocument(); // Bob's engagement
  });

  it('shows user statistics', async () => {
    render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Avg Duration')).toBeInTheDocument();
    expect(screen.getByText('Completion')).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', async () => {
    const { container } = render(<EngagementComparison />);
    
    await waitFor(() => {
      expect(container.querySelector('.engagement-comparison')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(container.querySelector('.users-overview')).toBeInTheDocument();
    expect(container.querySelector('.user-card')).toBeInTheDocument();
    expect(container.querySelector('.engagement-circle')).toBeInTheDocument();
  });
});

