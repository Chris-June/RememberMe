import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthProtectedProps {
  children: ReactNode;
  fallbackUrl?: string;
}

const AuthProtected = ({ children, fallbackUrl = '/sign-in' }: AuthProtectedProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, refreshUser } = useAuthStore();
  const [initialCheck, setInitialCheck] = useState(true);
  
  // Handle the initial authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we already have a user in the store
        if (user) {
          setInitialCheck(false);
          return;
        }

        // Otherwise, verify session directly with Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error checking authentication:", sessionError);
          setInitialCheck(false);
          return;
        }
        
        if (!sessionData.session) {
          console.log("No valid session found");
          setInitialCheck(false);
          return;
        }
        
        // We have a valid session, make sure our user state is updated
        await refreshUser();
        setInitialCheck(false);
      } catch (error) {
        console.error("Error in authentication check:", error);
        setInitialCheck(false);
      }
    };
    
    if (initialCheck) {
      checkAuth();
    }
  }, [initialCheck, user, refreshUser]);
  
  // Handle redirect if user is not authenticated
  useEffect(() => {
    if (!initialCheck && !isLoading && !user) {
      console.log("User not authenticated, redirecting to", fallbackUrl);
      navigate(fallbackUrl, { 
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [fallbackUrl, initialCheck, isLoading, location.pathname, navigate, user]);
  
  // While we're checking authentication or loading user data, show a loading state
  if (initialCheck || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-memorial-500 mx-auto mb-4" />
          <p className="text-neutral-600">Verifying your account...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }
  
  // Otherwise render a loading state while the redirect happens
  // This ensures we always return JSX and don't have render-phase navigation
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader size={40} className="animate-spin text-memorial-500 mx-auto mb-4" />
        <p className="text-neutral-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
};

export default AuthProtected;