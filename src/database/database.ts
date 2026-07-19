/**
 * database/database.ts — SQLite database initialization and migrations
 * 
 * Uses expo-sqlite for local data persistence.
 * Handles schema creation, versioning, and migrations.
 * All gym data is stored locally — no cloud dependency.
 */
import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../utils/constants';

/** Singleton database instance */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the database instance.
 * Opens the database synchronously using expo-sqlite's new API.
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
};

/**
 * Initialize the database — create all tables if they don't exist.
 * Called once on app startup.
 */
export const initializeDatabase = async (): Promise<void> => {
  const database = getDatabase();

  // Enable WAL mode for better performance
  database.execSync('PRAGMA journal_mode = WAL;');
  
  // Enable foreign keys
  database.execSync('PRAGMA foreign_keys = ON;');

  // ── Create Tables ──

  // Exercises table — stores exercise definitions
  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      is_custom INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // Workouts table — stores individual workout sessions
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL UNIQUE,
      day_of_week INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      total_volume REAL DEFAULT 0,
      duration_minutes INTEGER DEFAULT 0
    );
  `);

  // Workout Exercises junction table — links exercises to workouts
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // Workout Sets table — individual sets within a workout exercise
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY NOT NULL,
      workout_exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER DEFAULT 0,
      weight REAL DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );
  `);

  // Exercise History table — aggregated data for progressive overload
  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercise_history (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT NOT NULL,
      date TEXT NOT NULL,
      max_weight REAL DEFAULT 0,
      total_sets INTEGER DEFAULT 0,
      total_reps INTEGER DEFAULT 0,
      total_volume REAL DEFAULT 0,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // ── Create Indexes for Performance ──
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
  `);
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
  `);
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id ON workout_sets(workout_exercise_id);
  `);
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_exercise_history_exercise_id ON exercise_history(exercise_id);
  `);
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_exercise_history_date ON exercise_history(date);
  `);

  console.log('✅ Database initialized successfully');
};

/**
 * Close the database connection.
 * Call on app background/termination.
 */
export const closeDatabase = (): void => {
  if (db) {
    db.closeSync();
    db = null;
  }
};

/**
 * Reset the database — drop all tables and reinitialize.
 * ⚠️ WARNING: This deletes ALL data. Use only for debugging.
 */
export const resetDatabase = async (): Promise<void> => {
  const database = getDatabase();
  
  database.execSync('DROP TABLE IF EXISTS workout_sets;');
  database.execSync('DROP TABLE IF EXISTS workout_exercises;');
  database.execSync('DROP TABLE IF EXISTS exercise_history;');
  database.execSync('DROP TABLE IF EXISTS workouts;');
  database.execSync('DROP TABLE IF EXISTS exercises;');
  
  await initializeDatabase();
  console.log('🔄 Database reset complete');
};
