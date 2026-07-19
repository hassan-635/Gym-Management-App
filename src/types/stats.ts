/**
 * types/stats.ts — Statistics and analytics type definitions
 * 
 * Covers all calculated stats shown on the Statistics screen,
 * including streak tracking, volume analysis, and exercise history.
 */

/** Overall workout statistics */
export interface WorkoutStats {
  /** Total number of workouts created */
  totalWorkouts: number;
  /** Number of completed workouts */
  completedWorkouts: number;
  /** Current consecutive workout streak (days) */
  currentStreak: number;
  /** Longest ever streak */
  longestStreak: number;
  /** Most trained muscle group name */
  mostTrainedMuscle: string;
  /** Workout consistency percentage (completed / scheduled × 100) */
  consistencyPercentage: number;
  /** Total volume lifted across all workouts (kg) */
  totalVolumeLiftedKg: number;
  /** Average workout duration in minutes */
  averageDurationMinutes: number;
}

/** Data point for weekly workout frequency chart */
export interface WeeklyFrequency {
  /** Day short name (Mon, Tue, etc.) */
  label: string;
  /** Number of workouts on this day */
  value: number;
}

/** Data point for monthly volume chart */
export interface MonthlyVolume {
  /** Month-Year label (Jan, Feb, etc.) */
  label: string;
  /** Total volume lifted in that month */
  value: number;
}

/** Muscle group distribution for pie chart */
export interface MuscleDistribution {
  /** Muscle group name */
  name: string;
  /** Number of exercises/sets targeting this muscle */
  count: number;
  /** Percentage of total */
  percentage: number;
  /** Color for chart rendering */
  color: string;
}

/** Exercise-specific history entry for progressive overload tracking */
export interface ExerciseHistoryEntry {
  /** Unique ID */
  id: string;
  /** Exercise ID */
  exerciseId: string;
  /** Date of the session (YYYY-MM-DD) */
  date: string;
  /** Maximum weight used in this session */
  maxWeight: number;
  /** Total sets performed */
  totalSets: number;
  /** Total reps performed */
  totalReps: number;
  /** Total volume (weight × reps summed across sets) */
  totalVolume: number;
}

/** Progressive overload suggestion for an exercise */
export interface OverloadSuggestion {
  /** Exercise ID */
  exerciseId: string;
  /** Exercise name */
  exerciseName: string;
  /** Current working weight */
  currentWeight: number;
  /** Suggested next weight */
  suggestedWeight: number;
  /** Reason for suggestion */
  reason: string;
  /** Confidence level of the suggestion */
  confidence: 'low' | 'medium' | 'high';
}
