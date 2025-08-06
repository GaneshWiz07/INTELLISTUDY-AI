import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { AnimatedMeshBackground } from '../ui';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative">
      <AnimatedMeshBackground variant="auth" intensity="medium" />

      {/* Centered container */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main card */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-primary-500" />
              </motion.div>
              
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                NeuroAdaptive Learning
              </motion.h1>
              
              <motion.h2 
                className="text-xl font-semibold text-neutral-900 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {title}
              </motion.h2>
              
              {subtitle && (
                <motion.p 
                  className="text-neutral-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-6 text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>&copy; 2025 NeuroAdaptive Learning AI. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;

