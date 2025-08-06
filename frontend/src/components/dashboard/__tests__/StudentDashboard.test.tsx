import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LearningSessionProvider } from '../../../contexts/LearningSessionContext';
import { EngagementProvider } from '../../../contexts/EngagementContext';
import StudentDashboard from '../StudentDashboard';
import type { User } from '../../../types';

// Mock child components
vi.mock('../WelcomeCard', () => ({
  default: ({ user }: { user: User }) => <div data-testid="welcome-card">Welcome {user.name}</div>
}));

vi.mock('../SessionOverview', () => ({
  default: () => <div data-testid="session-overview">Session Overview</div>
}));

vi.mock('../QuickStats', () => ({
  default: () => <div data-testid="quick-stats">Quick Stats</div>
}));

vi.mock('../EngagementChart', () => ({
  default: () => <div data-testid="engagement-chart">Engagement Chart</div>
}));

const mockUser: User = {
  id: '1',
  name: 'Test Student',
  email: 'student@example.com',
  role: 'student',
  preferences: {
    preferredContentType: 'text',
    difficultyLevel: 'intermediate',
    sessionDuration: 30,
    adaptationSensitivity: 'medium',
  },
  createdAt: new Date(),
};

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the useLearningSession hook
const mockUseLearningSession = vi.fn();
vi.mock('../../../contexts/LearningSessionContext', () => ({
  useLearningSession: () => mockUseLearningSession(),
}));

const renderWithProviders = (component: React.ReactElement, user: User | null = mockUser, isSessionActive = false) => {
  mockUseAuth.mockReturnValue({ user });
  mockUseLearningSession.mockReturnValue({ isSessionActive });
  
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('StudentDashboard', () => {
  it('renders loading state when user is not available', () => {
    renderWithProviders(<StudentDashboard />, null);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders dashboard with all sections when user is available', () => {
    renderWithProviders(<StudentDashboard />);

    expect(screen.getByText(/student dashboard/i)).toBeInTheDocument();
    expect(screen.getByTestId('welcome-card')).toBeInTheDocument();
    expect(screen.getByTestId('session-overview')).toBeInTheDocument();
    expect(screen.getByTestId('quick-stats')).toBeInTheDocument();
    expect(screen.getByTestId('engagement-chart')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithProviders(<StudentDashboard />);

    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /learning sessions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });

  it('shows active dashboard navigation button', () => {
    renderWithProviders(<StudentDashboard />);

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).toHaveClass('active');
  });

  it('renders quick actions section', () => {
    renderWithProviders(<StudentDashboard />);

    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start learning session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view progress report/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update preferences/i })).toBeInTheDocument();
  });

  it('disables start session button when session is active', () => {
    renderWithProviders(<StudentDashboard />, mockUser, true);

    const startSessionButton = screen.getByRole('button', { name: /session active/i });
    expect(startSessionButton).toBeDisabled();
    expect(startSessionButton).toHaveTextContent(/session active/i);
  });

  it('enables start session button when no session is active', () => {
    renderWithProviders(<StudentDashboard />, mockUser, false);

    const startSessionButton = screen.getByRole('button', { name: /start learning session/i });
    expect(startSessionButton).not.toBeDisabled();
    expect(startSessionButton).toHaveTextContent(/start learning session/i);
  });

  it('has proper grid layout structure', () => {
    renderWithProviders(<StudentDashboard />);

    const dashboardGrid = screen.getByText(/student dashboard/i).closest('.student-dashboard')?.querySelector('.dashboard-grid');
    expect(dashboardGrid).toBeInTheDocument();

    expect(screen.getByText(/welcome/i).closest('.welcome-section')).toBeInTheDocument();
    expect(screen.getByText(/quick actions/i).closest('.quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('session-overview').closest('.session-overview-section')).toBeInTheDocument();
    expect(screen.getByTestId('quick-stats').closest('.quick-stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('engagement-chart').closest('.engagement-chart-section')).toBeInTheDocument();
  });

  it('passes user data to WelcomeCard component', () => {
    renderWithProviders(<StudentDashboard />);

    expect(screen.getByText(`Welcome ${mockUser.name}`)).toBeInTheDocument();
  });
});

