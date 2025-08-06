import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LearningPreferences from '../LearningPreferences';
import type { LearningPreferences as LearningPreferencesType } from '../../../types';

const mockPreferences: LearningPreferencesType = {
  preferredContentType: 'text',
  difficultyLevel: 'intermediate',
  sessionDuration: 30,
  adaptationSensitivity: 'medium',
};

const mockOnUpdate = vi.fn();

describe('LearningPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders learning preferences correctly', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Learning Preferences')).toBeInTheDocument();
    expect(screen.getByText('Preferred Content Type')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
    expect(screen.getByText('Preferred Session Duration')).toBeInTheDocument();
    expect(screen.getByText('Adaptation Sensitivity')).toBeInTheDocument();
  });

  it('displays current preferences correctly', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Check that text content is selected
    const textRadio = screen.getByLabelText(/Text Content/);
    expect(textRadio).toBeChecked();

    // Check that intermediate difficulty is selected
    const intermediateRadio = screen.getByLabelText(/Intermediate/);
    expect(intermediateRadio).toBeChecked();

    // Check that 30 minutes is selected
    const durationSelect = screen.getByDisplayValue('30 minutes');
    expect(durationSelect).toBeInTheDocument();

    // Check that medium sensitivity is selected
    const mediumRadio = screen.getByLabelText(/Medium Sensitivity/);
    expect(mediumRadio).toBeChecked();
  });

  it('enables editing mode when edit button is clicked', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();

    // Radio buttons should be enabled
    const textRadio = screen.getByLabelText(/Text Content/);
    expect(textRadio).not.toBeDisabled();
  });

  it('allows changing content type preference', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change to video content
    const videoRadio = screen.getByLabelText(/Video Content/);
    fireEvent.click(videoRadio);

    expect(videoRadio).toBeChecked();
  });

  it('allows changing difficulty level', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change to advanced difficulty
    const advancedRadio = screen.getByLabelText(/Advanced/);
    fireEvent.click(advancedRadio);

    expect(advancedRadio).toBeChecked();
  });

  it('allows changing session duration', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change session duration
    const durationSelect = screen.getByDisplayValue('30 minutes');
    fireEvent.change(durationSelect, { target: { value: '60' } });

    expect(screen.getByDisplayValue('1 hour')).toBeInTheDocument();
  });

  it('allows changing adaptation sensitivity', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change to high sensitivity
    const highRadio = screen.getByLabelText(/High Sensitivity/);
    fireEvent.click(highRadio);

    expect(highRadio).toBeChecked();
  });

  it('cancels editing and resets form data', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change to video content
    const videoRadio = screen.getByLabelText(/Video Content/);
    fireEvent.click(videoRadio);

    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'));

    // Should reset to original preference
    const textRadio = screen.getByLabelText(/Text Content/);
    expect(textRadio).toBeChecked();
  });

  it('submits preferences successfully', async () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change preferences
    const videoRadio = screen.getByLabelText(/Video Content/);
    fireEvent.click(videoRadio);

    const advancedRadio = screen.getByLabelText(/Advanced/);
    fireEvent.click(advancedRadio);

    // Submit form
    fireEvent.click(screen.getByText('Save Preferences'));

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        preferredContentType: 'video',
        difficultyLevel: 'advanced',
        sessionDuration: 30,
        adaptationSensitivity: 'medium',
      });
    });

    // Should exit edit mode
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('displays all content type options', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Text Content')).toBeInTheDocument();
    expect(screen.getByText('Video Content')).toBeInTheDocument();
    expect(screen.getByText('Interactive Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Visual Infographics')).toBeInTheDocument();
  });

  it('displays all difficulty options', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('displays all sensitivity options', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Low Sensitivity')).toBeInTheDocument();
    expect(screen.getByText('Medium Sensitivity')).toBeInTheDocument();
    expect(screen.getByText('High Sensitivity')).toBeInTheDocument();
  });

  it('displays all session duration options', () => {
    render(
      <LearningPreferences
        preferences={mockPreferences}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode to see the select options
    fireEvent.click(screen.getByText('Edit'));

    const durationSelect = screen.getByDisplayValue('30 minutes');
    fireEvent.click(durationSelect);

    // Check that all options are available
    expect(screen.getByText('15 minutes')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
    expect(screen.getByText('1.5 hours')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
  });
});

