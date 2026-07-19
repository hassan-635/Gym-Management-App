/**
 * database/historyDb.ts — Exercise history and progressive overload queries
 * 
 * Handles logging completed exercise data and querying history
 * for progressive overload tracking and statistics.
 */
import { getDatabase } from './database';
import { ExerciseHistoryEntry } from '../types/stats';
import { generateUUID } from '../utils/helpers';

/**
 * Log a completed exercise session to history.
 * Called when a workout is completed — logs each exercise's data.
 */
export const logExerciseHistory = (
  exerciseId: string,
  date: string,
  maxWeight: number,
  totalSets: number,
  totalReps: number,
  totalVolume: number
): void => {
  const db = getDatabase();
  const id = generateUUID();

  db.runSync(
    `INSERT INTO exercise_history (id, exercise_id, date, max_weight, total_sets, total_reps, total_volume)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, exerciseId, date, maxWeight, totalSets, totalReps, totalVolume]
  );
};

/**
 * Get exercise history for a specific exercise.
 * Returns entries sorted by date ascending (for charting).
 */
export const getExerciseHistory = (
  exerciseId: string,
  limit: number = 30
): ExerciseHistoryEntry[] => {
  const db = getDatabase();

  return db.getAllSync<ExerciseHistoryEntry>(
    `SELECT id, exercise_id as exerciseId, date, max_weight as maxWeight,
     total_sets as totalSets, total_reps as totalReps, total_volume as totalVolume
     FROM exercise_history
     WHERE exercise_id = ?
     ORDER BY date DESC
     LIMIT ?`,
    [exerciseId, limit]
  );
};

/**
 * Get the last N sessions for an exercise (for overload analysis).
 */
export const getLastSessions = (
  exerciseId: string,
  count: number = 5
): ExerciseHistoryEntry[] => {
  const db = getDatabase();

  return db.getAllSync<ExerciseHistoryEntry>(
    `SELECT id, exercise_id as exerciseId, date, max_weight as maxWeight,
     total_sets as totalSets, total_reps as totalReps, total_volume as totalVolume
     FROM exercise_history
     WHERE exercise_id = ?
     ORDER BY date DESC
     LIMIT ?`,
    [exerciseId, count]
  );
};

/**
 * Get the personal record (max weight) for an exercise.
 */
export const getPersonalRecord = (exerciseId: string): number => {
  const db = getDatabase();
  const result = db.getFirstSync<{ pr: number }>(
    'SELECT MAX(max_weight) as pr FROM exercise_history WHERE exercise_id = ?',
    [exerciseId]
  );
  return result?.pr ?? 0;
};

/**
 * Get total volume lifted across all exercises in a date range.
 */
export const getTotalVolumeInRange = (startDate: string, endDate: string): number => {
  const db = getDatabase();
  const result = db.getFirstSync<{ total: number }>(
    'SELECT SUM(total_volume) as total FROM exercise_history WHERE date BETWEEN ? AND ?',
    [startDate, endDate]
  );
  return result?.total ?? 0;
};

/**
 * Get the most trained muscle group based on exercise history.
 */
export const getMostTrainedMuscle = (): string => {
  const db = getDatabase();
  const result = db.getFirstSync<{ muscleGroup: string; count: number }>(
    `SELECT e.muscle_group as muscleGroup, COUNT(eh.id) as count
     FROM exercise_history eh
     JOIN exercises e ON eh.exercise_id = e.id
     GROUP BY e.muscle_group
     ORDER BY count DESC
     LIMIT 1`
  );
  return result?.muscleGroup ?? 'None';
};

/**
 * Get workout count by muscle group (for distribution chart).
 */
export const getMuscleDistribution = (): Array<{ muscleGroup: string; count: number }> => {
  const db = getDatabase();
  return db.getAllSync<{ muscleGroup: string; count: number }>(
    `SELECT e.muscle_group as muscleGroup, COUNT(eh.id) as count
     FROM exercise_history eh
     JOIN exercises e ON eh.exercise_id = e.id
     GROUP BY e.muscle_group
     ORDER BY count DESC`
  );
};

/**
 * Get monthly volume data for the last N months (for chart).
 */
export const getMonthlyVolumeData = (months: number = 6): Array<{ month: string; volume: number }> => {
  const db = getDatabase();
  return db.getAllSync<{ month: string; volume: number }>(
    `SELECT strftime('%Y-%m', date) as month, SUM(total_volume) as volume
     FROM exercise_history
     WHERE date >= date('now', '-${months} months')
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month ASC`
  );
};

/**
 * Get weekly workout frequency data (how many workouts per day of week).
 */
export const getWeeklyFrequencyData = (): Array<{ dayOfWeek: number; count: number }> => {
  const db = getDatabase();
  return db.getAllSync<{ dayOfWeek: number; count: number }>(
    `SELECT day_of_week as dayOfWeek, COUNT(*) as count
     FROM workouts
     WHERE is_completed = 1
     GROUP BY day_of_week
     ORDER BY day_of_week ASC`
  );
};

/**
 * Get total stats for the stats screen.
 */
export const getOverallStats = (): {
  totalWorkouts: number;
  completedWorkouts: number;
  totalVolume: number;
  avgDuration: number;
} => {
  const db = getDatabase();
  const result = db.getFirstSync<{
    totalWorkouts: number;
    completedWorkouts: number;
    totalVolume: number;
    avgDuration: number;
  }>(
    `SELECT 
     COUNT(*) as totalWorkouts,
     SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completedWorkouts,
     SUM(CASE WHEN is_completed = 1 THEN total_volume ELSE 0 END) as totalVolume,
     AVG(CASE WHEN is_completed = 1 AND duration_minutes > 0 THEN duration_minutes ELSE NULL END) as avgDuration
     FROM workouts`
  );

  return {
    totalWorkouts: result?.totalWorkouts ?? 0,
    completedWorkouts: result?.completedWorkouts ?? 0,
    totalVolume: result?.totalVolume ?? 0,
    avgDuration: result?.avgDuration ?? 0,
  };
};
