import React, { useState } from 'react';
import type { LearningPreferences as LearningPreferencesType, ContentType } from '../../types';
import './LearningPreferences.css';

interface LearningPreferencesProps {
  preferences: LearningPreferencesType;
  onUpdate: (preferences: LearningPreferencesType) => void;
}

const LearningPreferences: React.FC<LearningPreferencesProps> = ({
  preferences,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LearningPreferencesType>(preferences);
  const [isLoading, setIsLoading] = useState(false);

  const contentTypeOptions: { value: ContentType; label: string; description: string }[] = [
    {
      value: 'text',
      label: 'Text Content',
      description: 'Written articles, documents, and reading materials',
    },
    {
      value: 'video',
      label: 'Video Content',
      description: 'Video lectures, tutorials, and visual demonstrations',
    },
    {
      value: 'quiz',
      label: 'Interactive Quizzes',
      description: 'Questions, assessments, and interactive exercises',
    },
    {
      value: 'infographic',
      label: 'Visual Infographics',
      description: 'Charts, diagrams, and visual representations',
    },
  ];

  const difficultyOptions: { value: 'beginner' | 'intermediate' | 'advanced'; label: string; description: string }[] = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'New to the subject, prefer foundational concepts',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience, ready for moderate complexity',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Experienced learner, prefer challenging content',
    },
  ];

  const sensitivityOptions: { value: 'low' | 'medium' | 'high'; label: string; description: string }[] = [
    {
      value: 'low',
      label: 'Low Sensitivity',
      description: 'Adapt content less frequently, prefer consistency',
    },
    {
      value: 'medium',
      label: 'Medium Sensitivity',
      description: 'Balanced adaptation based on engagement patterns',
    },
    {
      value: 'high',
      label: 'High Sensitivity',
      description: 'Adapt quickly to changes in engagement and mood',
    },
  ];

  const sessionDurationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  const handleInputChange = (field: keyof LearningPreferencesType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData(preferences);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="learning-preferences">
      <div className="section-header">
        <h2>Learning Preferences</h2>
        <button
          type="button"
          className={`edit-button ${isEditing ? 'cancel' : 'edit'}`}
          onClick={handleEditToggle}
          disabled={isLoading}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="preferences-form">
        {/* Preferred Content Type */}
        <div className="preference-group">
          <label className="preference-label">Preferred Content Type</label>
          <p className="preference-description">
            Choose your preferred learning format for initial content delivery
          </p>
          <div className="radio-group">
            {contentTypeOptions.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`content-${option.value}`}
                  name="preferredContentType"
                  value={option.value}
                  checked={formData.preferredContentType === option.value}
                  onChange={(e) => handleInputChange('preferredContentType', e.target.value as ContentType)}
                  disabled={!isEditing || isLoading}
                />
                <label htmlFor={`content-${option.value}`} className="radio-label">
                  <span className="radio-title">{option.label}</span>
                  <span className="radio-description">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="preference-group">
          <label className="preference-label">Difficulty Level</label>
          <p className="preference-description">
            Set your current skill level to receive appropriately challenging content
          </p>
          <div className="radio-group">
            {difficultyOptions.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`difficulty-${option.value}`}
                  name="difficultyLevel"
                  value={option.value}
                  checked={formData.difficultyLevel === option.value}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  disabled={!isEditing || isLoading}
                />
                <label htmlFor={`difficulty-${option.value}`} className="radio-label">
                  <span className="radio-title">{option.label}</span>
                  <span className="radio-description">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Session Duration */}
        <div className="preference-group">
          <label className="preference-label">Preferred Session Duration</label>
          <p className="preference-description">
            Choose your ideal learning session length
          </p>
          <div className="select-wrapper">
            <select
              value={formData.sessionDuration}
              onChange={(e) => handleInputChange('sessionDuration', parseInt(e.target.value))}
              disabled={!isEditing || isLoading}
              className="duration-select"
            >
              {sessionDurationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Adaptation Sensitivity */}
        <div className="preference-group">
          <label className="preference-label">Adaptation Sensitivity</label>
          <p className="preference-description">
            Control how quickly the system adapts to your engagement patterns
          </p>
          <div className="radio-group">
            {sensitivityOptions.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`sensitivity-${option.value}`}
                  name="adaptationSensitivity"
                  value={option.value}
                  checked={formData.adaptationSensitivity === option.value}
                  onChange={(e) => handleInputChange('adaptationSensitivity', e.target.value)}
                  disabled={!isEditing || isLoading}
                />
                <label htmlFor={`sensitivity-${option.value}`} className="radio-label">
                  <span className="radio-title">{option.label}</span>
                  <span className="radio-description">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button
              type="submit"
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LearningPreferences;

