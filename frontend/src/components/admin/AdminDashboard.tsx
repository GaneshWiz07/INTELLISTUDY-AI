import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { EngagementComparison } from './EngagementComparison';
import { SystemControls } from './SystemControls';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">
            Welcome back, {user?.name}
          </p>
        </div>

      <div className="space-y-8">
        <div className="admin-dashboard__overview">
          <div className="overview-card">
            <h3>System Overview</h3>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">156</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Sessions</span>
                <span className="stat-value">23</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Engagement</span>
                <span className="stat-value">78%</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">2 min ago</span>
                <span className="activity-text">New user registered: john.doe@example.com</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">15 min ago</span>
                <span className="activity-text">Learning session completed by Sarah Wilson</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">1 hour ago</span>
                <span className="activity-text">System adaptation triggered for 5 users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UserManagement />
          <EngagementComparison />
          <SystemControls />
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

