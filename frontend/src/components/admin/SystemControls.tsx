import React, { useState } from 'react';
import './SystemControls.css';

interface SystemStatus {
  adaptationEngine: 'active' | 'inactive' | 'maintenance';
  dataCollection: 'active' | 'inactive';
  analyticsProcessing: 'active' | 'inactive' | 'processing';
  lastUpdate: Date;
}

interface BackendTrigger {
  id: string;
  name: string;
  description: string;
  category: 'adaptation' | 'analytics' | 'maintenance' | 'data';
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  duration?: number;
}

// Mock system status
const mockSystemStatus: SystemStatus = {
  adaptationEngine: 'active',
  dataCollection: 'active',
  analyticsProcessing: 'processing',
  lastUpdate: new Date(),
};

// Mock backend triggers
const mockTriggers: BackendTrigger[] = [
  {
    id: 'recalc-engagement',
    name: 'Recalculate Engagement Metrics',
    description: 'Recalculates engagement scores for all users based on recent session data',
    category: 'analytics',
    status: 'idle',
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: 45,
  },
  {
    id: 'update-adaptations',
    name: 'Update Adaptation Rules',
    description: 'Refreshes content adaptation rules based on latest user behavior patterns',
    category: 'adaptation',
    status: 'idle',
    lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    duration: 120,
  },
  {
    id: 'sync-user-data',
    name: 'Sync User Data',
    description: 'Synchronizes user preferences and learning data across all systems',
    category: 'data',
    status: 'idle',
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    duration: 30,
  },
  {
    id: 'generate-reports',
    name: 'Generate Analytics Reports',
    description: 'Creates comprehensive analytics reports for all active learning sessions',
    category: 'analytics',
    status: 'idle',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    duration: 180,
  },
  {
    id: 'cleanup-sessions',
    name: 'Cleanup Old Sessions',
    description: 'Archives completed learning sessions older than 90 days',
    category: 'maintenance',
    status: 'idle',
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    duration: 60,
  },
  {
    id: 'optimize-content',
    name: 'Optimize Content Delivery',
    description: 'Optimizes content delivery paths based on user engagement patterns',
    category: 'adaptation',
    status: 'idle',
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    duration: 90,
  },
];

export const SystemControls: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [triggers, setTriggers] = useState<BackendTrigger[]>(mockTriggers);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return '#10b981'; // green
      case 'inactive':
      case 'idle':
        return '#6b7280'; // gray
      case 'processing':
      case 'running':
        return '#f59e0b'; // yellow
      case 'maintenance':
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return '✓';
      case 'inactive':
      case 'idle':
        return '○';
      case 'processing':
      case 'running':
        return '⟳';
      case 'maintenance':
      case 'failed':
        return '⚠';
      default:
        return '○';
    }
  };

  const handleTriggerAction = async (triggerId: string) => {
    // Update trigger status to running
    setTriggers(prev => prev.map(trigger => 
      trigger.id === triggerId 
        ? { ...trigger, status: 'running' }
        : trigger
    ));

    // Simulate backend call
    try {
      // In real app: await backendService.triggerAction(triggerId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update trigger status to completed
      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { 
              ...trigger, 
              status: 'completed',
              lastRun: new Date(),
              duration: Math.floor(Math.random() * 120) + 30 // Random duration 30-150s
            }
          : trigger
      ));

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setTriggers(prev => prev.map(trigger => 
          trigger.id === triggerId 
            ? { ...trigger, status: 'idle' }
            : trigger
        ));
      }, 3000);
    } catch (error) {
      // Update trigger status to failed
      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, status: 'failed' }
          : trigger
      ));
    }
  };

  const toggleSystemComponent = (component: keyof Omit<SystemStatus, 'lastUpdate'>) => {
    setSystemStatus(prev => ({
      ...prev,
      [component]: prev[component] === 'active' ? 'inactive' : 'active',
      lastUpdate: new Date(),
    }));
  };

  const filteredTriggers = selectedCategory === 'all' 
    ? triggers 
    : triggers.filter(trigger => trigger.category === selectedCategory);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="system-controls">
      <div className="system-controls__header">
        <h3>System Monitoring & Controls</h3>
        <div className="last-update">
          Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="system-status">
        <h4>System Status</h4>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-indicator">
              <span 
                className="status-icon"
                style={{ color: getStatusColor(systemStatus.adaptationEngine) }}
              >
                {getStatusIcon(systemStatus.adaptationEngine)}
              </span>
              <div className="status-info">
                <span className="status-name">Adaptation Engine</span>
                <span className="status-value">{systemStatus.adaptationEngine}</span>
              </div>
            </div>
            <button
              onClick={() => toggleSystemComponent('adaptationEngine')}
              className={`toggle-btn ${systemStatus.adaptationEngine === 'active' ? 'active' : 'inactive'}`}
            >
              {systemStatus.adaptationEngine === 'active' ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="status-item">
            <div className="status-indicator">
              <span 
                className="status-icon"
                style={{ color: getStatusColor(systemStatus.dataCollection) }}
              >
                {getStatusIcon(systemStatus.dataCollection)}
              </span>
              <div className="status-info">
                <span className="status-name">Data Collection</span>
                <span className="status-value">{systemStatus.dataCollection}</span>
              </div>
            </div>
            <button
              onClick={() => toggleSystemComponent('dataCollection')}
              className={`toggle-btn ${systemStatus.dataCollection === 'active' ? 'active' : 'inactive'}`}
            >
              {systemStatus.dataCollection === 'active' ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="status-item">
            <div className="status-indicator">
              <span 
                className="status-icon"
                style={{ color: getStatusColor(systemStatus.analyticsProcessing) }}
              >
                {getStatusIcon(systemStatus.analyticsProcessing)}
              </span>
              <div className="status-info">
                <span className="status-name">Analytics Processing</span>
                <span className="status-value">{systemStatus.analyticsProcessing}</span>
              </div>
            </div>
            <button
              onClick={() => toggleSystemComponent('analyticsProcessing')}
              className={`toggle-btn ${systemStatus.analyticsProcessing === 'active' ? 'active' : 'inactive'}`}
            >
              {systemStatus.analyticsProcessing === 'active' ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      <div className="backend-triggers">
        <div className="triggers-header">
          <h4>Backend Integration Triggers</h4>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="adaptation">Adaptation</option>
              <option value="analytics">Analytics</option>
              <option value="data">Data</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="triggers-grid">
          {filteredTriggers.map((trigger) => (
            <div key={trigger.id} className="trigger-card">
              <div className="trigger-header">
                <div className="trigger-info">
                  <h5>{trigger.name}</h5>
                  <p className="trigger-description">{trigger.description}</p>
                </div>
                <div className="trigger-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(trigger.status) }}
                  >
                    {getStatusIcon(trigger.status)} {trigger.status}
                  </span>
                </div>
              </div>

              <div className="trigger-meta">
                <div className="trigger-category">
                  <span className={`category-badge category-${trigger.category}`}>
                    {trigger.category}
                  </span>
                </div>
                {trigger.lastRun && (
                  <div className="trigger-last-run">
                    <span className="meta-label">Last run:</span>
                    <span className="meta-value">{formatTimeAgo(trigger.lastRun)}</span>
                    {trigger.duration && (
                      <span className="meta-duration">
                        ({formatDuration(trigger.duration)})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="trigger-actions">
                <button
                  onClick={() => handleTriggerAction(trigger.id)}
                  disabled={trigger.status === 'running'}
                  className={`trigger-btn ${trigger.status === 'running' ? 'running' : ''}`}
                >
                  {trigger.status === 'running' ? 'Running...' : 'Run Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemControls;

