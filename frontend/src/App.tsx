// React import not needed with new JSX transform
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import { 
  LoginPage, 
  RegisterPage, 
  ProtectedRoute, 
  PublicRoute 
} from './components/auth';
import { AppLayout } from './components/common';
import { AdminDashboard } from './components/admin';
import { StudentDashboard } from './components/dashboard';
import { LearningInterface } from './components/learning';
import { UserProfile } from './components/profile';
import { ReportingDashboard } from './components/reporting';
import { AuthProvider } from './contexts/AuthContext';
import { EngagementProvider } from './contexts/EngagementContext';
import { LearningSessionProvider } from './contexts/LearningSessionContext';

function App() {
  return (
    <AuthProvider>
      <EngagementProvider>
        <LearningSessionProvider>
          <Router>
            <div className="app">
        <Routes>
          {/* Public Routes - redirect authenticated users */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Student Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning" 
            element={
              <ProtectedRoute requiredRole="student">
                <AppLayout>
                  <LearningInterface />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UserProfile />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportingDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />

          {/* Default Route - redirect based on authentication */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
            </div>
          </Router>
        </LearningSessionProvider>
      </EngagementProvider>
    </AuthProvider>
  );
}

export default App;

