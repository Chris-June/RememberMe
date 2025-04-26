import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to clean up potential corrupted session data
 * This can happen when there are auth issues
 */
export const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupSession = async () => {
      try {
        // First check if we have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Session error detected, cleaning up local storage');
          
          // Clear Supabase-specific items from localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('supabase.auth') || 
                key.startsWith('sb-') || 
                key === 'remembering-me-auth-token') {
              console.log(`Removing potentially corrupted session item: ${key}`);
              localStorage.removeItem(key);
            }
          });
          
          // Force a page reload to clear any in-memory state
          window.location.reload();
        }
      } catch (e) {
        console.error('Error during session cleanup:', e);
      }
    };
    
    cleanupSession();
  }, []);
  
  return null;
};

export default useSessionCleanup;