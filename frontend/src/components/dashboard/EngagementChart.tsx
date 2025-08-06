import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import { useEngagement } from '../../contexts/EngagementContext';
import { Card } from '../ui';

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

const EngagementChart: React.FC = () => {
  const { currentSession, sessionMetrics } = useLearningSession();
  const { emotionState } = useEngagement();

  // Generate mock engagement data for visualization
  const mockEngagementData = useMemo(() => {
    const now = new Date();
    const data = [];
    
    // Generate data points for the last 30 minutes
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute intervals
      const baseEngagement = 60 + Math.sin(i * 0.2) * 20; // Sine wave pattern
      const noise = (Math.random() - 0.5) * 10; // Add some randomness
      const engagement = Math.max(0, Math.min(100, baseEngagement + noise));
      
      data.push({
        time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engagement: Math.round(engagement),
        emotion: i % 5 === 0 ? emotionState.primary : 'focused' // Vary emotions
      });
    }
    
    return data;
  }, [emotionState.primary]);

  const chartData = {
    labels: mockEngagementData.map(point => point.time),
    datasets: [
      {
        label: 'Engagement Level',
        data: mockEngagementData.map(point => point.engagement),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Average',
        data: Array(mockEngagementData.length).fill(sessionMetrics.averageEngagement * 33.33), // Convert to percentage
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const engagement = context.parsed.y;
            const emotion = mockEngagementData[dataIndex]?.emotion || 'unknown';
            
            if (context.datasetIndex === 0) {
              return `Engagement: ${engagement}% (${emotion})`;
            } else {
              return `Average: ${engagement.toFixed(1)}%`;
            }
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
            size: 12,
            weight: 600,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Engagement (%)',
          font: {
            size: 12,
            weight: 600,
          },
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3b82f6',
        hoverBorderColor: '#ffffff',
      },
    },
  };

  const getCurrentEngagementLevel = (): string => {
    const latestEngagement = mockEngagementData[mockEngagementData.length - 1]?.engagement || 0;
    if (latestEngagement >= 80) return 'High';
    if (latestEngagement >= 60) return 'Medium';
    return 'Low';
  };

  const getEngagementTrend = (): { direction: string; percentage: number } => {
    if (mockEngagementData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = mockEngagementData.slice(-5);
    const earlier = mockEngagementData.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, point) => sum + point.engagement, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, point) => sum + point.engagement, 0) / earlier.length;
    
    const diff = recentAvg - earlierAvg;
    
    if (Math.abs(diff) < 2) return { direction: 'stable', percentage: 0 };
    return {
      direction: diff > 0 ? 'increasing' : 'decreasing',
      percentage: Math.abs(diff)
    };
  };

  const trend = getEngagementTrend();

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-h3">Engagement Metrics</h3>
            <p className="text-sm text-neutral-500">Real-time engagement tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-neutral-500">Current Level</div>
            <div className={`text-sm font-bold ${
              getCurrentEngagementLevel() === 'High' ? 'text-green-600' :
              getCurrentEngagementLevel() === 'Medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getCurrentEngagementLevel()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Trend</div>
            <div className={`text-sm font-bold ${
              trend.direction === 'increasing' ? 'text-green-600' :
              trend.direction === 'decreasing' ? 'text-red-600' : 'text-neutral-600'
            }`}>
              {trend.direction === 'stable' ? 'Stable' : 
               `${trend.direction === 'increasing' ? '↗' : '↘'} ${trend.percentage.toFixed(1)}%`}
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Session Average</div>
            <div className="text-lg font-bold text-blue-600">{(sessionMetrics.averageEngagement * 33.33).toFixed(1)}%</div>
          </div>
        </motion.div>
        
        {currentSession && (
          <motion.div 
            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-900">Adaptations</div>
              <div className="text-lg font-bold text-green-600">{currentSession.adaptations.length}</div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Focus Level</div>
            <div className="text-lg font-bold text-purple-600 capitalize">{getCurrentEngagementLevel().toLowerCase()}</div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};

export default EngagementChart;

