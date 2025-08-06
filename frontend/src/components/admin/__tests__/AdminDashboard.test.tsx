import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { AdminDashboard } from '../AdminDashboard';

import { vi } from 'vitest';

// Mock the UserManagement component
vi.mock('../UserManagement', () => ({
  UserManagement: () => <div data-testid="user-management">User Management Component</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  it('renders admin dashboard header', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });

  it('displays system overview statistics', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('System Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('displays recent activity section', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/New user registered/)).toBeInTheDocument();
    expect(screen.getByText(/Learning session completed/)).toBeInTheDocument();
    expect(screen.getByText(/System adaptation triggered/)).toBeInTheDocument();
  });

  it('renders user management component', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    const { container } = renderWithProviders(<AdminDashboard />);
    
    expect(container.querySelector('.admin-dashboard')).toBeInTheDocument();
    expect(container.querySelector('.admin-dashboard__header')).toBeInTheDocument();
    expect(container.querySelector('.admin-dashboard__content')).toBeInTheDocument();
    expect(container.querySelector('.overview-card')).toBeInTheDocument();
  });
});

