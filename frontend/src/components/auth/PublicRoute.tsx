import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#4a5568'
      }}>
        Loading...
      </div>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    const defaultRedirect = redirectTo || (user.role === 'admin' ? '/admin' : '/dashboard');
    return <Navigate to={defaultRedirect} replace />;
  }

  // User is not authenticated, show public content
  return <>{children}</>;
};

export default PublicRoute;

