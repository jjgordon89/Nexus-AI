/**
 * Placeholder authentication module
 * 
 * This is a simple placeholder for a real authentication system.
 * In a production application, this would be replaced with a more robust system.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

// Placeholder auth functions
export const auth = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: (): AuthUser | null => {
    // For demo purposes, always return the demo user
    return {
      id: 'demo-user',
      email: 'user@example.com',
      name: 'Demo User',
    };
  },
  
  /**
   * Check if a user is logged in
   */
  isLoggedIn: (): boolean => {
    return true; // Always return true for demo
  },
  
  /**
   * Log in with email and password
   */
  login: async (_email: string, _password: string): Promise<AuthUser> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return demo user
    return {
      id: 'demo-user',
      email: 'user@example.com',
      name: 'Demo User',
    };
  },
  
  /**
   * Log out
   */
  logout: async (): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  /**
   * Register a new user
   */
  register: async (_email: string, _password: string, _name: string): Promise<AuthUser> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return demo user
    return {
      id: 'demo-user',
      email: 'user@example.com',
      name: 'Demo User',
    };
  },
};