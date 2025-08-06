// Accessibility testing and validation utilities

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element: Element;
  message: string;
  rule: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

interface AccessibilityReport {
  issues: AccessibilityIssue[];
  score: number;
  totalElements: number;
  passedRules: string[];
  failedRules: string[];
}

class AccessibilityValidator {
  private rules: Map<string, (element: Element) => AccessibilityIssue[]> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Rule: Images must have alt text
    this.rules.set('img-alt', (element) => {
      const issues: AccessibilityIssue[] = [];
      const images = element.querySelectorAll('img');
      
      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        const ariaLabel = img.getAttribute('aria-label');
        const ariaLabelledBy = img.getAttribute('aria-labelledby');
        
        if (!alt && !ariaLabel && !ariaLabelledBy) {
          issues.push({
            type: 'error',
            element: img,
            message: 'Image missing alternative text',
            rule: 'img-alt',
            impact: 'serious',
          });
        }
      });
      
      return issues;
    });

    // Rule: Form inputs must have labels
    this.rules.set('label-required', (element) => {
      const issues: AccessibilityIssue[] = [];
      const inputs = element.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const type = input.getAttribute('type');
        
        // Skip hidden inputs
        if (type === 'hidden') return;
        
        let hasLabel = false;
        
        if (id) {
          const label = element.querySelector(`label[for="${id}"]`);
          hasLabel = !!label;
        }
        
        if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
          // Check if input is wrapped in a label
          const parentLabel = input.closest('label');
          hasLabel = !!parentLabel;
        }
        
        if (!hasLabel) {
          issues.push({
            type: 'error',
            element: input,
            message: 'Form input missing label',
            rule: 'label-required',
            impact: 'critical',
          });
        }
      });
      
      return issues;
    });

    // Rule: Buttons must have accessible text
    this.rules.set('button-text', (element) => {
      const issues: AccessibilityIssue[] = [];
      const buttons = element.querySelectorAll('button, input[type="button"], input[type="submit"]');
      
      buttons.forEach((button) => {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');
        const value = button.getAttribute('value');
        
        if (!text && !ariaLabel && !ariaLabelledBy && !value) {
          issues.push({
            type: 'error',
            element: button,
            message: 'Button missing accessible text',
            rule: 'button-text',
            impact: 'serious',
          });
        }
      });
      
      return issues;
    });

    // Rule: Headings must be in proper order
    this.rules.set('heading-order', (element) => {
      const issues: AccessibilityIssue[] = [];
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      let previousLevel = 0;
      
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (level > previousLevel + 1) {
          issues.push({
            type: 'warning',
            element: heading,
            message: `Heading level ${level} skips level ${previousLevel + 1}`,
            rule: 'heading-order',
            impact: 'moderate',
          });
        }
        
        previousLevel = level;
      });
      
      return issues;
    });

    // Rule: Links must have meaningful text
    this.rules.set('link-text', (element) => {
      const issues: AccessibilityIssue[] = [];
      const links = element.querySelectorAll('a[href]');
      
      links.forEach((link) => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const ariaLabelledBy = link.getAttribute('aria-labelledby');
        
        const accessibleText = text || ariaLabel || ariaLabelledBy;
        
        if (!accessibleText) {
          issues.push({
            type: 'error',
            element: link,
            message: 'Link missing accessible text',
            rule: 'link-text',
            impact: 'serious',
          });
        } else if (['click here', 'read more', 'more', 'here'].includes(accessibleText.toLowerCase())) {
          issues.push({
            type: 'warning',
            element: link,
            message: 'Link text is not descriptive',
            rule: 'link-text',
            impact: 'moderate',
          });
        }
      });
      
      return issues;
    });

    // Rule: Color contrast
    this.rules.set('color-contrast', (element) => {
      const issues: AccessibilityIssue[] = [];
      const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label');
      
      textElements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple check - if colors are the same, it's definitely a problem
        if (color === backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
          issues.push({
            type: 'error',
            element: el,
            message: 'Insufficient color contrast',
            rule: 'color-contrast',
            impact: 'serious',
          });
        }
      });
      
      return issues;
    });

    // Rule: Focus indicators
    this.rules.set('focus-visible', (element) => {
      const issues: AccessibilityIssue[] = [];
      const focusableElements = element.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((el) => {
        const styles = window.getComputedStyle(el, ':focus');
        const outline = styles.outline;
        const outlineWidth = styles.outlineWidth;
        const boxShadow = styles.boxShadow;
        
        // Check if element has visible focus indicator
        const hasFocusIndicator = 
          (outline && outline !== 'none' && outlineWidth !== '0px') ||
          (boxShadow && boxShadow !== 'none');
        
        if (!hasFocusIndicator) {
          issues.push({
            type: 'warning',
            element: el,
            message: 'Element may lack visible focus indicator',
            rule: 'focus-visible',
            impact: 'moderate',
          });
        }
      });
      
      return issues;
    });

    // Rule: ARIA attributes
    this.rules.set('aria-valid', (element) => {
      const issues: AccessibilityIssue[] = [];
      const elementsWithAria = element.querySelectorAll('[aria-labelledby], [aria-describedby]');
      
      elementsWithAria.forEach((el) => {
        const labelledBy = el.getAttribute('aria-labelledby');
        const describedBy = el.getAttribute('aria-describedby');
        
        if (labelledBy) {
          const labelIds = labelledBy.split(' ');
          labelIds.forEach((id) => {
            if (!element.querySelector(`#${id}`)) {
              issues.push({
                type: 'error',
                element: el,
                message: `aria-labelledby references non-existent element: ${id}`,
                rule: 'aria-valid',
                impact: 'serious',
              });
            }
          });
        }
        
        if (describedBy) {
          const descIds = describedBy.split(' ');
          descIds.forEach((id) => {
            if (!element.querySelector(`#${id}`)) {
              issues.push({
                type: 'error',
                element: el,
                message: `aria-describedby references non-existent element: ${id}`,
                rule: 'aria-valid',
                impact: 'serious',
              });
            }
          });
        }
      });
      
      return issues;
    });
  }

  public validate(element: Element = document.body): AccessibilityReport {
    const allIssues: AccessibilityIssue[] = [];
    const passedRules: string[] = [];
    const failedRules: string[] = [];
    
    this.rules.forEach((rule, ruleName) => {
      const issues = rule(element);
      
      if (issues.length > 0) {
        allIssues.push(...issues);
        failedRules.push(ruleName);
      } else {
        passedRules.push(ruleName);
      }
    });
    
    const totalElements = element.querySelectorAll('*').length;
    const score = Math.max(0, 100 - (allIssues.length * 10));
    
    return {
      issues: allIssues,
      score,
      totalElements,
      passedRules,
      failedRules,
    };
  }

  public validateLive(): void {
    if (import.meta.env.DEV) {
      const report = this.validate();
      
      if (report.issues.length > 0) {
        console.group('🔍 Accessibility Issues Found');
        
        report.issues.forEach((issue) => {
          const logMethod = issue.type === 'error' ? console.error : 
                           issue.type === 'warning' ? console.warn : console.info;
          
          logMethod(`${issue.impact.toUpperCase()}: ${issue.message}`, issue.element);
        });
        
        console.groupEnd();
        console.log(`Accessibility Score: ${report.score}/100`);
      } else {
        console.log('✅ No accessibility issues found');
      }
    }
  }
}

