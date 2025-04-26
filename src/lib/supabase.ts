import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Create client with explicit storage configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  }
});

// Check for session immediately
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error getting session:', error);
    // Clear any potentially corrupted session data
    supabase.auth.signOut().catch(e => console.error('Error signing out after session error:', e));
  } else {
    console.log('Session check on init:', data.session ? 'Active session' : 'No session');
  }
});

// For debugging, log all auth events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session ? 'Session exists' : 'No session');
  if (session) {
    console.log('User authenticated:', session.user.id);
    // Verify token expiry
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    console.log('Token expires in:', expiresAt - now, 'seconds');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});