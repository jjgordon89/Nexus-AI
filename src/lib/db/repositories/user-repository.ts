/**
 * User repository for database operations
 * 
 * This module provides functions for managing user records in the database.
 */

import { db } from '../client';
import { User, UserSchema } from '../schema';
import { nanoid } from 'nanoid';

export class UserRepository {
  /**
   * Create a new user
   */
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const now = new Date().toISOString();
    
    const user: User = {
      id: nanoid(),
      ...userData,
      created_at: now,
      updated_at: now,
    };
    
    // Validate the user data
    UserSchema.parse(user);
    
    await db.insert('users', user);
    
    return user;
  }

  /**
   * Find a user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const user = await db.findById('users', id);
    return user ? UserSchema.parse(user) : null;
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const users = await db.findBy('users', 'email', email);
    return users.length > 0 ? UserSchema.parse(users[0]) : null;
  }

  /**
   * Update a user
   */
  static async update(id: string, userData: Partial<User>): Promise<User> {
    const currentUser = await this.findById(id);
    
    if (!currentUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...currentUser,
      ...userData,
      updated_at: new Date().toISOString(),
    };
    
    // Validate the updated user data
    UserSchema.parse(updatedUser);
    
    await db.update('users', id, {
      email: updatedUser.email,
      password_hash: updatedUser.password_hash,
      name: updatedUser.name,
      updated_at: updatedUser.updated_at,
    });
    
    return updatedUser;
  }

  /**
   * Delete a user
   */
  static async delete(id: string): Promise<void> {
    await db.delete('users', id);
  }
}