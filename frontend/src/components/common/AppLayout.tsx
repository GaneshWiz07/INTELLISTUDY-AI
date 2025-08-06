import type { ReactNode } from 'react';
import Navigation from './Navigation';
import { AnimatedMeshBackground } from '../ui';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <AnimatedMeshBackground variant="dashboard" intensity="subtle" />
      <Navigation />
      <main className="w-full relative z-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

