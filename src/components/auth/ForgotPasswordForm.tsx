import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

const ForgotPasswordForm = () => {
  const { resetPassword, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await resetPassword({ email });
    
    if (result.success) {
      setSubmitted(true);
      toast({
        title: "Password reset link sent",
        description: "Please check your email for instructions to reset your password.",
        variant: "success",
      });
    } else {
      toast({
        title: "Failed to send reset link",
        description: result.error || "There was a problem sending the password reset link.",
        variant: "destructive",
      });
    }
  };
  
  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-memorial-800 mb-4">Check Your Email</h2>
        <p className="text-neutral-600 mb-6">
          We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
        </p>
        <p className="text-neutral-600 mb-8">
          Didn't receive the email? Check your spam folder or try again in a few minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setSubmitted(false)}
            className="btn-secondary"
          >
            Try Again
          </button>
          <Link to="/sign-in" className="btn-primary">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-memorial-800 mb-2">Reset Your Password</h2>
        <p className="text-neutral-600">Enter your email address to receive a password reset link</p>
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
              value={email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 rounded-md font-medium text-white transition-colors ${
            isLoading 
              ? 'bg-memorial-400 cursor-not-allowed'
              : 'bg-memorial-600 hover:bg-memorial-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader size={20} className="animate-spin mr-2" />
              Sending reset link...
            </span>
          ) : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <Link to="/sign-in" className="text-memorial-600 hover:text-memorial-700 inline-flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;