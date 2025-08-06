import React, { useEffect, useState } from 'react';
import type { ContentItem } from '../../types';
import './TextContent.css';

interface TextContentProps {
  content: ContentItem;
}

const TextContent: React.FC<TextContentProps> = ({ content }) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // Extract text content
  const textContent = content.content as { text: string; readingTime: number };

  useEffect(() => {
    // Calculate estimated reading time (average 200 words per minute)
    const wordCount = textContent.text.split(' ').length;
    const readTime = Math.ceil(wordCount / 200);
    setEstimatedReadTime(readTime);
  }, [textContent.text]);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector('.text-content-body');
      if (element) {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setReadingProgress(Math.min(progress, 100));
      }
    };

    const element = document.querySelector('.text-content-body');
    element?.addEventListener('scroll', handleScroll);
    
    return () => element?.removeEventListener('scroll', handleScroll);
  }, []);

  const formatContent = (text: string) => {
    // Simple formatting: convert line breaks to paragraphs
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="text-paragraph">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="text-content" data-testid="text-content">
      <div className="text-content-header">
        <div className="reading-info">
          <span className="read-time">📖 {estimatedReadTime} min read</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(readingProgress)}% complete</span>
        </div>
      </div>
      
      <div className="text-content-body">
        <div className="text-content-wrapper">
          {formatContent(textContent.text)}
        </div>
      </div>
      
      <div className="text-content-footer">
        <div className="engagement-score">
          <span>Engagement Score: {content.engagementScore}/10</span>
        </div>
      </div>
    </div>
  );
};

export default TextContent;

