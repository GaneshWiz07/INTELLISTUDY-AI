import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (event: KeyboardEvent) => void;
  onShiftTab?: (event: KeyboardEvent) => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const useKeyboardNavigation = (
  elementRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) => {
  const {
    onEscape,
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    trapFocus = false,
    autoFocus = false,
    disabled = false
  } = options;

  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!elementRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(
      elementRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, [elementRef]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const { key, shiftKey, ctrlKey, altKey, metaKey } = event;

    // Don't handle if modifier keys are pressed (except Shift for Tab)
    if ((ctrlKey || altKey || metaKey) && key !== 'Tab') return;

    switch (key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;

      case ' ':
      case 'Space':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;

      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;

      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;

      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;

      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;

      case 'Tab':
        if (trapFocus) {
          const focusableElements = getFocusableElements();
          focusableElementsRef.current = focusableElements;

          if (focusableElements.length === 0) {
            event.preventDefault();
            return;
          }

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const activeElement = document.activeElement as HTMLElement;

          if (shiftKey) {
            // Shift + Tab (backward)
            if (activeElement === firstElement || !focusableElements.includes(activeElement)) {
              event.preventDefault();
              lastElement.focus();
            }
            if (onShiftTab) {
              onShiftTab(event);
            }
          } else {
            // Tab (forward)
            if (activeElement === lastElement || !focusableElements.includes(activeElement)) {
              event.preventDefault();
              firstElement.focus();
            }
            if (onTab) {
              onTab(event);
            }
          }
        } else {
          if (shiftKey && onShiftTab) {
            onShiftTab(event);
          } else if (!shiftKey && onTab) {
            onTab(event);
          }
        }
        break;
    }
  }, [
    disabled,
    onEscape,
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    trapFocus,
    getFocusableElements
  ]);

  // Focus management
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeElement);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    } else {
      focusableElements[0]?.focus();
    }
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    } else {
      focusableElements[focusableElements.length - 1]?.focus();
    }
  }, [getFocusableElements]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementRef, handleKeyDown, disabled]);

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const element = elementRef.current;
      if (element) {
        // Focus the container or first focusable element
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else if (element.tabIndex >= 0) {
          element.focus();
        }
      }
    }
  }, [autoFocus, disabled, elementRef, getFocusableElements]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements
  };
};

// Hook for managing focus trap in modals, dropdowns, etc.
export const useFocusTrap = (
  elementRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) => {
  return useKeyboardNavigation(elementRef, {
    trapFocus: isActive,
    autoFocus: isActive,
    disabled: !isActive
  });
};

// Hook for arrow key navigation in lists, grids, etc.
export const useArrowNavigation = (
  elementRef: React.RefObject<HTMLElement>,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    disabled?: boolean;
  } = {}
) => {
  const { orientation = 'vertical', disabled = false } = options;

  const navigation = useKeyboardNavigation(elementRef, {
    onArrowUp: orientation === 'vertical' || orientation === 'both' 
      ? () => navigation.focusPrevious() 
      : undefined,
    onArrowDown: orientation === 'vertical' || orientation === 'both' 
      ? () => navigation.focusNext() 
      : undefined,
    onArrowLeft: orientation === 'horizontal' || orientation === 'both' 
      ? () => navigation.focusPrevious() 
      : undefined,
    onArrowRight: orientation === 'horizontal' || orientation === 'both' 
      ? () => navigation.focusNext() 
      : undefined,
    disabled
  });

  return navigation;
};

export default useKeyboardNavigation;