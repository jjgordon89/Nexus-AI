/**
 * Centralized database module exports
 * 
 * This file exports all database-related components for easy importing
 * throughout the application.
 */

// Export the database client
export { db } from './client';

// Export schema types
export * from './schema';

// Export repositories
export * from './repositories';