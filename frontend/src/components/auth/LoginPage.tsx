import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your learning journey"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;

