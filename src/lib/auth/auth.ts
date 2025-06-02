/**
 * Authentication system
 * 
 * This module provides authentication functionality using JSON Web Tokens (JWT).
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../db/repositories/user-repository';
import { User } from '../db/schema';

// Secret key for JWT signing
// In production, use an environment variable for this
const JWT_SECRET = process.env.JWT_SECRET || 'nexusai-jwt-secret-key-change-me-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name?: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await UserRepository.create({
      email,
      password_hash: passwordHash,
      name: name || null,
    });
    
    // Generate a token
    const token = this.generateToken(user);
    
    return { user, token };
  }
  
  /**
   * Authenticate a user
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find the user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate a token
    const token = this.generateToken(user);
    
    return { user, token };
  }
  
  /**
   * Verify a token and get the user
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Find the user
      const user = await UserRepository.findById(decoded.id);
      return user;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Generate a JWT token for a user
   */
  private static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }
  
  /**
   * Change a user's password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Find the user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update the user
    await UserRepository.update(userId, {
      password_hash: newPasswordHash,
    });
  }
  
  /**
   * Request a password reset
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    // Find the user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist
      return false;
    }
    
    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Save it with an expiry time
    // 3. Send an email with a reset link
    
    // For this demo, we'll just return true
    return true;
  }
  
  /**
   * Reset a password using a reset token
   */
  static async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Find the associated user
    // 4. Update their password
    
    // For this demo, we'll just return true
    return true;
  }
}