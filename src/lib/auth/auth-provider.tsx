/**
 * Authentication Provider Component
 * 
 * This component provides authentication context to the entire application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../../components/ui/toast';
import { auth, AuthUser } from './index';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const currentUser = auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await auth.login(email, password);
      setUser(user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name || 'User'}!`,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await auth.logout();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const user = await auth.register(email, password, name);
      setUser(user);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${name || 'User'}!`,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};