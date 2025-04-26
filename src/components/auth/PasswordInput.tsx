import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showPasswordStrength?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder = 'Enter your password',
  showPasswordStrength = false,
  required = true,
  className = '',
  disabled = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Function to measure password strength
  const getPasswordStrength = (password: string): { strength: number; message: string } => {
    if (!password) return { strength: 0, message: '' };

    let strength = 0;
    const messages: string[] = [];

    // Check length
    if (password.length >= 8) {
      strength += 1;
    } else {
      messages.push('At least 8 characters');
    }

    // Check for lowercase letters
    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      messages.push('At least one lowercase letter');
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      messages.push('At least one uppercase letter');
    }

    // Check for numbers
    if (/\d/.test(password)) {
      strength += 1;
    } else {
      messages.push('At least one number');
    }

    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(password)) {
      strength += 1;
    } else {
      messages.push('At least one special character');
    }

    // Generate appropriate message based on strength
    let message = '';
    if (strength === 0) message = 'Very weak';
    else if (strength <= 2) message = 'Weak password: ' + messages.join(', ');
    else if (strength <= 4) message = 'Medium strength';
    else message = 'Strong password';

    return { strength, message };
  };

  const { strength, message } = showPasswordStrength ? getPasswordStrength(value) : { strength: 0, message: '' };

  const strengthColor = () => {
    if (strength === 0) return 'bg-neutral-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const strengthPercentage = `${(strength / 5) * 100}%`;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-memorial-500 pr-10 ${className}`}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      
      {showPasswordStrength && value && (
        <div className="mt-2">
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColor()} transition-all duration-300`}
              style={{ width: strengthPercentage }}
            ></div>
          </div>
          <p className={`text-xs mt-1 ${strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;