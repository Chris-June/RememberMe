import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AtSign, User, Lock, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import PasswordInput from './PasswordInput';
import { supabase } from '../../lib/supabase';

const SignInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    identifier: '', // can be email or username
    password: '',
  });

  // Check for invite code in URL or session storage
  useEffect(() => {
    const state = location.state as any;
    
    if (state?.isInvite && state?.inviteCode) {
      toast({
        title: "Memorial Invitation",
        description: "Sign in to join the memorial you were invited to.",
        variant: "success",
      });
    } else {
      // Check session storage for pending invites
      const pendingInvite = sessionStorage.getItem('pendingInvite');
      if (pendingInvite) {
        toast({
          title: "Memorial Invitation",
          description: "Sign in to join the memorial you were invited to.",
          variant: "success",
        });
      }
    }
  }, [location.state, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear any previous error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form has input
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setAuthError("Please enter both email/username and password");
      return;
    }
    
    // Prevent multiple form submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      let email = formData.identifier;
      
      // If identifier is not an email, try to get the email from the username
      if (!email.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email)
          .maybeSingle();
        
        if (userError) {
          setAuthError(`Error looking up username. Please try using your email address instead.`);
          setIsSubmitting(false);
          return;
        }
        
        if (!userData) {
          setAuthError("We couldn't find an account with that username. Please check your spelling or use your email address instead.");
          setIsSubmitting(false);
          return;
        }
        
        if (!userData.email) {
          setAuthError("This username exists but has no email associated with it. Please sign in with your email address.");
          setIsSubmitting(false);
          return;
        }
        
        email = userData.email;
      }
      
      // Sign out first to ensure we have a clean session
      await supabase.auth.signOut();
      
      // Sign in directly with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setAuthError("Incorrect email/username or password. Please try again.");
        } else {
          setAuthError(error.message);
        }
        
        toast({
          title: "Sign in failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        
        setIsSubmitting(false);
        return;
      }
      
      if (!data || !data.user) {
        setAuthError("Authentication failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully signed in.",
        variant: "success",
      });
      
      // Check if there's a pending invite in session storage
      const pendingInvite = sessionStorage.getItem('pendingInvite');
      const state = location.state as any;
      
      if (pendingInvite) {
        // Navigate to join memorial page
        navigate(`/memorial/join/${pendingInvite}`, { replace: true });
      } else if (state?.isInvite && state?.inviteCode) {
        // Navigate to join memorial page
        navigate(`/memorial/join/${state.inviteCode}`, { replace: true });
      } else {
        // Navigate to intended destination or dashboard
        const from = state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      setAuthError("An unexpected error occurred. Please try again later.");
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-memorial-800 mb-2">Sign In</h2>
        <p className="text-neutral-600">Welcome back to Remembering Me</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {authError}
          </div>
        )}
        
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700 mb-1">
            Email or Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              {formData.identifier.includes('@') ? <AtSign size={18} /> : <User size={18} />}
            </div>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or username"
              className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-memorial-600 hover:text-memorial-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <Lock size={18} />
            </div>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              required={true}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-md font-medium text-white transition-colors ${
            isSubmitting 
              ? 'bg-memorial-400 cursor-not-allowed'
              : 'bg-memorial-600 hover:bg-memorial-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader size={20} className="animate-spin mr-2" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-neutral-600">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-memorial-600 hover:text-memorial-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;