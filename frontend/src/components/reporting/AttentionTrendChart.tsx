import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { EngagementPoint } from '../../types';
import './AttentionTrendChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AttentionTrendChartProps {
  engagementData: EngagementPoint[];
}

export const AttentionTrendChart: React.FC<AttentionTrendChartProps> = ({
  engagementData,
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const engagementToNumber = (level: string): number => {
    switch (level) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const data = {
    labels: engagementData.map(point => formatTime(point.timestamp)),
    datasets: [
      {
        label: 'Attention Level',
        data: engagementData.map(point => engagementToNumber(point.level)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: engagementData.map(point => {
          switch (point.level) {
            case 'high': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'low': return '#ef4444';
            default: return '#6b7280';
          }
        }),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Focus Time',
        data: engagementData.map(point => point.behaviorMetrics.focusTime / 20), // Scale to 0-3 range
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 600,
          },
        },
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
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const point = engagementData[index];
            return `Time: ${formatTime(point.timestamp)}`;
          },
          label: (context: any) => {
            const index = context.dataIndex;
            const point = engagementData[index];
            
            if (context.datasetIndex === 0) {
              return `Attention: ${point.level.charAt(0).toUpperCase() + point.level.slice(1)}`;
            } else {
              return `Focus Time: ${Math.round(point.behaviorMetrics.focusTime)}s`;
            }
          },
          afterBody: (context: any) => {
            const index = context[0].dataIndex;
            const point = engagementData[index];
            return [
              `Emotion: ${point.emotionState.primary}`,
              `Mouse Activity: ${Math.round(point.behaviorMetrics.mouseActivity)}`,
              `Content: ${point.contentContext.contentType}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Engagement Level',
          font: {
            size: 14,
            weight: 600,
          },
        },
        min: 0,
        max: 3.5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            switch (value) {
              case 1: return 'Low';
              case 2: return 'Medium';
              case 3: return 'High';
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
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="attention-trend-chart">
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color high"></div>
          <span>High Attention</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium"></div>
          <span>Medium Attention</span>
        </div>
        <div className="legend-item">
          <div className="legend-color low"></div>
          <span>Low Attention</span>
        </div>
      </div>
      
      <div className="chart-insights">
        <div className="insight">
          <strong>Peak Attention:</strong> {
            engagementData.filter(p => p.level === 'high').length
          } high-attention periods
        </div>
        <div className="insight">
          <strong>Average Focus:</strong> {
            engagementData.length > 0 
              ? Math.round(
                  engagementData.reduce((sum, p) => sum + p.behaviorMetrics.focusTime, 0) / 
                  engagementData.length
                )
              : 0
          }s per interval
        </div>
      </div>
    </div>
  );
};

