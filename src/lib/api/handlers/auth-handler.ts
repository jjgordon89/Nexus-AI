/**
 * Authentication API handlers
 * 
 * This module handles authentication-related API requests.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../../auth/auth';

// Request validation schemas
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Handle user registration
 */
export async function register(req: Request, res: Response) {
  try {
    // Validate request
    const { email, password, name } = RegisterSchema.parse(req.body);
    
    // Register the user
    const { user, token } = await AuthService.register(email, password, name);
    
    // Return user info and token
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
      });
    }
    
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this email already exists',
      });
    }
    
    return res.status(500).json({
      error: 'Registration Failed',
      message: 'Failed to register user',
    });
  }
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response) {
  try {
    // Validate request
    const { email, password } = LoginSchema.parse(req.body);
    
    // Authenticate the user
    const { user, token } = await AuthService.login(email, password);
    
    // Return user info and token
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
      });
    }
    
    // Don't reveal too much information about the error
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid email or password',
    });
  }
}

/**
 * Handle password change
 */
export async function changePassword(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to change your password',
      });
    }
    
    // Validate request
    const { currentPassword, newPassword } = PasswordChangeSchema.parse(req.body);
    
    // Change the password
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    
    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
      });
    }
    
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect',
      });
    }
    
    return res.status(500).json({
      error: 'Password Change Failed',
      message: 'Failed to change password',
    });
  }
}

/**
 * Handle password reset request
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    // Validate request
    const { email } = z.object({
      email: z.string().email('Invalid email address'),
    }).parse(req.body);
    
    // Request password reset
    await AuthService.requestPasswordReset(email);
    
    // Always return success, even if the email doesn't exist
    // This prevents user enumeration attacks
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
      });
    }
    
    // Always return success to prevent user enumeration
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }
}

/**
 * Handle password reset
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    // Validate request
    const { token, newPassword } = z.object({
      token: z.string(),
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    }).parse(req.body);
    
    // Reset the password
    const success = await AuthService.resetPassword(token, newPassword);
    
    if (!success) {
      return res.status(400).json({
        error: 'Invalid Token',
        message: 'The reset token is invalid or has expired',
      });
    }
    
    return res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
      });
    }
    
    return res.status(500).json({
      error: 'Password Reset Failed',
      message: 'Failed to reset password',
    });
  }
}