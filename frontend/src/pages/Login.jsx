import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';
import { Github, Mail } from "lucide-react";
import { 
  CustomCard, 
  CustomCardHeader, 
  CustomCardTitle, 
  CustomCardDescription, 
  CustomCardContent,
  CustomButton,
  LoadingSpinner,
  CustomAlert
} from '../components/custom-components';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('API URL is not defined in environment variables');
      return;
    }

    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(
      `${apiUrl}/api/auth/google`,
      'Google Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if popup is closed
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
      }
    }, 1000);
  };

  const handleGithubLogin = () => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    window.open(
      `${import.meta.env.VITE_API_URL}/api/auth/github`,
      'GitHub Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <CustomCard className="w-full max-w-md">
        <CustomCardHeader>
          <CustomCardTitle className="text-center">Welcome back</CustomCardTitle>
          <CustomCardDescription className="text-center">
            Choose your preferred login method
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent className="space-y-4">
          <CustomAlert
            variant="info"
            title="Secure Login"
            description="Your data is protected with industry-standard encryption."
          />
          
          <CustomButton
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <Mail className="mr-2 h-4 w-4" />
            Login with Google
          </CustomButton>
          
          <CustomButton
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
          >
            <Github className="mr-2 h-4 w-4" />
            Login with GitHub
          </CustomButton>
        </CustomCardContent>
      </CustomCard>
    </div>
  );
};

export default Login;