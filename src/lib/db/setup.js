/**
 * Database setup script
 * 
 * This script initializes the database schema and creates 
 * necessary tables for the NexusAI application.
 * 
 * Run this script with: npm run db:setup
 */

import { db } from './client.js';

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Initialize the database (creates tables)
    await db.initialize();
    
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();