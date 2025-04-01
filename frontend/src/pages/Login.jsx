import { useAuth } from '../lib/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Github, Mail } from "lucide-react";
import { useEffect } from 'react';
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
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add message listener for auth events
    const handleMessage = async (event) => {
      // Verify the origin matches your API URL
      if (event.origin === import.meta.env.VITE_API_URL) {
        if (event.data.type === 'AUTH_SUCCESS') {
          await refreshUser();
          navigate('/dashboard');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, refreshUser]);

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
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('API URL is not defined in environment variables');
      return;
    }

    // Clear any existing GitHub OAuth state from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('github-oauth-state')) {
        localStorage.removeItem(key);
      }
    });

    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // Generate a new state
    const state = `github-oauth-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('github-oauth-state', state);
    
    const popup = window.open(
      `${apiUrl}/api/auth/github?state=${state}&prompt=consent`,
      'GitHub Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if popup is closed
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        localStorage.removeItem('github-oauth-state');
      }
    }, 1000);
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