import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useEngagement } from '../../contexts/EngagementContext';
import './WebcamMonitor.css';

interface WebcamMonitorProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
  className?: string;
}

export const WebcamMonitor: React.FC<WebcamMonitorProps> = ({
  onEmotionDetected,
  className = ''
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { webcamEnabled, toggleWebcam } = useEngagement();

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  const handleUserMedia = useCallback(() => {
    setIsPermissionGranted(true);
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setIsPermissionGranted(false);
    if (typeof error === 'string') {
      setError(error);
    } else {
      switch (error.name) {
        case 'NotAllowedError':
          setError('Camera access denied. Please allow camera permissions to enable emotion detection.');
          break;
        case 'NotFoundError':
          setError('No camera found. Please connect a camera to use this feature.');
          break;
        case 'NotReadableError':
          setError('Camera is already in use by another application.');
          break;
        default:
          setError('Unable to access camera. Please check your camera settings.');
      }
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current && webcamEnabled && isPermissionGranted) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onEmotionDetected) {
        // Placeholder for emotion detection API call
        // In a real implementation, this would send the image to an emotion detection service
        const mockEmotions = ['focused', 'confused', 'bored', 'engaged', 'frustrated'];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        const confidence = Math.random() * 0.4 + 0.6; // Random confidence between 0.6-1.0
        
        onEmotionDetected(randomEmotion, confidence);
      }
    }
  }, [webcamEnabled, isPermissionGranted, onEmotionDetected]);

  // Capture frames periodically for emotion detection
  useEffect(() => {
    if (webcamEnabled && isPermissionGranted) {
      const interval = setInterval(captureFrame, 2000); // Capture every 2 seconds
      return () => clearInterval(interval);
    }
  }, [webcamEnabled, isPermissionGranted, captureFrame]);

  const handleToggleWebcam = () => {
    if (!webcamEnabled && !isPermissionGranted) {
      // Reset error state when trying to enable webcam
      setError(null);
    }
    toggleWebcam();
  };

  return (
    <div className={`webcam-monitor ${className}`}>
      <div className="webcam-header">
        <h3>Camera Monitoring</h3>
        <button
          className={`webcam-toggle ${webcamEnabled ? 'enabled' : 'disabled'}`}
          onClick={handleToggleWebcam}
          aria-label={webcamEnabled ? 'Disable camera' : 'Enable camera'}
        >
          {webcamEnabled ? '📹 On' : '📷 Off'}
        </button>
      </div>

      <div className="webcam-container">
        {webcamEnabled ? (
          <>
            {isPermissionGranted === false || error ? (
              <div className="webcam-error">
                <div className="error-icon">⚠️</div>
                <p className="error-message">{error}</p>
                <button 
                  className="retry-button"
                  onClick={() => {
                    setError(null);
                    setIsPermissionGranted(null);
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="webcam-feed">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  videoConstraints={videoConstraints}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  screenshotFormat="image/jpeg"
                  className="webcam-video"
                />
                {isPermissionGranted && (
                  <div className="webcam-status">
                    <span className="status-indicator active"></span>
                    <span className="status-text">Monitoring active</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="webcam-disabled">
            <div className="disabled-icon">📷</div>
            <p>Camera monitoring is disabled</p>
            <p className="privacy-note">
              Enable camera to allow emotion detection and enhanced learning adaptation
            </p>
          </div>
        )}
      </div>

      <div className="privacy-controls">
        <div className="privacy-info">
          <span className="privacy-icon">🔒</span>
          <span className="privacy-text">
            Your camera data is processed locally and not stored
          </span>
        </div>
      </div>
    </div>
  );
};

