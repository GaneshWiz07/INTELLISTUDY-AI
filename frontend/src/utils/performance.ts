import React from 'react';

// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

// Custom performance entry interface removed - using built-in PerformanceEntry

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordResourceMetrics(entry as PerformanceResourceTiming);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordPaintMetrics(entry as PerformanceEntry & { type?: string; name: string });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.fetchStart,
      renderTime: entry.domContentLoadedEventEnd - entry.fetchStart,
      interactionTime: entry.domInteractive - entry.fetchStart,
    };

    this.metrics.set('navigation', metrics);
    this.reportMetrics('navigation', metrics);
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;

    // Track slow resources
    if (loadTime > 1000) {
      console.warn(`Slow resource detected: ${entry.name} (${loadTime}ms)`);
    }

    // Update metrics for resource type
    const existing = this.metrics.get(resourceType) || {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    };

    existing.loadTime = Math.max(existing.loadTime, loadTime);
    this.metrics.set(resourceType, existing);
  }

  private recordPaintMetrics(entry: PerformanceEntry & { type?: string; name: string }): void {
    const paintType = entry.name.replace('-paint', '');
    const existing = this.metrics.get('paint') || {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    };

    if (paintType === 'first-contentful') {
      existing.renderTime = entry.startTime;
    }

    this.metrics.set('paint', existing);
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private reportMetrics(type: string, metrics: PerformanceMetrics): void {
    // Send metrics to analytics service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: type,
        value: Math.round(metrics.loadTime),
        custom_map: {
          load_time: metrics.loadTime,
          render_time: metrics.renderTime,
          interaction_time: metrics.interactionTime,
        },
      });
    }

    // Log performance issues
    if (metrics.loadTime > 3000) {
      console.warn(`Performance issue detected in ${type}:`, metrics);
    }
  }

  public measureComponent(name: string, fn: () => void): void {
    const startTime = performance.now();
    
    fn();
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics: PerformanceMetrics = {
      loadTime: duration,
      renderTime: duration,
      interactionTime: 0,
    };

    this.metrics.set(`component-${name}`, metrics);

    if (duration > 16) { // More than one frame at 60fps
      console.warn(`Slow component render: ${name} (${duration}ms)`);
    }
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return fn().then((result) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics: PerformanceMetrics = {
        loadTime: duration,
        renderTime: 0,
        interactionTime: duration,
      };

      this.metrics.set(`async-${name}`, metrics);

      if (duration > 1000) {
        console.warn(`Slow async operation: ${name} (${duration}ms)`);
      }

      return result;
    });
  }

  public getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  public getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Image optimization utility
export function optimizeImageLoading(img: HTMLImageElement): void {
  // Add loading="lazy" for images below the fold
  if ('loading' in img) {
    const rect = img.getBoundingClientRect();
    const isAboveFold = rect.top < window.innerHeight;
    
    img.loading = isAboveFold ? 'eager' : 'lazy';
  }

  // Add proper sizing attributes
  if (!img.width && !img.height) {
    img.style.width = 'auto';
    img.style.height = 'auto';
  }
}

// Bundle size analyzer
export function analyzeBundleSize(): void {
  if (import.meta.env.DEV) {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(async (script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('localhost') || src.includes('127.0.0.1')) {
        try {
          const response = await fetch(src);
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          
          console.log(`Bundle: ${src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
        } catch (error) {
          console.warn('Could not analyze bundle size for:', src);
        }
      }
    });

    setTimeout(() => {
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
      
      if (totalSize > 500 * 1024) { // 500KB threshold
        console.warn('Bundle size is large. Consider code splitting.');
      }
    }, 1000);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    // const startTime = performance.now();
    
    return () => {
      // const endTime = performance.now();
      // const duration = endTime - startTime;
      
      performanceMonitor.measureComponent(componentName, () => {
        // Component cleanup time
      });
    };
  }, [componentName]);

  return {
    measureRender: (fn: () => void) => performanceMonitor.measureComponent(componentName, fn),
    measureAsync: <T>(fn: () => Promise<T>) => performanceMonitor.measureAsync(componentName, fn),
  };
}

// Global performance initialization
if (typeof window !== 'undefined') {
  // Initialize performance monitoring
  window.addEventListener('load', () => {
    analyzeBundleSize();
    
    // Report Core Web Vitals would go here if web-vitals package is installed
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}

export default performanceMonitor;