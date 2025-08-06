import React, { useState, useRef, useEffect } from 'react';
import styles from './AccessibleForm.module.css';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  autoComplete?: string;
  'aria-describedby'?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  required = false,
  disabled = false,
  placeholder,
  description,
  options = [],
  autoComplete,
  'aria-describedby': ariaDescribedBy,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  
  const fieldId = id;
  const errorId = `${fieldId}-error`;
  const successId = `${fieldId}-success`;
  const descriptionId = `${fieldId}-description`;
  
  const describedBy = [
    description ? descriptionId : '',
    error ? errorId : '',
    success ? successId : '',
    ariaDescribedBy || ''
  ].filter(Boolean).join(' ');

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      value,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      placeholder,
      autoComplete,
      'aria-invalid': error ? true : success ? false : undefined,
      'aria-describedby': describedBy || undefined,
      'aria-required': required,
      className: `${styles.input} ${error ? styles.inputError : ''} ${success ? styles.inputSuccess : ''}`
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLSelectElement>}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            ref={inputRef as React.RefObject<HTMLInputElement>}
          />
        );
    }
  };

  return (
    <div className={`${styles.formField} ${className} ${isFocused ? styles.focused : ''}`}>
      <label 
        htmlFor={fieldId} 
        className={`${styles.label} ${required ? styles.required : ''}`}
      >
        {label}
        {required && (
          <span className={styles.requiredIndicator} aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      )}
      
      <div className={styles.inputWrapper}>
        {renderInput()}
        
        {/* Status indicators for screen readers */}
        {error && (
          <div className={styles.statusIndicator} aria-hidden="true">
            <span className={styles.errorIcon}>⚠</span>
          </div>
        )}
        
        {success && (
          <div className={styles.statusIndicator} aria-hidden="true">
            <span className={styles.successIcon}>✓</span>
          </div>
        )}
      </div>
      
      {error && (
        <div 
          id={errorId} 
          className={styles.errorMessage}
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      
      {success && (
        <div 
          id={successId} 
          className={styles.successMessage}
          role="status"
          aria-live="polite"
        >
          {success}
        </div>
      )}
    </div>
  );
};

interface AccessibleFormProps {
  onSubmit: (data: Record<string, string>) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  noValidate?: boolean;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  onSubmit,
  children,
  title,
  description,
  submitLabel = 'Submit',
  isSubmitting = false,
  className = '',
  noValidate = true
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [hasErrors, setHasErrors] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    
    // Check for validation errors
    const form = e.currentTarget;
    const isValid = form.checkValidity();
    setHasErrors(!isValid);
    
    if (isValid) {
      onSubmit(data);
    } else {
      // Focus first invalid field
      const firstInvalidField = form.querySelector(':invalid') as HTMLElement;
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  };

  // Announce form submission status
  useEffect(() => {
    if (isSubmitting) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Form is being submitted, please wait.';
      document.body.appendChild(announcement);
      
      return () => {
        document.body.removeChild(announcement);
      };
    }
  }, [isSubmitting]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`${styles.form} ${className}`}
      noValidate={noValidate}
      aria-describedby={description ? 'form-description' : undefined}
    >
      {title && (
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>{title}</h2>
          {description && (
            <p id="form-description" className={styles.formDescription}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={styles.formContent}>
        {children}
      </div>
      
      {hasErrors && (
        <div 
          className={styles.formErrors}
          role="alert"
          aria-live="polite"
        >
          <p className={styles.errorSummary}>
            Please correct the errors below and try again.
          </p>
        </div>
      )}
      
      <div className={styles.formActions}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
          aria-describedby={isSubmitting ? 'submit-status' : undefined}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        
        {isSubmitting && (
          <div id="submit-status" className="sr-only" aria-live="polite">
            Form is being submitted. Please wait.
          </div>
        )}
      </div>
    </form>
  );
};

export default AccessibleForm;

