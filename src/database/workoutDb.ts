/**
 * database/workoutDb.ts — Workout CRUD operations
 * 
 * Manages workout sessions, exercise assignments, and set tracking.
 * Handles auto-completion logic and volume calculation.
 */
import { getDatabase } from './database';
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary } from '../types/workout';
import { generateUUID } from '../utils/helpers';
import { formatDateForDb, getDayOfWeek } from '../utils/dateUtils';

/**
 * Get a workout by date. Returns null if no workout exists for that date.
 */
export const getWorkoutByDate = (date: string): Workout | null => {
  const db = getDatabase();
  
  // Get workout record
  const workout = db.getFirstSync<{
    id: string;
    date: string;
    dayOfWeek: number;
    isCompleted: number;
    completedAt: string | null;
    totalVolume: number;
    durationMinutes: number;
  }>(
    `SELECT id, date, day_of_week as dayOfWeek, is_completed as isCompleted, 
     completed_at as completedAt, total_volume as totalVolume, duration_minutes as durationMinutes 
     FROM workouts WHERE date = ?`,
    [date]
  );

  if (!workout) return null;

  // Get exercises for this workout
  const exercises = getWorkoutExercises(workout.id);

  return {
    id: workout.id,
    date: workout.date,
    dayOfWeek: workout.dayOfWeek,
    exercises,
    isCompleted: workout.isCompleted === 1,
    completedAt: workout.completedAt,
    totalVolume: workout.totalVolume,
    durationMinutes: workout.durationMinutes,
  };
};

/**
 * Get all exercises and their sets for a workout.
 */
const getWorkoutExercises = (workoutId: string): WorkoutExercise[] => {
  const db = getDatabase();

  const exercises = db.getAllSync<{
    id: string;
    workoutId: string;
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    isCompleted: number;
    sortOrder: number;
  }>(
    `SELECT id, workout_id as workoutId, exercise_id as exerciseId, 
     exercise_name as exerciseName, muscle_group as muscleGroup,
     is_completed as isCompleted, sort_order as sortOrder
     FROM workout_exercises WHERE workout_id = ? ORDER BY sort_order ASC`,
    [workoutId]
  );

  return exercises.map((ex) => ({
    ...ex,
    isCompleted: ex.isCompleted === 1,
    sets: getWorkoutSets(ex.id),
  }));
};

/**
 * Get all sets for a workout exercise.
 */
const getWorkoutSets = (workoutExerciseId: string): WorkoutSet[] => {
  const db = getDatabase();

  return db.getAllSync<{
    id: string;
    workoutExerciseId: string;
    setNumber: number;
    reps: number;
    weight: number;
    isCompleted: number;
  }>(
    `SELECT id, workout_exercise_id as workoutExerciseId, set_number as setNumber,
     reps, weight, is_completed as isCompleted
     FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_number ASC`,
    [workoutExerciseId]
  ).map((set) => ({
    ...set,
    isCompleted: set.isCompleted === 1,
  }));
};

/**
 * Create a new workout for a given date with specified exercises.
 * Each exercise starts with 3 default sets.
 */
