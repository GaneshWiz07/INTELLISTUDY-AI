import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  icon,
  disabled = false,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isActive = focused || hasValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {/* Icon positioned with proper spacing */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* Select field with consistent styling to Input component */}
        <select
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full h-14 border-2 rounded-xl text-neutral-900 
            bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white
            focus:outline-none transition-all duration-300 appearance-none cursor-pointer
            ${icon ? 'pl-12 pr-12' : 'pl-4 pr-12'}
            ${isActive ? 'pt-6 pb-2' : 'py-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Floating label with proper positioning to avoid icon overlap */}
        <motion.label
          className={`
            absolute transition-all duration-300 pointer-events-none select-none
            ${icon ? 'left-12' : 'left-4'}
            ${error 
              ? 'text-red-500' 
              : isActive 
                ? 'text-primary-600' 
                : 'text-neutral-500'
            }
          `}
          animate={{
            top: isActive ? '8px' : '50%',
            y: isActive ? 0 : '-50%',
            fontSize: isActive ? '12px' : '16px',
            fontWeight: isActive ? 500 : 400,
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {label}
        </motion.label>

        {/* Chevron icon with proper spacing */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-500 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default Select;