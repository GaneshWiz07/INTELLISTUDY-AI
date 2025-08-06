import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LearningPreferences from './LearningPreferences';
import SessionHistory from './SessionHistory';
import GoalsTracker from './GoalsTracker';
import type { LearningPreferences as LearningPreferencesType, LearningSession } from '../../types';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Profile Not Available</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        name: user.name,
        email: user.email,
      });
      setErrors({});
      setSuccessMessage('');
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      // TODO: Implement actual API call to update user profile
      // For now, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful update
      console.log('Profile updated:', formData);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = (preferences: LearningPreferencesType) => {
    // TODO: Implement API call to update preferences
    console.log('Preferences updated:', preferences);
    setSuccessMessage('Learning preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Mock session data for demonstration
  const mockSessions: LearningSession[] = [
    {
      id: '1',
      userId: user?.id || '1',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min session
      contentItems: [
        {
          id: 'c1',
          type: 'text',
          title: 'Introduction to React',
          content: {
            text: 'React basics content',
            readingTime: 10,
          },
          duration: 25,
          engagementScore: 0.85,
        },
        {
          id: 'c2',
          type: 'video',
          title: 'React Hooks Tutorial',
          content: { url: 'video.mp4', thumbnail: 'thumb.jpg', duration: 20 },
          duration: 20,
          engagementScore: 0.92,
        },
      ],
      engagementHistory: [],
      adaptations: [],
      finalMetrics: {
        totalDuration: 45,
        averageEngagement: 0.88,
        contentCompletionRate: 1.0,
        adaptationCount: 1,
        emotionDistribution: { focused: 0.7, engaged: 0.3 },
        performanceScore: 0.85,
      },
    },
    {
      id: '2',
      userId: user?.id || '1',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min session
      contentItems: [
        {
          id: 'c3',
          type: 'quiz',
          title: 'JavaScript Fundamentals Quiz',
          content: { questions: [], timeLimit: 30 },
          duration: 30,
          engagementScore: 0.75,
        },
      ],
      engagementHistory: [],
      adaptations: [],
      finalMetrics: {
        totalDuration: 30,
        averageEngagement: 0.75,
        contentCompletionRate: 0.9,
        adaptationCount: 0,
        emotionDistribution: { focused: 0.5, confused: 0.3, engaged: 0.2 },
        performanceScore: 0.78,
      },
    },
    {
      id: '3',
      userId: user?.id || '1',
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 60 min session
      contentItems: [
        {
          id: 'c4',
          type: 'text',
          title: 'Advanced TypeScript',
          content: {
            text: 'TypeScript advanced concepts',
            readingTime: 15,
          },
          duration: 35,
          engagementScore: 0.82,
        },
        {
          id: 'c5',
          type: 'infographic',
          title: 'TypeScript Types Diagram',
          content: {
            title: 'Visual representation of TS types',
            sections: [
              { title: 'Basic Types', description: 'Fundamental TypeScript types' },
              { title: 'Advanced Types', description: 'Complex type constructs' },
            ],
          },
          duration: 25,
          engagementScore: 0.88,
        },
      ],
      engagementHistory: [],
      adaptations: [],
      finalMetrics: {
        totalDuration: 60,
        averageEngagement: 0.85,
        contentCompletionRate: 1.0,
        adaptationCount: 2,
        emotionDistribution: { focused: 0.6, engaged: 0.4 },
        performanceScore: 0.89,
      },
    },
    {
      id: '4',
      userId: user?.id || '1',
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000), // 40 min session
      contentItems: [
        {
          id: 'c6',
          type: 'video',
          title: 'CSS Grid Layout',
          content: { url: 'css-grid.mp4', thumbnail: 'css-thumb.jpg', duration: 40 },
          duration: 40,
          engagementScore: 0.79,
        },
      ],
      engagementHistory: [],
      adaptations: [],
      finalMetrics: {
        totalDuration: 40,
        averageEngagement: 0.79,
        contentCompletionRate: 0.95,
        adaptationCount: 1,
        emotionDistribution: { focused: 0.4, engaged: 0.4, bored: 0.2 },
        performanceScore: 0.82,
      },
    },
    {
      id: '5',
      userId: user?.id || '1',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000), // 35 min session
      contentItems: [
        {
          id: 'c7',
          type: 'text',
          title: 'Node.js Basics',
          content: {
            text: 'Introduction to Node.js',
            readingTime: 12,
          },
          duration: 35,
          engagementScore: 0.73,
        },
      ],
      engagementHistory: [],
      adaptations: [],
      finalMetrics: {
        totalDuration: 35,
        averageEngagement: 0.73,
        contentCompletionRate: 0.85,
        adaptationCount: 0,
        emotionDistribution: { focused: 0.3, confused: 0.4, engaged: 0.3 },
        performanceScore: 0.76,
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">User Profile</h1>
          <p className="text-neutral-600">Manage your personal information and learning preferences</p>
        </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button
              type="button"
              className={`edit-button ${isEditing ? 'cancel' : 'edit'}`}
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form" role="form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  disabled={isLoading}
                />
              ) : (
                <div className="form-value">{user.name}</div>
              )}
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
              ) : (
                <div className="form-value">{user.email}</div>
              )}
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="form-value role-badge">
                {user.role === 'student' ? 'Student' : 'Administrator'}
              </div>
            </div>

            <div className="form-group">
              <label>Member Since</label>
              <div className="form-value">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}

            {isEditing && (
              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Learning Preferences Section */}
        <div className="profile-section">
          <LearningPreferences
            preferences={user.preferences}
            onUpdate={handlePreferencesUpdate}
          />
        </div>

        {/* Session History Section */}
        <div className="profile-section">
          <SessionHistory sessions={mockSessions} />
        </div>

        {/* Goals Tracker Section */}
        <div className="profile-section">
          <GoalsTracker sessions={mockSessions} />
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserProfile;

