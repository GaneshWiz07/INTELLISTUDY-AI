import React, { useEffect, useRef } from 'react';
import styles from './AccessibleNotification.module.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface AccessibleNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
  id?: string;
}

const AccessibleNotification: React.FC<AccessibleNotificationProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className = '',
  id
}) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Auto close functionality
  useEffect(() => {
    if (autoClose && onClose) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, onClose]);

  // Focus management for screen readers
  useEffect(() => {
    if (type === 'error' && notificationRef.current) {
      // For error notifications, focus the notification for immediate attention
      notificationRef.current.focus();
    }
  }, [type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getAriaLive = () => {
    // Error notifications should be assertive for immediate attention
    return type === 'error' ? 'assertive' : 'polite';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose?.();
  };

  return (
    <div
      ref={notificationRef}
      id={id}
      className={`${styles.notification} ${styles[type]} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={getAriaLive()}
      aria-atomic="true"
      tabIndex={type === 'error' ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.notificationContent}>
        <div className={styles.iconContainer}>
          <span 
            className={styles.icon}
            aria-hidden="true"
          >
            {getIcon()}
          </span>
        </div>
        
        <div className={styles.textContent}>
          <div className={styles.title}>
            {title}
          </div>
          <div className={styles.message}>
            {message}
          </div>
        </div>
        
        {onClose && (
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label={`Close ${type} notification: ${title}`}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      
      {autoClose && (
        <div 
          className={styles.progressBar}
          style={{
            animationDuration: `${autoCloseDelay}ms`
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Screen reader announcement */}
      <div className="sr-only">
        {type === 'error' ? 'Error: ' : ''}
        {title}. {message}
        {onClose ? ' Press Escape to close.' : ''}
      </div>
    </div>
  );
};

export default AccessibleNotification;

