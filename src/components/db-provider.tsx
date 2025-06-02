/**
 * Database provider component
 * 
 * This component initializes the database and provides it to the application.
 * It ensures the database is properly set up before rendering children.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Loading } from './ui/loading';
import { useDBAppStore } from '../store/db-app-store';
import { useDBSettingsStore } from '../store/db-settings-store';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadConversations = useDBAppStore(state => state.loadConversations);
  const loadSettings = useDBSettingsStore(state => state.loadSettings);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize the database
        await db.initialize();
        
        // Load data from the database
        await Promise.all([
          loadConversations(),
          loadSettings()
        ]);
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database. Using in-memory data only.');
        
        // Even if DB fails, we should let the app continue with in-memory data
        setIsInitialized(true);
      }
    };

    initializeDatabase();
  }, [loadConversations, loadSettings]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loading size="lg\" text="Initializing database...\" center />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}
      {children}
    </>
  );
};