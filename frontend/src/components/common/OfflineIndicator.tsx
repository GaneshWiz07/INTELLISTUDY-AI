import React from 'react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import styles from './OfflineIndicator.module.css';

const OfflineIndicator: React.FC = () => {
  const { isOnline, queueLength, isProcessing } = useOfflineStatus();

  if (isOnline && queueLength === 0) {
    return null;
  }

  return (
    <div className={`${styles.indicator} ${isOnline ? styles.syncing : styles.offline}`}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {isOnline ? '🔄' : '📡'}
        </div>
        <div className={styles.text}>
          {isOnline ? (
            isProcessing ? (
              <>Syncing {queueLength} item{queueLength !== 1 ? 's' : ''}...</>
            ) : (
              'Connected'
            )
          ) : (
            <>
              Offline
              {queueLength > 0 && (
                <span className={styles.queueCount}>
                  • {queueLength} pending
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;

