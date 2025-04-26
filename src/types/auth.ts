import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  username?: string;
}

export interface SignInCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  password: string;
  confirmPassword: string;
}