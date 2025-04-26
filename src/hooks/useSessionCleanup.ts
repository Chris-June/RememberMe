import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to clean up potential corrupted session data
 * This can happen when there are auth issues
 */
const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupSession = async () => {
      try {
        // First check if we have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error || (!data.session && document.cookie.includes('supabase'))) {
          console.log('Session error or invalid session detected, cleaning up local storage');
          
          // Clear Supabase-specific items from localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('supabase.auth') || 
                key.startsWith('sb-') || 
                key.includes('auth-token') ||
                key.includes('supabase.auth.token') ||
                key.includes('supabase-auth')) {
              console.log(`Removing potentially corrupted session item: ${key}`);
              localStorage.removeItem(key);
            }
          });
          
          // Clear auth-related cookies
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              console.log(`Removed cookie: ${name}`);
            }
          });
          
          // Force sign out to clear any in-memory state
          await supabase.auth.signOut();
          
          // Force a page reload to clear any in-memory state
          window.location.reload();
        }
      } catch (e) {
        console.error('Error during session cleanup:', e);
        // If we get an error during cleanup, do a hard sign-out and reload
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Failed to sign out during error recovery:', err);
        }
        window.location.reload();
      }
    };
    
    cleanupSession();
  }, []);
  
  return null;
};

export default useSessionCleanup;