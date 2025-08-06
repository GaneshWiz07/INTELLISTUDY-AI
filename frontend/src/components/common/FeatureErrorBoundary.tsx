import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './FeatureErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  featureName: string;
  fallbackMessage?: string;
  showRetry?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`Error in ${this.props.featureName}:`, error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.featureError}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>
            {this.props.featureName} Unavailable
          </h3>
          <p className={styles.errorMessage}>
            {this.props.fallbackMessage || 
             `The ${this.props.featureName.toLowerCase()} feature is temporarily unavailable. Please try again later.`}
          </p>
          {this.props.showRetry !== false && (
            <button 
              onClick={this.handleRetry}
              className={styles.retryButton}
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;

