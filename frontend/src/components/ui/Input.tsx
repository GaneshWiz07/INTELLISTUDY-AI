import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  showPasswordToggle = false,
  type = 'text',
  value,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);

  const hasValue = value && value.toString().length > 0;
  const isActive = focused || hasValue;

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
    setInputType(showPassword ? 'password' : 'text');
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
        
        {/* Input field with proper spacing to prevent overlap */}
        <input
          type={inputType}
          value={value}
          className={`
            peer w-full h-14 border-2 rounded-xl text-neutral-900 
            placeholder-transparent focus:outline-none transition-all duration-300 
            bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white
            ${icon ? 'pl-12 pr-4' : 'pl-4 pr-4'}
            ${showPasswordToggle ? 'pr-12' : ''}
            ${isActive ? 'pt-6 pb-2' : 'py-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }
          `}
          placeholder={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

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

        {/* Password toggle button with proper spacing */}
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md hover:bg-neutral-100"
            onClick={handlePasswordToggle}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
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

export default Input;