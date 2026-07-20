/**
 * types/exercise.ts — Exercise-related type definitions
 * 
 * Defines the core exercise entity and muscle group categorization.
 * All exercises are user-created (no pre-loaded defaults).
 */

/** Available muscle group categories */
export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Arms' | 'Core';

/** Array of all muscle groups for iteration */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core',
];

/** Core exercise entity stored in SQLite */
export interface Exercise {
  /** Unique identifier (UUID) */
  id: string;
  /** Exercise name (e.g., "Bench Press") */
  name: string;
  /** Target muscle group */
  muscleGroup: MuscleGroup;
  /** Whether user created this exercise */
  isCustom: boolean;
  /** ISO date string of creation */
  createdAt: string;
  /** Target minimum reps (display only) */
  targetMinReps?: number;
  /** Target maximum reps (display only) */
  targetMaxReps?: number;
}

/** Form data for creating/editing an exercise */
export interface ExerciseFormData {
  name: string;
  muscleGroup: MuscleGroup;
  targetMinReps?: number;
  targetMaxReps?: number;
}

/** Exercise with its progressive overload data */
export interface ExerciseWithProgress extends Exercise {
  /** Last recorded weight for this exercise */
  lastWeight: number;
  /** Last recorded reps */
  lastReps: number;
  /** Last recorded sets count */
  lastSets: number;
  /** Personal record (max weight ever lifted) */
  personalRecord: number;
  /** Suggested next weight based on progressive overload logic */
  suggestedWeight: number | null;
  /** Number of times this exercise has been performed */
  totalSessions: number;
}
