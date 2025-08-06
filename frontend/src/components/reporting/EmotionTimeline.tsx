import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { EngagementPoint } from '../../types';
import './EmotionTimeline.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionTimelineProps {
  engagementData: EngagementPoint[];
}

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({
  engagementData,
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const emotionColors = {
    focused: '#10b981',
    engaged: '#3b82f6',
    confused: '#f59e0b',
    bored: '#6b7280',
    frustrated: '#ef4444',
  };

  const emotionToNumber = (emotion: string): number => {
    switch (emotion) {
      case 'focused': return 5;
      case 'engaged': return 4;
      case 'confused': return 2;
      case 'bored': return 1;
      case 'frustrated': return 1;
      default: return 0;
    }
  };

  // Group data into 5-minute intervals for better visualization
  const groupedData = engagementData.reduce((acc, point, index) => {
    const intervalIndex = Math.floor(index / 5);
    if (!acc[intervalIndex]) {
      acc[intervalIndex] = [];
    }
    acc[intervalIndex].push(point);
    return acc;
  }, {} as Record<number, EngagementPoint[]>);

  const intervals = Object.keys(groupedData).map(key => parseInt(key));
  
  const data = {
    labels: intervals.map(interval => {
      const firstPoint = groupedData[interval][0];
      return formatTime(firstPoint.timestamp);
    }),
    datasets: [
      {
        label: 'Emotion Intensity',
        data: intervals.map(interval => {
          const points = groupedData[interval];
          const avgIntensity = points.reduce((sum, point) => 
            sum + emotionToNumber(point.emotionState.primary), 0
          ) / points.length;
          return avgIntensity;
        }),
        backgroundColor: intervals.map(interval => {
          const points = groupedData[interval];
          const dominantEmotion = points.reduce((acc, point) => {
            acc[point.emotionState.primary] = (acc[point.emotionState.primary] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const mostFrequent = Object.entries(dominantEmotion).reduce((a, b) => 
            dominantEmotion[a[0]] > dominantEmotion[b[0]] ? a : b
          )[0];
          
          return emotionColors[mostFrequent as keyof typeof emotionColors] || '#6b7280';
        }),
        borderColor: intervals.map(interval => {
          const points = groupedData[interval];
          const dominantEmotion = points.reduce((acc, point) => {
            acc[point.emotionState.primary] = (acc[point.emotionState.primary] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const mostFrequent = Object.entries(dominantEmotion).reduce((a, b) => 
            dominantEmotion[a[0]] > dominantEmotion[b[0]] ? a : b
          )[0];
          
          return emotionColors[mostFrequent as keyof typeof emotionColors] || '#6b7280';
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context: any) => {
            const interval = intervals[context[0].dataIndex];
            const points = groupedData[interval];
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];
            return `${formatTime(firstPoint.timestamp)} - ${formatTime(lastPoint.timestamp)}`;
          },
          label: (context: any) => {
            const interval = intervals[context.dataIndex];
            const points = groupedData[interval];
            
            const emotionCounts = points.reduce((acc, point) => {
              acc[point.emotionState.primary] = (acc[point.emotionState.primary] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const totalPoints = points.length;
            const emotionLabels = Object.entries(emotionCounts)
              .sort(([,a], [,b]) => b - a)
              .map(([emotion, count]) => 
                `${emotion}: ${Math.round((count / totalPoints) * 100)}%`
              );
            
            return emotionLabels;
          },
          afterBody: (context: any) => {
            const interval = intervals[context[0].dataIndex];
            const points = groupedData[interval];
            const avgConfidence = points.reduce((sum, point) => 
              sum + point.emotionState.confidence, 0
            ) / points.length;
            
            return [`Average Confidence: ${Math.round(avgConfidence * 100)}%`];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Intervals (5-minute periods)',
          font: {
            size: 14,
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Emotion Intensity',
          font: {
            size: 14,
            weight: 600,
          },
        },
        min: 0,
        max: 5.5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            switch (value) {
              case 1: return 'Low';
              case 2: return 'Confused';
              case 3: return 'Neutral';
              case 4: return 'Engaged';
              case 5: return 'Focused';
              default: return '';
            }
          },
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Calculate emotion statistics
  const emotionStats = engagementData.reduce((acc, point) => {
    const emotion = point.emotionState.primary;
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPoints = engagementData.length;
  const sortedEmotions = Object.entries(emotionStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="emotion-timeline">
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
      
      <div className="emotion-legend">
        {Object.entries(emotionColors).map(([emotion, color]) => (
          <div key={emotion} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: color }}
            ></div>
            <span>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
          </div>
        ))}
      </div>
      
      <div className="emotion-insights">
        <div className="insight-section">
          <h4>Top Emotions</h4>
          <div className="top-emotions">
            {sortedEmotions.map(([emotion, count], index) => (
              <div key={emotion} className="emotion-stat">
                <span className="rank">#{index + 1}</span>
                <span className="emotion-name">{emotion}</span>
                <span className="percentage">
                  {Math.round((count / totalPoints) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="insight-section">
          <h4>Session Summary</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="label">Most Frequent:</span>
              <span className="value">{sortedEmotions[0]?.[0] || 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Avg Confidence:</span>
              <span className="value">
                {Math.round(
                  engagementData.reduce((sum, p) => sum + p.emotionState.confidence, 0) / 
                  engagementData.length * 100
                )}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

