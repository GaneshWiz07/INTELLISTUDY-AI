import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserProfile from '../UserProfile';
import { useAuth } from '../../../contexts/AuthContext';
import type { User } from '../../../types';

// Mock the AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the LearningPreferences component
vi.mock('../LearningPreferences', () => ({
  default: ({ preferences, onUpdate }: any) => (
    <div data-testid="learning-preferences">
      <div>Preferred Content: {preferences.preferredContentType}</div>
      <button onClick={() => onUpdate(preferences)}>Update Preferences</button>
    </div>
  ),
}));

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student',
  preferences: {
    preferredContentType: 'text',
    difficultyLevel: 'intermediate',
    sessionDuration: 30,
    adaptationSensitivity: 'medium',
  },
  createdAt: new Date('2024-01-01'),
};

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user profile information correctly', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });

  it('shows error message when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    expect(screen.getByText('Profile Not Available')).toBeInTheDocument();
    expect(screen.getByText('Please log in to view your profile.')).toBeInTheDocument();
  });

  it('enables editing mode when edit button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('validates form inputs correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Clear name field
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to submit
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('validates email format correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Enter invalid email
    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Try to submit using form submit event to bypass browser validation
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('cancels editing and resets form data', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'));

    // Should show original name, not the changed one
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Jane Doe')).not.toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Should exit edit mode
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders learning preferences component', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    expect(screen.getByTestId('learning-preferences')).toBeInTheDocument();
    expect(screen.getByText('Preferred Content: text')).toBeInTheDocument();
  });

  it('handles preferences update', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    // Click update preferences button
    fireEvent.click(screen.getByText('Update Preferences'));

    // Should show success message
    expect(screen.getByText('Learning preferences updated successfully!')).toBeInTheDocument();
  });

  it('displays admin role correctly', () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    mockUseAuth.mockReturnValue({
      user: adminUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<UserProfile />);

    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });
});