// Keyboard navigation utilities
export class KeyboardNavigationHelper {
  private focusableElements: Element[] = [];
  private currentIndex = -1;

  constructor(container: Element) {
    this.updateFocusableElements(container);
  }

  private updateFocusableElements(container: Element): void {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(container.querySelectorAll(selector))
      .filter((el) => {
        const styles = window.getComputedStyle(el);
        return styles.display !== 'none' && styles.visibility !== 'hidden';
      });
  }

  public focusNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusCurrent();
  }

  public focusPrevious(): void {
    this.currentIndex = this.currentIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1;
    this.focusCurrent();
  }

  public focusFirst(): void {
    this.currentIndex = 0;
    this.focusCurrent();
  }

  public focusLast(): void {
    this.currentIndex = this.focusableElements.length - 1;
    this.focusCurrent();
  }

  private focusCurrent(): void {
    const element = this.focusableElements[this.currentIndex];
    if (element && 'focus' in element) {
      (element as HTMLElement).focus();
    }
  }
}

// Screen reader utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management utilities
export function trapFocus(container: Element): () => void {
  const focusableElements = container.querySelectorAll(
    'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    if (keyboardEvent.key === 'Tab') {
      if (keyboardEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          keyboardEvent.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          keyboardEvent.preventDefault();
          firstElement.focus();
        }
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Create singleton instance
export const accessibilityValidator = new AccessibilityValidator();

import React from 'react';

// React hook for accessibility validation
export function useAccessibilityValidator(ref: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (ref.current && import.meta.env.DEV) {
      const report = accessibilityValidator.validate(ref.current);
      
      if (report.issues.length > 0) {
        console.warn(`Accessibility issues in component:`, report.issues);
      }
    }
  }, [ref]);
}

// Initialize accessibility monitoring in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Run accessibility check after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      accessibilityValidator.validateLive();
    }, 1000);
  });
  
  // Monitor for dynamic content changes
  const observer = new MutationObserver(() => {
    setTimeout(() => {
      accessibilityValidator.validateLive();
    }, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export default accessibilityValidator;