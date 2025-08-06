import React from 'react';
import type { ContentItem } from '../../types';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import TextContent from './TextContent';
import VideoContent from './VideoContent';
import QuizContent from './QuizContent';
import InfographicContent from './InfographicContent';
import './ContentRenderer.css';

interface ContentRendererProps {
  className?: string;
  content?: ContentItem;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ className, content }) => {
  const { getCurrentContent, contentType } = useLearningSession();
  const currentContent = content || getCurrentContent();

  if (!currentContent) {
    return (
      <div className={`content-renderer ${className || ''}`}>
        <div className="no-content">
          <h3>Loading Content</h3>
          <p>Please start a learning session to view content.</p>
        </div>
      </div>
    );
  }

  const currentContentType = content?.type || contentType;

  const renderContent = () => {
    switch (currentContentType) {
      case 'text':
        return <TextContent content={currentContent} />;
      case 'video':
        return <VideoContent content={currentContent} />;
      case 'quiz':
        return <QuizContent content={currentContent} />;
      case 'infographic':
        return <InfographicContent content={currentContent} />;
      default:
        return (
          <div className="unsupported-content">
            <h3>Unsupported Content Type</h3>
            <p>The content type "{currentContentType}" is not supported.</p>
          </div>
        );
    }
  };

  return (
    <div className={`content-renderer content-type-${currentContentType} ${className || ''}`}>
      <div className="content-header">
        <h2 className="content-title">{currentContent.title}</h2>
        <span className="content-type-badge">{currentContentType.toUpperCase()}</span>
      </div>
      <div className={`content-body content-${currentContentType}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentRenderer;

