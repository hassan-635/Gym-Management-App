/**
 * types/workout.ts — Workout-related type definitions
 * 
 * Defines the workout, exercise-in-workout, and individual set structures.
 * Supports checkbox completion, auto-completion, and volume tracking.
 */

/** A single set within an exercise during a workout */
export interface WorkoutSet {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent workout exercise ID */
  workoutExerciseId: string;
  /** Set number (1-indexed) */
  setNumber: number;
  /** Number of reps performed */
  reps: number;
  /** Weight used in kg */
  weight: number;
  /** Whether this set has been completed (checkbox checked) */
  isCompleted: boolean;
}

/** An exercise assigned to a specific workout session */
export interface WorkoutExercise {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent workout ID */
  workoutId: string;
  /** Reference to the exercise definition */
  exerciseId: string;
  /** Exercise name (denormalized for display) */
  exerciseName: string;
  /** Muscle group (denormalized for display) */
  muscleGroup: string;
  /** All sets for this exercise in this workout */
  sets: WorkoutSet[];
  /** Whether all sets are completed */
  isCompleted: boolean;
  /** Display order within the workout */
  sortOrder: number;
  /** Target minimum reps (display only) */
  targetMinReps?: number;
  /** Target maximum reps (display only) */
  targetMaxReps?: number;
}

/** A complete workout session for a specific day */
export interface Workout {
  /** Unique identifier (UUID) */
  id: string;
  /** Date of workout (YYYY-MM-DD format) */
  date: string;
  /** Day of week (0=Sunday, 1=Monday, ..., 6=Saturday) */
  dayOfWeek: number;
  /** All exercises in this workout */
  exercises: WorkoutExercise[];
  /** Whether the entire workout is completed */
  isCompleted: boolean;
  /** ISO timestamp when workout was marked complete */
  completedAt: string | null;
  /** Total volume lifted (sum of weight × reps across all sets) */
  totalVolume: number;
  /** Workout duration in minutes */
  durationMinutes: number;
}

/** Data for creating a new workout */
export interface CreateWorkoutData {
  date: string;
  exerciseIds: string[];
}

/** Summary for workout history list */
export interface WorkoutSummary {
  id: string;
  date: string;
  dayOfWeek: number;
  isCompleted: boolean;
  totalVolume: number;
  exerciseCount: number;
  completedExerciseCount: number;
  durationMinutes: number;
}
