import AuthLayout from './AuthLayout';
import RegisterForm from './RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join our adaptive learning platform"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;

