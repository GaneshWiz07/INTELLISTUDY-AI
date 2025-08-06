import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { EngagementProvider } from '../contexts/EngagementContext';
import { LearningSessionProvider } from '../contexts/LearningSessionContext';
import type { User } from '../types';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  isSessionActive?: boolean;
}

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  preferences: {
    preferredContentType: 'text',
    difficultyLevel: 'intermediate',
    sessionDuration: 30,
    adaptationSensitivity: 'medium',
  },
  createdAt: new Date(),
};

const AllTheProviders: React.FC<{ 
  children: React.ReactNode;
  user?: User | null;
  isSessionActive?: boolean;
}> = ({ children, user: _user = mockUser, isSessionActive: _isSessionActive = false }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EngagementProvider>
          <LearningSessionProvider>
            {children}
          </LearningSessionProvider>
        </EngagementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, isSessionActive, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} isSessionActive={isSessionActive}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render, mockUser };

