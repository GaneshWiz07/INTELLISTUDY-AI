import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick
}) => {
  const baseClasses = 'rounded-xl p-6 transition-all duration-300';
  
  const variants = {
    default: 'bg-white shadow-md border border-neutral-200/50',
    gradient: 'bg-gradient-to-br from-primary-50/50 to-secondary-50/50 shadow-md border border-primary-200/30',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-md'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${clickableClasses} ${className}`;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={classes}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;