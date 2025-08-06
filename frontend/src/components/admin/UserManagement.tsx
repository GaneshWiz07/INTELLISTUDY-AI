import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import './UserManagement.css';

// Mock data for demonstration - in real app, this would come from API
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'student',
    preferences: {
      preferredContentType: 'video',
      difficultyLevel: 'intermediate',
      sessionDuration: 45,
      adaptationSensitivity: 'high',
    },
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'student',
    preferences: {
      preferredContentType: 'text',
      difficultyLevel: 'beginner',
      sessionDuration: 30,
      adaptationSensitivity: 'medium',
    },
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    role: 'admin',
    preferences: {
      preferredContentType: 'infographic',
      difficultyLevel: 'advanced',
      sessionDuration: 60,
      adaptationSensitivity: 'low',
    },
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'student',
    preferences: {
      preferredContentType: 'quiz',
      difficultyLevel: 'intermediate',
      sessionDuration: 40,
      adaptationSensitivity: 'high',
    },
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma.brown@example.com',
    role: 'student',
    preferences: {
      preferredContentType: 'video',
      difficultyLevel: 'advanced',
      sessionDuration: 50,
      adaptationSensitivity: 'medium',
    },
    createdAt: new Date('2024-02-01'),
  },
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');

  useEffect(() => {
    // Simulate API call
    const loadUsers = async () => {
      setLoading(true);
      // In real app: const response = await userService.getAllUsers();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setUsers(mockUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUserAction = (userId: string, action: 'view' | 'edit' | 'delete') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'view':
        setSelectedUser(user);
        break;
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit user:', userId);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
          setUsers(prev => prev.filter(u => u.id !== userId));
        }
        break;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getRoleBadgeClass = (role: string) => {
    return role === 'admin' ? 'role-badge role-badge--admin' : 'role-badge role-badge--student';
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="user-management__header">
          <h2>User Management</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h2>User Management</h2>
        <p className="user-count">Total: {filteredUsers.length} users</p>
      </div>

      <div className="user-management__controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'admin')}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="user-management__table">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Preferences</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td className="user-email">{user.email}</td>
                <td>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td className="user-date">{formatDate(user.createdAt)}</td>
                <td className="user-preferences">
                  <div className="preference-item">
                    Content: {user.preferences.preferredContentType}
                  </div>
                  <div className="preference-item">
                    Level: {user.preferences.difficultyLevel}
                  </div>
                </td>
                <td className="user-actions">
                  <button
                    onClick={() => handleUserAction(user.id, 'view')}
                    className="action-btn action-btn--view"
                    title="View Details"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'edit')}
                    className="action-btn action-btn--edit"
                    title="Edit User"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'delete')}
                    className="action-btn action-btn--delete"
                    title="Delete User"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal__header">
              <h3>User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="user-modal__content">
              <div className="user-detail-row">
                <label>Name:</label>
                <span>{selectedUser.name}</span>
              </div>
              <div className="user-detail-row">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="user-detail-row">
                <label>Role:</label>
                <span className={getRoleBadgeClass(selectedUser.role)}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="user-detail-row">
                <label>Joined:</label>
                <span>{formatDate(selectedUser.createdAt)}</span>
              </div>
              <div className="user-detail-section">
                <h4>Learning Preferences</h4>
                <div className="preferences-grid">
                  <div className="preference-detail">
                    <label>Preferred Content:</label>
                    <span>{selectedUser.preferences.preferredContentType}</span>
                  </div>
                  <div className="preference-detail">
                    <label>Difficulty Level:</label>
                    <span>{selectedUser.preferences.difficultyLevel}</span>
                  </div>
                  <div className="preference-detail">
                    <label>Session Duration:</label>
                    <span>{selectedUser.preferences.sessionDuration} minutes</span>
                  </div>
                  <div className="preference-detail">
                    <label>Adaptation Sensitivity:</label>
                    <span>{selectedUser.preferences.adaptationSensitivity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

