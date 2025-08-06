import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render as renderWithProviders } from '../../../test/testUtils';
import userEvent from '@testing-library/user-event';
import { ExportControls } from '../ExportControls';
import type { ReportData } from '../../../types';
import { vi } from 'vitest';

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement and related DOM methods
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
};

const mockDiv = {
  className: '',
  textContent: '',
};

const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return mockLink as any;
  }
  if (tagName === 'div') {
    return mockDiv as any;
  }
  return originalCreateElement.call(document, tagName);
});

const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockContains = vi.fn(() => true);
document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;
document.body.contains = mockContains;

describe('ExportControls', () => {
  const mockReportData: ReportData[] = [
    {
      sessionId: 'session-1',
      userId: 'user-123',
      metrics: {
        totalDuration: 1800,
        averageEngagement: 0.75,
        contentCompletionRate: 0.85,
        adaptationCount: 3,
        emotionDistribution: {
          focused: 0.6,
          engaged: 0.3,
          confused: 0.1,
        },
        performanceScore: 0.8,
      },
      engagementTrend: [],
      contentEffectiveness: [
        { contentType: 'text', averageEngagement: 0.7, completionRate: 0.9, adaptationRate: 0.2 },
        { contentType: 'video', averageEngagement: 0.8, completionRate: 0.85, adaptationRate: 0.15 },
      ],
    },
    {
      sessionId: 'session-2',
      userId: 'user-123',
      metrics: {
        totalDuration: 2100,
        averageEngagement: 0.68,
        contentCompletionRate: 0.78,
        adaptationCount: 5,
        emotionDistribution: {
          focused: 0.5,
          engaged: 0.25,
          confused: 0.15,
          bored: 0.1,
        },
        performanceScore: 0.72,
      },
      engagementTrend: [],
      contentEffectiveness: [
        { contentType: 'text', averageEngagement: 0.65, completionRate: 0.8, adaptationRate: 0.3 },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders export controls with format selector', () => {
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    expect(screen.getByText('Export Reports')).toBeInTheDocument();
    expect(screen.getByText('Download your learning analytics data for offline analysis')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PDF Report')).toBeInTheDocument();
  });

  it('displays export buttons', () => {
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    expect(screen.getByText('Export Current Session')).toBeInTheDocument();
    expect(screen.getByText('Export All Sessions')).toBeInTheDocument();
  });

  it('shows format information', () => {
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    expect(screen.getByText('PDF Report:')).toBeInTheDocument();
    expect(screen.getByText('CSV Data:')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive formatted report with charts and insights')).toBeInTheDocument();
    expect(screen.getByText('Raw data suitable for spreadsheet analysis and custom visualizations')).toBeInTheDocument();
  });

  it('allows format selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    const formatSelect = screen.getByLabelText('Export Format:');
    await user.selectOptions(formatSelect, 'csv');
    
    expect(screen.getByDisplayValue('CSV Data')).toBeInTheDocument();
  });

  it('exports current session when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    const exportButton = screen.getByText('Export Current Session');
    await user.click(exportButton);
    
    // Should show loading state
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    
    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText('Export Current Session')).toBeInTheDocument();
    });
    
    // Should have called download functions
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('exports all sessions when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    const exportAllButton = screen.getByText('Export All Sessions');
    await user.click(exportAllButton);
    
    // Should show loading state
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    
    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText('Export All Sessions')).toBeInTheDocument();
    });
    
    // Should have called download functions
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('disables export current session when no session is selected', () => {
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId={null} />);
    
    const exportButton = screen.getByText('Export Current Session');
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveAttribute('title', 'Please select a session first');
  });

  it('disables export all when no data is available', () => {
    renderWithProviders(<ExportControls reportData={[]} selectedSessionId={null} />);
    
    const exportAllButton = screen.getByText('Export All Sessions');
    expect(exportAllButton).toBeDisabled();
    expect(exportAllButton).toHaveAttribute('title', 'No data available');
  });

  it('shows alert when trying to export without selected session', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId={null} />);
    
    // Force enable the button to test the alert
    const exportButton = screen.getByText('Export Current Session');
    exportButton.removeAttribute('disabled');
    
    await user.click(exportButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please select a session to export');
  });

  it('shows alert when trying to export all with no data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={[]} selectedSessionId={null} />);
    
    // Force enable the button to test the alert
    const exportAllButton = screen.getByText('Export All Sessions');
    exportAllButton.removeAttribute('disabled');
    
    await user.click(exportAllButton);
    
    expect(window.alert).toHaveBeenCalledWith('No data available to export');
  });

  it('applies correct CSS classes', () => {
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    const exportControls = document.querySelector('.export-controls');
    expect(exportControls).toBeInTheDocument();
    
    const exportHeader = document.querySelector('.export-header');
    expect(exportHeader).toBeInTheDocument();
    
    const exportOptions = document.querySelector('.export-options');
    expect(exportOptions).toBeInTheDocument();
    
    const exportInfo = document.querySelector('.export-info');
    expect(exportInfo).toBeInTheDocument();
  });

  it('handles CSV export format correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExportControls reportData={mockReportData} selectedSessionId="session-1" />);
    
    // Select CSV format
    const formatSelect = screen.getByLabelText('Export Format:');
    await user.selectOptions(formatSelect, 'csv');
    
    // Export current session
    const exportButton = screen.getByText('Export Current Session');
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Current Session')).toBeInTheDocument();
    });
    
    // Check that the download was called with CSV content
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text/csv'
      })
    );
  });
});

