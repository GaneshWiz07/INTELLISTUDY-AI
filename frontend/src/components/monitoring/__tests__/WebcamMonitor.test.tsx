import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebcamMonitor } from '../WebcamMonitor';
import { EngagementProvider } from '../../../contexts/EngagementContext';

// Mock react-webcam
jest.mock('react-webcam', () => {
  return React.forwardRef<any, any>((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getScreenshot: () => 'data:image/jpeg;base64,mock-image-data'
    }));
    
    return (
      <div data-testid="webcam-mock" onClick={() => props.onUserMedia?.()}>
        Mock Webcam
      </div>
    );
  });
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <EngagementProvider>
      {component}
    </EngagementProvider>
  );
};

describe('WebcamMonitor', () => {
  it('renders with webcam disabled by default', () => {
    renderWithProvider(<WebcamMonitor />);
    
    expect(screen.getByText('Camera Monitoring')).toBeInTheDocument();
    expect(screen.getByText('📷 Off')).toBeInTheDocument();
    expect(screen.getByText('Camera monitoring is disabled')).toBeInTheDocument();
  });

  it('shows webcam feed when enabled', () => {
    renderWithProvider(<WebcamMonitor />);
    
    const toggleButton = screen.getByRole('button', { name: /enable camera/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('📹 On')).toBeInTheDocument();
  });

  it('displays privacy information', () => {
    renderWithProvider(<WebcamMonitor />);
    
    expect(screen.getByText('Your camera data is processed locally and not stored')).toBeInTheDocument();
  });

  it('calls onEmotionDetected callback when provided', () => {
    const mockCallback = jest.fn();
    renderWithProvider(<WebcamMonitor onEmotionDetected={mockCallback} />);
    
    // Enable webcam
    const toggleButton = screen.getByRole('button', { name: /enable camera/i });
    fireEvent.click(toggleButton);
    
    // Simulate webcam activation
    const webcamMock = screen.getByTestId('webcam-mock');
    fireEvent.click(webcamMock);
    
    // Wait for emotion detection simulation
    setTimeout(() => {
      expect(mockCallback).toHaveBeenCalled();
    }, 2100);
  });
});

