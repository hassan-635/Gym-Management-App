/**
 * database/exerciseDb.ts — Exercise CRUD operations
 * 
 * All database operations for exercise management.
 * Exercises are user-created and stored locally in SQLite.
 */
import { getDatabase } from './database';
import { Exercise, ExerciseFormData, MuscleGroup } from '../types/exercise';
import { generateUUID } from '../utils/helpers';

/**
 * Get all exercises, optionally filtered by muscle group.
 */
export const getAllExercises = (muscleGroup?: MuscleGroup): Exercise[] => {
  const db = getDatabase();
  
  if (muscleGroup) {
    return db.getAllSync<Exercise>(
      'SELECT id, name, muscle_group as muscleGroup, is_custom as isCustom, created_at as createdAt FROM exercises WHERE muscle_group = ? ORDER BY name ASC',
      [muscleGroup]
    );
  }
  
  return db.getAllSync<Exercise>(
    'SELECT id, name, muscle_group as muscleGroup, is_custom as isCustom, created_at as createdAt FROM exercises ORDER BY name ASC'
  );
};

/**
 * Get a single exercise by ID.
 */
export const getExerciseById = (id: string): Exercise | null => {
  const db = getDatabase();
  return db.getFirstSync<Exercise>(
    'SELECT id, name, muscle_group as muscleGroup, is_custom as isCustom, created_at as createdAt FROM exercises WHERE id = ?',
    [id]
  );
};

/**
 * Create a new exercise.
 */
export const createExercise = (data: ExerciseFormData): Exercise => {
  const db = getDatabase();
  const id = generateUUID();
  const createdAt = new Date().toISOString();

  db.runSync(
    'INSERT INTO exercises (id, name, muscle_group, is_custom, created_at) VALUES (?, ?, ?, 1, ?)',
    [id, data.name.trim(), data.muscleGroup, createdAt]
  );

  return {
    id,
    name: data.name.trim(),
    muscleGroup: data.muscleGroup,
    isCustom: true,
    createdAt,
  };
};

/**
 * Update an existing exercise.
 */
export const updateExercise = (id: string, data: ExerciseFormData): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE exercises SET name = ?, muscle_group = ? WHERE id = ?',
    [data.name.trim(), data.muscleGroup, id]
  );
};

/**
 * Delete an exercise and all related history.
 * Cascade delete handles workout_exercises and exercise_history.
 */
export const deleteExercise = (id: string): void => {
  const db = getDatabase();
  db.runSync('DELETE FROM exercises WHERE id = ?', [id]);
};

/**
 * Search exercises by name (case-insensitive).
 */
export const searchExercises = (query: string): Exercise[] => {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    'SELECT id, name, muscle_group as muscleGroup, is_custom as isCustom, created_at as createdAt FROM exercises WHERE name LIKE ? ORDER BY name ASC',
    [`%${query}%`]
  );
};

/**
 * Check if an exercise with the given name already exists.
 */
export const exerciseExists = (name: string): boolean => {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises WHERE LOWER(name) = LOWER(?)',
    [name.trim()]
  );
  return (result?.count ?? 0) > 0;
};

/**
 * Get exercise count by muscle group (for stats).
 */
export const getExerciseCountByMuscle = (): Record<string, number> => {
  const db = getDatabase();
  const rows = db.getAllSync<{ muscleGroup: string; count: number }>(
    'SELECT muscle_group as muscleGroup, COUNT(*) as count FROM exercises GROUP BY muscle_group'
  );
  
  return rows.reduce((acc, row) => {
    acc[row.muscleGroup] = row.count;
    return acc;
  }, {} as Record<string, number>);
};
