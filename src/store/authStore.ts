import { create } from 'zustand';
import { AuthState, SignInCredentials, SignUpCredentials, PasswordResetRequest, PasswordUpdateRequest } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthStore extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (data: PasswordResetRequest) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (data: PasswordUpdateRequest) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  refreshUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error during refresh:", sessionError);
        set({ user: null, isLoading: false, error: null }); // Clear error to prevent showing to user
        return;
      }
      
      if (!sessionData || !sessionData.session) {
        console.log("No active session found during refresh");
        set({ user: null, isLoading: false, error: null });
        return;
      }
      
      // Get the user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user data:", userError);
        // If we have a session but can't get user data, we might have a corrupted session
        if (userError.message.includes('JWT')) {
          console.log("JWT error detected - clearing session");
          await supabase.auth.signOut();
        }
        set({ user: null, isLoading: false, error: null });
        return;
      }
      
      if (!userData || !userData.user) {
        console.error("No user data returned");
        set({ user: null, isLoading: false, error: null });
        return;
      }
      
      const user = userData.user;
      
      // Get additional user data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      console.log("User refreshed successfully:", {
        id: user.id,
        email: user.email,
        username: profileData?.username || user.user_metadata?.username
      });
      
      set({ 
        user: { 
          ...user, 
          username: profileData?.username || user.user_metadata?.username 
        },
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error("Error in refreshUser:", error);
      // Clear user state when there's an error
      set({ 
        user: null, 
        isLoading: false, 
        error: null // Don't show technical errors to users
      });
    }
  },

  signIn: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      
      let email = credentials.email || '';
      
      // Handle username sign-in
      if (credentials.username && !credentials.email) {
        console.log("Looking up email for username:", credentials.username);
        
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', credentials.username)
          .maybeSingle();
          
        if (userError) {
          console.error("Error fetching user by username:", userError);
          set({ isLoading: false, error: 'Username not found' });
          return { success: false, error: 'Username not found' };
        }
        
        if (!userData?.email) {
          console.error("No email found for username:", credentials.username);
          set({ isLoading: false, error: 'Username not found' });
          return { success: false, error: 'Username not found' };
        }
        
        email = userData.email;
      }
      
      if (!email) {
        set({ isLoading: false, error: 'Email or username is required' });
        return { success: false, error: 'Email or username is required' };
      }
      
      // Clear any existing session to prevent conflicts
      await supabase.auth.signOut();
      
      // Sign in with password
      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      if (!data || !data.user) {
        console.error("No user returned from signInWithPassword");
        set({ isLoading: false, error: 'Authentication failed' });
        return { success: false, error: 'Authentication failed' };
      }
      
      console.log("Sign in successful for:", data.user.email);
      
      // Refresh user state with profile data
      await get().refreshUser();
      
      return { success: true };
    } catch (error) {
      console.error("Unexpected error in signIn:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signUp: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      
      if (credentials.password !== credentials.confirmPassword) {
        set({ isLoading: false, error: 'Passwords do not match' });
        return { success: false, error: 'Passwords do not match' };
      }
      
      // Check if username already exists
      const { count, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', credentials.username);
      
      if (usernameCheckError) {
        console.error("Error checking username:", usernameCheckError);
      }

      if (count && count > 0) {
        set({ isLoading: false, error: 'Username already taken' });
        return { success: false, error: 'Username already taken' };
      }
      
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      if (!data || !data.user) {
        set({ isLoading: false, error: 'Sign up failed' });
        return { success: false, error: 'Sign up failed' };
      }
      
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            email: credentials.email,
            username: credentials.username 
          }
        ]);
        
      if (profileError) {
        console.error("Profile creation error:", profileError);
        set({ isLoading: false, error: profileError.message });
        return { success: false, error: profileError.message };
      }
      
      // Refresh user data
      await get().refreshUser();
      
      return { success: true };
    } catch (error) {
      console.error("Error in signUp:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        set({ isLoading: false, error: error.message });
        return;
      }
      
      set({ user: null, isLoading: false, error: null });
    } catch (error) {
      console.error("Error during sign out:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  resetPassword: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updatePassword: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      if (data.password !== data.confirmPassword) {
        set({ isLoading: false, error: 'Passwords do not match' });
        return { success: false, error: 'Passwords do not match' };
      }
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Error in updatePassword:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}));

// Initialize auth listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event);
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().refreshUser();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  }
});

// Initial auth check - wrapped in a try/catch for more robustness
(async () => {
  try {
    console.log("Performing initial auth check");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error during initial auth check:", error);
      useAuthStore.setState({ user: null, isLoading: false, error: null });
      return;
    }
    
    if (data && data.session) {
      console.log("Session found on init");
      await useAuthStore.getState().refreshUser();
    } else {
      console.log("No session found on init");
      useAuthStore.setState({ user: null, isLoading: false, error: null });
    }
  } catch (error) {
    console.error("Error during initial auth check:", error);
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  }
})();