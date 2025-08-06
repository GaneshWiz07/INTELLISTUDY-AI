// Export all services for easy importing
export { authService } from './authService';
export { learningService } from './learningService';
export { analyticsService } from './analyticsService';
export { apiService } from './api';
export { errorService } from './errorService';
export { offlineService } from './offlineService';
export { notificationService } from './notificationService';
export { enhancedApiService } from './enhancedApiService';

// Re-export the default api instance for direct axios usage if needed
export { default as api } from './api';