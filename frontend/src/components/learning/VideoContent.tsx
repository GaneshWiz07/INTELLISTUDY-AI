import React, { useState, useRef, useEffect } from 'react';
import type { ContentItem, VideoData } from '../../types';
import './VideoContent.css';

interface VideoContentProps {
  content: ContentItem;
}

const VideoContent: React.FC<VideoContentProps> = ({ content }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const videoData = content.content as VideoData;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Fallback for when video data is not properly structured
  if (typeof content.content === 'string') {
    return (
      <div className="video-content" data-testid="video-content">
        <div className="video-placeholder">
          <div className="placeholder-icon">🎥</div>
          <h3>Video Content</h3>
          <p>Video URL: {content.content}</p>
          <p className="placeholder-note">
            This is a placeholder for video content. In a real implementation, 
            this would display the actual video player.
          </p>
        </div>
        <div className="video-info">
          <div className="engagement-score">
            <span>Engagement Score: {content.engagementScore}/10</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-content" data-testid="video-content">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-player"
          poster={videoData.thumbnail}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <source src={videoData.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {showControls && (
          <div className="video-controls">
            <div className="controls-top">
              <div className="progress-container">
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                />
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="controls-bottom">
              <div className="controls-left">
                <button 
                  className="control-button play-pause"
                  onClick={togglePlay}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="controls-right">
                <div className="volume-control">
                  <span className="volume-icon">🔊</span>
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="video-info">
        <div className="video-details">
          <p className="video-duration">Duration: {Math.ceil(videoData.duration / 60)} minutes</p>
        </div>
        <div className="engagement-score">
          <span>Engagement Score: {content.engagementScore}/10</span>
        </div>
      </div>
    </div>
  );
};

export default VideoContent;

