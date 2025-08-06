import type { ErrorNotification } from './errorService';

export interface Notification extends ErrorNotification {
  // Extending ErrorNotification to include all notification types
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private nextId = 1;

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current notifications
    listener(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Add a new notification
  addNotification(
    type: 'error' | 'warning' | 'info' | 'success',
    title: string,
    message: string,
    options: {
      dismissible?: boolean;
      autoHide?: number;
      id?: string;
    } = {}
  ): string {
    const notification: Notification = {
      id: options.id || this.nextId.toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      dismissible: options.dismissible !== false,
      autoHide: options.autoHide,
    };

    this.nextId++;
    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-hide if specified
    if (notification.autoHide) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.autoHide);
    }

    return notification.id;
  }

  // Remove a notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Clear notifications of a specific type
  clearByType(type: 'error' | 'warning' | 'info' | 'success'): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get notifications by type
  getNotificationsByType(type: 'error' | 'warning' | 'info' | 'success'): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Convenience methods for different notification types
  success(title: string, message: string, autoHide: number = 5000): string {
    return this.addNotification('success', title, message, { autoHide });
  }

  info(title: string, message: string, autoHide: number = 5000): string {
    return this.addNotification('info', title, message, { autoHide });
  }

  warning(title: string, message: string, autoHide?: number): string {
    return this.addNotification('warning', title, message, { autoHide });
  }

  error(title: string, message: string, dismissible: boolean = true): string {
    return this.addNotification('error', title, message, { dismissible });
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

export const notificationService = new NotificationService();