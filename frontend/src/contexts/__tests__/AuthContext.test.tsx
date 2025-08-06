import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import type { LoginCredentials, RegisterData } from '../../types';

// Test component to use the auth context
const TestComponent: React.FC = () => {
  const { user, login, register, logout, isLoading, error } = useAuth();

  const handleLogin = async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    try {
      await login(credentials);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleRegister = async () => {
    const userData: RegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
    };
    try {
      await register(userData);
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div>
      <div data-testid="user-info">
        {user ? `Logged in as: ${user.name}` : 'Not logged in'}
      </div>
      <div data-testid="loading">{isLoading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={handleLogin} data-testid="login-btn">
        Login
      </button>
      <button onClick={handleRegister} data-testid="register-btn">
        Register
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('should handle login flow', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    // Should show loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Logged in as: Test User');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
  });

  it('should handle logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Logged in as: Test User');
    });

    // Then logout
    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);

    expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});

