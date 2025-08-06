import { apiService } from './api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  APIResponse,
} from '../types';

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  // Token management methods
  setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Convert date strings back to Date objects
      if (user.createdAt) {
        user.createdAt = new Date(user.createdAt);
      }
      return user;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // API methods
  async login(
    credentials: LoginCredentials
  ): Promise<APIResponse<{ user: User; token: string; refreshToken?: string }>> {
    try {
      const response = await apiService.post<{ user: User; token: string; refreshToken?: string }>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        this.setTokens(response.data.token, response.data.refreshToken);
        this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      // Fallback to mock for development
      console.warn('API call failed, using mock data:', error);
      return this.mockLogin(credentials);
    }
  }

  async register(
    userData: RegisterData
  ): Promise<APIResponse<{ user: User; token: string; refreshToken?: string }>> {
    try {
      const response = await apiService.post<{ user: User; token: string; refreshToken?: string }>(
        '/auth/register',
        userData
      );

      if (response.success && response.data) {
        this.setTokens(response.data.token, response.data.refreshToken);
        this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      // Fallback to mock for development
      console.warn('API call failed, using mock data:', error);
      return this.mockRegister(userData);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<APIResponse<{ token: string; refreshToken?: string }>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiService.post<{ token: string; refreshToken?: string }>(
        '/auth/refresh',
        { refreshToken }
      );

      if (response.success && response.data) {
        this.setTokens(response.data.token, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      // Clear tokens if refresh fails
      this.clearTokens();
      throw error;
    }
  }

  async validateToken(): Promise<APIResponse<{ user: User }>> {
    try {
      const response = await apiService.get<{ user: User }>('/auth/validate');
      
      if (response.success && response.data) {
        this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Mock methods for development fallback
  private async mockLogin(
    credentials: LoginCredentials
  ): Promise<APIResponse<{ user: User; token: string }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          user: {
            id: '1',
            name: 'Test User',
            email: credentials.email,
            role: credentials.email.includes('admin') ? 'admin' as const : 'student' as const,
            preferences: {
              preferredContentType: 'text' as const,
              difficultyLevel: 'intermediate' as const,
              sessionDuration: 30,
              adaptationSensitivity: 'medium' as const,
            },
            createdAt: new Date(),
          },
          token: 'mock-jwt-token',
        };

        this.setTokens(mockData.token);
        this.setUser(mockData.user);

        resolve({
          success: true,
          data: mockData,
        });
      }, 1000);
    });
  }

  private async mockRegister(
    userData: RegisterData
  ): Promise<APIResponse<{ user: User; token: string }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          user: {
            id: Date.now().toString(),
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
          token: 'mock-jwt-token',
        };

        this.setTokens(mockData.token);
        this.setUser(mockData.user);

        resolve({
          success: true,
          data: mockData,
        });
      }, 1000);
    });
  }
}

export const authService = new AuthService();
