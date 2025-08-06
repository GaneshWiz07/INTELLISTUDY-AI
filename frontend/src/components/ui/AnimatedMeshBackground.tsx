import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedMeshBackgroundProps {
  className?: string;
  variant?: 'primary' | 'auth' | 'learning' | 'dashboard';
  intensity?: 'subtle' | 'medium' | 'vibrant';
  engagementLevel?: 'low' | 'medium' | 'high';
  emotionState?: string;
}

const AnimatedMeshBackground: React.FC<AnimatedMeshBackgroundProps> = ({ 
  className = '', 
  variant = 'primary',
  intensity = 'medium',
  engagementLevel = 'medium',
  emotionState = 'focused'
}) => {
  const meshRef = useRef<HTMLDivElement>(null);

  // Color schemes for different variants
  const colorSchemes = {
    primary: {
      base: 'from-neutral-50 via-primary-50/30 to-secondary-50/20',
      orbs: [
        'from-primary-400/20 to-secondary-400/20',
        'from-accent-400/15 to-primary-400/15',
        'from-secondary-400/20 to-accent-400/20',
        'from-primary-300/10 to-secondary-300/10',
        'from-accent-300/15 to-primary-300/15'
      ]
    },
    auth: {
      base: 'from-primary-50 via-white to-secondary-50',
      orbs: [
        'from-primary-500/20 to-secondary-500/20',
        'from-accent-500/15 to-primary-500/15',
        'from-secondary-500/20 to-accent-500/20',
        'from-primary-400/12 to-secondary-400/12'
      ]
    },
    learning: {
      base: 'from-blue-50 via-indigo-50/60 to-purple-50/40',
      orbs: [
        'from-blue-400/30 to-indigo-400/30',
        'from-purple-400/25 to-blue-400/25',
        'from-indigo-400/30 to-purple-400/30',
        'from-cyan-400/20 to-blue-400/20'
      ]
    },
    dashboard: {
      base: 'from-neutral-50 to-primary-50/30',
      orbs: [
        'from-primary-400/25 to-secondary-400/25',
        'from-accent-400/20 to-primary-400/20',
        'from-secondary-400/25 to-accent-400/25',
        'from-emerald-400/20 to-primary-400/20',
        'from-orange-400/15 to-secondary-400/15'
      ]
    }
  };

  const intensitySettings = {
    subtle: { scale: 0.9, opacity: 0.8, blur: 'blur-3xl' },
    medium: { scale: 1.1, opacity: 1, blur: 'blur-2xl' },
    vibrant: { scale: 1.3, opacity: 1.2, blur: 'blur-xl' }
  };

  const scheme = colorSchemes[variant];
  const settings = intensitySettings[intensity];

  // Dynamic adjustments based on engagement and emotion
  const getEngagementMultiplier = () => {
    switch (engagementLevel) {
      case 'high': return 1.3;
      case 'medium': return 1.0;
      case 'low': return 0.7;
      default: return 1.0;
    }
  };

  const getEmotionColorAdjustment = () => {
    switch (emotionState) {
      case 'focused': return 'hue-rotate-0';
      case 'engaged': return 'hue-rotate-15';
      case 'confused': return 'hue-rotate-45';
      case 'bored': return 'hue-rotate-180 saturate-50';
      case 'frustrated': return 'hue-rotate-300';
      default: return 'hue-rotate-0';
    }
  };

  const engagementMultiplier = getEngagementMultiplier();
  const emotionFilter = getEmotionColorAdjustment();

  // Animation variants for floating orbs (responsive to engagement)
  const orbVariants = {
    animate: (i: number) => ({
      x: [0, 100 * engagementMultiplier, -50 * engagementMultiplier, 0],
      y: [0, -80 * engagementMultiplier, 60 * engagementMultiplier, 0],
      scale: [1, 1.1 * engagementMultiplier, 0.9, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: (20 + i * 5) / engagementMultiplier,
        repeat: Infinity,
        ease: "linear",
        delay: i * 2
      }
    })
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`} ref={meshRef}>
      {/* Base gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.base}`} />
      
      {/* Animated mesh orbs */}
      <div className={`absolute inset-0 ${emotionFilter}`}>
        {scheme.orbs.map((orbGradient, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full ${settings.blur}`}
            style={{
              width: `${(300 + index * 50) * engagementMultiplier}px`,
              height: `${(300 + index * 50) * engagementMultiplier}px`,
              left: `${10 + index * 15}%`,
              top: `${5 + index * 12}%`,
              opacity: settings.opacity * engagementMultiplier,
              transform: `scale(${settings.scale})`
            }}
            variants={orbVariants}
            animate="animate"
            custom={index}
          >
            <div className={`w-full h-full bg-gradient-to-br ${orbGradient} rounded-full`} />
          </motion.div>
        ))}
      </div>

      {/* Neural network inspired connecting lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-30" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Animated connecting lines */}
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${10 + i * 12}%`}
            y1={`${20 + i * 8}%`}
            x2={`${30 + i * 15}%`}
            y2={`${40 + i * 10}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.6, 0] 
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>

      {/* Pulsing central focus point */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        variants={pulseVariants}
        animate="animate"
      >
        <div className="w-96 h-96 bg-gradient-to-r from-primary-400/20 via-secondary-400/25 to-accent-400/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Floating particles for neural network effect */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedMeshBackground;