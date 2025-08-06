import React, { useEffect, useState } from 'react';
import { notificationService, type Notification } from '../../services/notificationService';
import styles from './NotificationContainer.module.css';

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    notificationService.removeNotification(id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type]}`}
        >
          <div className={styles.content}>
            <div className={styles.icon}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className={styles.text}>
              <div className={styles.title}>{notification.title}</div>
              <div className={styles.message}>{notification.message}</div>
            </div>
          </div>
          {notification.dismissible && (
            <button
              className={styles.dismissButton}
              onClick={() => handleDismiss(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;

