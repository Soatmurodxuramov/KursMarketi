import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Return safe fallback instead of throwing error during initial load
    return {
      user: null,
      profile: null,
      loading: true,
      signIn: async () => ({ error: 'Auth not initialized' }),
      signUp: async () => ({ error: 'Auth not initialized' }),
      signOut: async () => {},
      resetPassword: async () => ({ error: 'Auth not initialized' }),
      updateProfile: async () => ({ error: 'Auth not initialized' }),
      refreshProfile: async () => {},
    };
  }
  
  return context;
}

export default useAuth;