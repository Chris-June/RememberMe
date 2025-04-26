import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, User, Lock, Loader, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import PasswordInput from './PasswordInput';
import { supabase } from '../../lib/supabase';

const SignUpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuthStore();
  
  // Local loading state for the sign-up form specifically
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset username availability when username changes
    if (name === 'username') {
      setUsernameAvailable(null);
    }
  };
  
  const checkUsername = async () => {
    if (formData.username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      // Fix: Use count instead of select to avoid row parsing issues
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', formData.username);
        
      // Username is available if count is 0 (no matches) and there's no error
      setUsernameAvailable(count === 0 && !error);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple form submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (formData.username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const result = await signUp(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
        variant: "success",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Sign up failed",
        description: result.error || "Please try again with different credentials.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-memorial-800 mb-2">Create an Account</h2>
        <p className="text-neutral-600">Join Remembering Me to create and preserve memories</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <AtSign size={18} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <User size={18} />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={checkUsername}
              placeholder="Choose a unique username"
              className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
              required
              minLength={3}
            />
            {formData.username.length >= 3 && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                {checkingUsername ? (
                  <Loader size={18} className="animate-spin text-neutral-400" />
                ) : usernameAvailable === true ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : usernameAvailable === false ? (
                  <span className="text-xs text-red-500">Not available</span>
                ) : null}
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Must be at least 3 characters long</p>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <Lock size={18} />
            </div>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              showPasswordStrength={true}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              <Lock size={18} />
            </div>
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || (formData.username.length >= 3 && usernameAvailable === false)}
          className={`w-full py-2.5 rounded-md font-medium text-white transition-colors ${
            isSubmitting || (formData.username.length >= 3 && usernameAvailable === false)
              ? 'bg-memorial-400 cursor-not-allowed'
              : 'bg-memorial-600 hover:bg-memorial-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader size={20} className="animate-spin mr-2" />
              Creating account...
            </span>
          ) : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-neutral-600">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-memorial-600 hover:text-memorial-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;