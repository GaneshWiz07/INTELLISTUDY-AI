import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserManagement } from '../UserManagement';

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<UserManagement />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('displays users after loading', async () => {
    render(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('alice.johnson@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Carol Davis')).toBeInTheDocument();
  });

  it('displays user count correctly', async () => {
    render(<UserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Total: 5 users')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders basic structure', () => {
    render(<UserManagement />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search users by name or email...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Roles')).toBeInTheDocument();
  });
});