export const createWorkout = (
  date: string,
  exerciseIds: string[],
  exerciseDetails: Array<{ id: string; name: string; muscleGroup: string }>
): Workout => {
  const db = getDatabase();
  const workoutId = generateUUID();
  const dayOfWeek = getDayOfWeek(date);

  // Insert workout record
  db.runSync(
    'INSERT INTO workouts (id, date, day_of_week, is_completed, total_volume, duration_minutes) VALUES (?, ?, ?, 0, 0, 0)',
    [workoutId, date, dayOfWeek]
  );

  const exercises: WorkoutExercise[] = exerciseDetails.map((exercise, index) => {
    const workoutExerciseId = generateUUID();

    // Insert workout exercise
    db.runSync(
      `INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_name, muscle_group, is_completed, sort_order) 
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [workoutExerciseId, workoutId, exercise.id, exercise.name, exercise.muscleGroup, index]
    );

    // Create 3 default sets for each exercise
    const sets: WorkoutSet[] = Array.from({ length: 3 }, (_, i) => {
      const setId = generateUUID();
      db.runSync(
        'INSERT INTO workout_sets (id, workout_exercise_id, set_number, reps, weight, is_completed) VALUES (?, ?, ?, 0, 0, 0)',
        [setId, workoutExerciseId, i + 1]
      );
      return {
        id: setId,
        workoutExerciseId,
        setNumber: i + 1,
        reps: 0,
        weight: 0,
        isCompleted: false,
      };
    });

    return {
      id: workoutExerciseId,
      workoutId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets,
      isCompleted: false,
      sortOrder: index,
    };
  });

  return {
    id: workoutId,
    date,
    dayOfWeek,
    exercises,
    isCompleted: false,
    completedAt: null,
    totalVolume: 0,
    durationMinutes: 0,
  };
};

/**
 * Update a specific set's data (reps, weight, completion status).
 */
export const updateSet = (
  setId: string,
  data: { reps?: number; weight?: number; isCompleted?: boolean }
): void => {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (number | string)[] = [];

  if (data.reps !== undefined) {
    updates.push('reps = ?');
    values.push(data.reps);
  }
  if (data.weight !== undefined) {
    updates.push('weight = ?');
    values.push(data.weight);
  }
  if (data.isCompleted !== undefined) {
    updates.push('is_completed = ?');
    values.push(data.isCompleted ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(setId);
    db.runSync(
      `UPDATE workout_sets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
};

/**
 * Add a new set to a workout exercise.
 */
export const addSet = (workoutExerciseId: string, setNumber: number): WorkoutSet => {
  const db = getDatabase();
  const setId = generateUUID();

  db.runSync(
    'INSERT INTO workout_sets (id, workout_exercise_id, set_number, reps, weight, is_completed) VALUES (?, ?, ?, 0, 0, 0)',
    [setId, workoutExerciseId, setNumber]
  );

  return {
    id: setId,
    workoutExerciseId,
    setNumber,
    reps: 0,
    weight: 0,
    isCompleted: false,
  };
};

/**
 * Remove a set from a workout exercise.
 */
export const removeSet = (setId: string): void => {
  const db = getDatabase();
  db.runSync('DELETE FROM workout_sets WHERE id = ?', [setId]);
};

/**
 * Mark a workout exercise as completed (all sets done).
 */
export const markExerciseCompleted = (workoutExerciseId: string, isCompleted: boolean): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE workout_exercises SET is_completed = ? WHERE id = ?',
    [isCompleted ? 1 : 0, workoutExerciseId]
  );
};

/**
 * Complete a workout — mark as done, calculate total volume.
 */
export const completeWorkout = (workoutId: string, totalVolume: number, durationMinutes: number): void => {
  const db = getDatabase();
  const completedAt = new Date().toISOString();

  db.runSync(
    'UPDATE workouts SET is_completed = 1, completed_at = ?, total_volume = ?, duration_minutes = ? WHERE id = ?',
    [completedAt, totalVolume, durationMinutes, workoutId]
  );
};

/**
 * Get workout summaries for history display.
 * Returns most recent workouts first.
 */
export const getWorkoutHistory = (limit: number = 50, offset: number = 0): WorkoutSummary[] => {
  const db = getDatabase();

  return db.getAllSync<WorkoutSummary>(
    `SELECT w.id, w.date, w.day_of_week as dayOfWeek, w.is_completed as isCompleted,
     w.total_volume as totalVolume, w.duration_minutes as durationMinutes,
     COUNT(we.id) as exerciseCount,
     SUM(CASE WHEN we.is_completed = 1 THEN 1 ELSE 0 END) as completedExerciseCount
     FROM workouts w
     LEFT JOIN workout_exercises we ON w.id = we.workout_id
     GROUP BY w.id
     ORDER BY w.date DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  ).map((w) => ({
    ...w,
    isCompleted: Number(w.isCompleted) === 1,
  }));
};

/**
 * Get all completed workout dates (for streak calculation).
 */
export const getCompletedWorkoutDates = (): string[] => {
  const db = getDatabase();
  const rows = db.getAllSync<{ date: string }>(
    'SELECT date FROM workouts WHERE is_completed = 1 ORDER BY date DESC'
  );
  return rows.map((r) => r.date);
};

/**
 * Delete a workout and all associated data.
 */
export const deleteWorkout = (workoutId: string): void => {
  const db = getDatabase();
  db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
};

/**
 * Add an exercise to an existing workout.
 */
export const addExerciseToWorkout = (
  workoutId: string,
  exercise: { id: string; name: string; muscleGroup: string },
  sortOrder: number
): WorkoutExercise => {
  const db = getDatabase();
  const workoutExerciseId = generateUUID();

  db.runSync(
    `INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_name, muscle_group, is_completed, sort_order) 
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [workoutExerciseId, workoutId, exercise.id, exercise.name, exercise.muscleGroup, sortOrder]
  );

  // Create 3 default sets
  const sets: WorkoutSet[] = Array.from({ length: 3 }, (_, i) => {
    const setId = generateUUID();
    db.runSync(
      'INSERT INTO workout_sets (id, workout_exercise_id, set_number, reps, weight, is_completed) VALUES (?, ?, ?, 0, 0, 0)',
      [setId, workoutExerciseId, i + 1]
    );
    return {
      id: setId,
      workoutExerciseId,
      setNumber: i + 1,
      reps: 0,
      weight: 0,
      isCompleted: false,
    };
  });

  return {
    id: workoutExerciseId,
    workoutId,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets,
    isCompleted: false,
    sortOrder,
  };
};
