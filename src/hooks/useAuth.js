import { useState, useEffect } from 'react';
import { authService } from '../services';

/**
 * Custom hook for managing authentication state
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
          const emailConfirmed = currentUser.email_confirmed_at || currentUser.confirmed_at;
          if (emailConfirmed) {
            setUser(currentUser);
          } else {
            console.warn('Email not confirmed. Please check your email.');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
          const emailConfirmed = currentUser.email_confirmed_at || currentUser.confirmed_at;
          if (emailConfirmed) {
            setUser(currentUser);
          } else {
            console.warn('Email not confirmed');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
};
