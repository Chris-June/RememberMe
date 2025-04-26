import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import PasswordInput from './PasswordInput';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { updatePassword, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    const result = await updatePassword(formData);
    
    if (result.success) {
      setSubmitted(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
        variant: "success",
      });
    } else {
      toast({
        title: "Failed to update password",
        description: result.error || "There was a problem updating your password.",
        variant: "destructive",
      });
    }
  };
  
  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-memorial-800 mb-4">Password Updated</h2>
        <p className="text-neutral-600 mb-8">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <button
          onClick={() => navigate('/sign-in')}
          className="btn-primary"
        >
          Go to Sign In
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-memorial-800 mb-2">Create New Password</h2>
        <p className="text-neutral-600">Enter a new password for your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            New Password
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
            Confirm New Password
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
              Updating password...
            </span>
          ) : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;