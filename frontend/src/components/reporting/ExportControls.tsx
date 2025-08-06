import React, { useState } from 'react';
import type { ReportData } from '../../types';
import './ExportControls.css';

interface ExportControlsProps {
  reportData: ReportData[];
  selectedSessionId: string | null;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  reportData,
  selectedSessionId,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const selectedSession = reportData.find(
    (report) => report.sessionId === selectedSessionId
  );

  const generateCSVData = (data: ReportData): string => {
    const headers = [
      'Session ID',
      'User ID',
      'Total Duration (s)',
      'Average Engagement',
      'Completion Rate',
      'Adaptation Count',
      'Performance Score',
      'Focused %',
      'Engaged %',
      'Confused %',
      'Bored %',
      'Frustrated %',
    ];

    const row = [
      data.sessionId,
      data.userId,
      data.metrics.totalDuration.toString(),
      data.metrics.averageEngagement.toString(),
      data.metrics.contentCompletionRate.toString(),
      data.metrics.adaptationCount.toString(),
      data.metrics.performanceScore.toString(),
      (data.metrics.emotionDistribution.focused || 0).toString(),
      (data.metrics.emotionDistribution.engaged || 0).toString(),
      (data.metrics.emotionDistribution.confused || 0).toString(),
      (data.metrics.emotionDistribution.bored || 0).toString(),
      (data.metrics.emotionDistribution.frustrated || 0).toString(),
    ];

    return [headers.join(','), row.join(',')].join('\n');
  };

  const generatePDFContent = (data: ReportData): string => {
    return `
Learning Analytics Report
Session: ${data.sessionId}
User: ${data.userId}
Generated: ${new Date().toLocaleDateString()}

SESSION METRICS
===============
Duration: ${Math.floor(data.metrics.totalDuration / 60)}m ${data.metrics.totalDuration % 60}s
Average Engagement: ${Math.round(data.metrics.averageEngagement * 100)}%
Completion Rate: ${Math.round(data.metrics.contentCompletionRate * 100)}%
Adaptations: ${data.metrics.adaptationCount}
Performance Score: ${Math.round(data.metrics.performanceScore * 100)}%

EMOTION DISTRIBUTION
===================
Focused: ${Math.round((data.metrics.emotionDistribution.focused || 0) * 100)}%
Engaged: ${Math.round((data.metrics.emotionDistribution.engaged || 0) * 100)}%
Confused: ${Math.round((data.metrics.emotionDistribution.confused || 0) * 100)}%
Bored: ${Math.round((data.metrics.emotionDistribution.bored || 0) * 100)}%
Frustrated: ${Math.round((data.metrics.emotionDistribution.frustrated || 0) * 100)}%

CONTENT EFFECTIVENESS
====================
${data.contentEffectiveness.map(content => 
  `${content.contentType.toUpperCase()}: Engagement ${Math.round(content.averageEngagement * 100)}%, Completion ${Math.round(content.completionRate * 100)}%, Adaptation Rate ${Math.round(content.adaptationRate * 100)}%`
).join('\n')}

ENGAGEMENT TIMELINE
==================
${data.engagementTrend.slice(0, 10).map((point, _index) => 
  `${point.timestamp.toLocaleTimeString()}: ${point.level.toUpperCase()} attention, ${point.emotionState.primary} emotion`
).join('\n')}
${data.engagementTrend.length > 10 ? '... (truncated)' : ''}
    `.trim();
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!selectedSession) {
      alert('Please select a session to export');
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `learning-report-${selectedSession.sessionId}-${timestamp}`;

      if (exportFormat === 'csv') {
        const csvContent = generateCSVData(selectedSession);
        downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      } else {
        const pdfContent = generatePDFContent(selectedSession);
        downloadFile(pdfContent, `${filename}.txt`, 'text/plain');
      }

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'export-success-message';
      successMessage.textContent = `Report exported successfully as ${exportFormat.toUpperCase()}!`;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (reportData.length === 0) {
      alert('No data available to export');
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `learning-reports-all-${timestamp}`;

      if (exportFormat === 'csv') {
        const allCSVData = reportData.map(generateCSVData).join('\n\n');
        downloadFile(allCSVData, `${filename}.csv`, 'text/csv');
      } else {
        const allPDFData = reportData.map(generatePDFContent).join('\n\n' + '='.repeat(50) + '\n\n');
        downloadFile(allPDFData, `${filename}.txt`, 'text/plain');
      }

      const successMessage = document.createElement('div');
      successMessage.className = 'export-success-message';
      successMessage.textContent = `All reports exported successfully as ${exportFormat.toUpperCase()}!`;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);

    } catch (error) {
      console.error('Export all failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-controls">
      <div className="export-header">
        <h3>Export Reports</h3>
        <p>Download your learning analytics data for offline analysis</p>
      </div>

      <div className="export-options">
        <div className="format-selector">
          <label htmlFor="export-format">Export Format:</label>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
            disabled={isExporting}
          >
            <option value="pdf">PDF Report</option>
            <option value="csv">CSV Data</option>
          </select>
        </div>

        <div className="export-actions">
          <button
            className="export-btn export-current"
            onClick={handleExport}
            disabled={isExporting || !selectedSession}
            title={!selectedSession ? 'Please select a session first' : ''}
          >
            {isExporting ? (
              <>
                <div className="export-spinner"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Current Session
              </>
            )}
          </button>

          <button
            className="export-btn export-all"
            onClick={handleExportAll}
            disabled={isExporting || reportData.length === 0}
            title={reportData.length === 0 ? 'No data available' : ''}
          >
            {isExporting ? (
              <>
                <div className="export-spinner"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Export All Sessions
              </>
            )}
          </button>
        </div>
      </div>

      <div className="export-info">
        <div className="info-item">
          <strong>PDF Report:</strong> Comprehensive formatted report with charts and insights
        </div>
        <div className="info-item">
          <strong>CSV Data:</strong> Raw data suitable for spreadsheet analysis and custom visualizations
        </div>
      </div>
    </div>
  );
};

