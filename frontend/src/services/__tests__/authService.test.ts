import { authService } from '../authService';
import { apiService } from '../api';
import type { LoginCredentials, RegisterData, User } from '../../types';

// Mock the API service
vi.mock('../api');
const mockApiService = vi.mocked(apiService);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Token Management', () => {
    it('should set and get tokens correctly', () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';

      authService.setTokens(token, refreshToken);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', refreshToken);

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'authToken') return token;
        if (key === 'refreshToken') return refreshToken;
        return null;
      });

      expect(authService.getToken()).toBe(token);
      expect(authService.getRefreshToken()).toBe(refreshToken);
    });

    it('should clear tokens correctly', () => {
      authService.clearTokens();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should check authentication status', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);

      mockLocalStorage.getItem.mockReturnValue('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should set and get user correctly', () => {
      const user: User = {
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
        createdAt: new Date('2024-01-01'),
      };

      authService.setUser(user);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user));
      const retrievedUser = authService.getUser();

      expect(retrievedUser).toEqual(user);
      expect(retrievedUser?.createdAt).toBeInstanceOf(Date);
    });

    it('should handle invalid user data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      expect(authService.getUser()).toBe(null);
    });

    it('should return null when no user is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(authService.getUser()).toBe(null);
    });
  });

  describe('Login', () => {
    it('should login successfully with API', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: credentials.email,
            role: 'student' as const,
            preferences: {
              preferredContentType: 'text' as const,
              difficultyLevel: 'intermediate' as const,
              sessionDuration: 30,
              adaptationSensitivity: 'medium' as const,
            },
            createdAt: new Date(),
          },
          token: 'jwt-token',
          refreshToken: 'refresh-token',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'jwt-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    });

    it('should fallback to mock login when API fails', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockApiService.post.mockRejectedValue(new Error('Network error'));

      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe(credentials.email);
      expect(result.data?.token).toBe('mock-jwt-token');
    });

    it('should set admin role for admin emails', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        password: 'password123',
      };

      mockApiService.post.mockRejectedValue(new Error('Network error'));

      const result = await authService.login(credentials);

      expect(result.data?.user.role).toBe('admin');
    });
  });

  describe('Register', () => {
    it('should register successfully with API', async () => {
      const userData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'student',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            name: userData.name,
            email: userData.email,
            role: userData.role,
            preferences: {
              preferredContentType: 'text' as const,
              difficultyLevel: 'beginner' as const,
              sessionDuration: 30,
              adaptationSensitivity: 'medium' as const,
            },
            createdAt: new Date(),
          },
          token: 'new-jwt-token',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register(userData);

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'new-jwt-token');
    });

    it('should fallback to mock register when API fails', async () => {
      const userData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'student',
      };

      mockApiService.post.mockRejectedValue(new Error('Network error'));

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.data?.user.name).toBe(userData.name);
      expect(result.data?.user.email).toBe(userData.email);
      expect(result.data?.user.role).toBe(userData.role);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await authService.logout();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear tokens even if API call fails', async () => {
      mockApiService.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Refresh Token', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'old-refresh-token';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'refreshToken') return refreshToken;
        return null;
      });

      const mockResponse = {
        success: true,
        data: {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken });
      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'new-jwt-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });

    it('should throw error when no refresh token is available', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });

    it('should clear tokens when refresh fails', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-refresh-token');
      mockApiService.post.mockRejectedValue(new Error('Invalid refresh token'));

      await expect(authService.refreshToken()).rejects.toThrow();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Validate Token', () => {
    it('should validate token successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student' as const,
            preferences: {
              preferredContentType: 'text' as const,
              difficultyLevel: 'intermediate' as const,
              sessionDuration: 30,
              adaptationSensitivity: 'medium' as const,
            },
            createdAt: new Date(),
          },
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.validateToken();

      expect(mockApiService.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });

    it('should clear tokens when validation fails', async () => {
      mockApiService.get.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.validateToken()).rejects.toThrow();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
});