/**
 * hooks/useDatabase.ts — Database initialization hook
 * 
 * Manages database setup on app startup.
 * Provides loading state for splash screen management.
 */
import { useState, useEffect } from 'react';
import { initializeDatabase } from '../database/database';

/**
 * Hook that initializes the SQLite database on mount.
 * Returns loading state to conditionally render the app.
 */
export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setIsReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Database initialization failed';
        console.error('Database init error:', message);
        setError(message);
      }
    };

    init();
  }, []);

  return { isReady, error };
};
