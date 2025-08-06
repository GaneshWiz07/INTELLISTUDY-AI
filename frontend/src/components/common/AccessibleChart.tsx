import React from 'react';
import styles from './AccessibleChart.module.css';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AccessibleChartProps {
  title: string;
  description: string;
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie' | 'area';
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const AccessibleChart: React.FC<AccessibleChartProps> = ({
  title,
  description,
  data,
  type,
  children,
  className = '',
  ariaLabel
}) => {
  const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${chartId}-description`;
  const tableId = `${chartId}-table`;

  // Generate summary statistics
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const average = total / data.length;
  const max = Math.max(...data.map(point => point.value));
  const min = Math.min(...data.map(point => point.value));
  const maxPoint = data.find(point => point.value === max);
  const minPoint = data.find(point => point.value === min);

  const generateSummary = () => {
    switch (type) {
      case 'bar':
        return `Bar chart showing ${data.length} data points. Highest value: ${maxPoint?.label} at ${max}. Lowest value: ${minPoint?.label} at ${min}. Average: ${average.toFixed(2)}.`;
      case 'line':
        return `Line chart showing ${data.length} data points over time. Peak: ${maxPoint?.label} at ${max}. Lowest: ${minPoint?.label} at ${min}. Average: ${average.toFixed(2)}.`;
      case 'pie':
        return `Pie chart showing ${data.length} segments. Total: ${total}. Largest segment: ${maxPoint?.label} at ${max} (${((max / total) * 100).toFixed(1)}%).`;
      case 'area':
        return `Area chart showing ${data.length} data points. Range from ${min} to ${max}. Total area: ${total}. Average: ${average.toFixed(2)}.`;
      default:
        return `Chart with ${data.length} data points. Range: ${min} to ${max}.`;
    }
  };

  return (
    <div 
      className={`${styles.chartContainer} ${className}`}
      role="img"
      aria-labelledby={chartId}
      aria-describedby={descriptionId}
    >
      <div className={styles.chartHeader}>
        <h3 id={chartId} className={styles.chartTitle}>
          {title}
        </h3>
        {ariaLabel && (
          <span className="sr-only" aria-label={ariaLabel}>
            {ariaLabel}
          </span>
        )}
      </div>

      <div className={styles.chartContent}>
        {children}
      </div>

      {/* Screen reader accessible description */}
      <div id={descriptionId} className={styles.chartDescription}>
        <p className={styles.chartSummary}>
          {description} {generateSummary()}
        </p>
        
        <details className={styles.chartDetails}>
          <summary className={styles.chartDetailsSummary}>
            View detailed data table
          </summary>
          
          <table 
            id={tableId}
            className={styles.chartTable}
            role="table"
            aria-label={`Data table for ${title}`}
          >
            <caption className="sr-only">
              Detailed data for {title}
            </caption>
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">Value</th>
                {data.some(point => point.color) && (
                  <th scope="col">Color</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((point, index) => (
                <tr key={index}>
                  <td>{point.label}</td>
                  <td>{point.value}</td>
                  {point.color && (
                    <td>
                      <span 
                        className={styles.colorIndicator}
                        style={{ backgroundColor: point.color }}
                        aria-label={`Color: ${point.color}`}
                      />
                      {point.color}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      {/* Keyboard navigation instructions */}
      <div className={styles.chartInstructions}>
        <p className="sr-only">
          Use Tab to navigate to the data table for detailed information. 
          Press Enter or Space to expand the table.
        </p>
      </div>
    </div>
  );
};

export default AccessibleChart;

