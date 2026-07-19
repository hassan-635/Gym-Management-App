/**
 * services/statsCalculator.ts — Statistics calculation service
 * 
 * Business logic for computing workout statistics.
 * Separated from the store for testability and reuse.
 */
import * as historyDb from '../database/historyDb';
import * as workoutDb from '../database/workoutDb';
import { WorkoutStats } from '../types/stats';
import { calculateStreak } from '../utils/dateUtils';

/**
 * Calculate all workout statistics in one call.
 * Used by the stats store and can be called independently.
 */
export const calculateAllStats = (restDays: number[] = [5]): WorkoutStats => {
  const overallStats = historyDb.getOverallStats();
  const completedDates = workoutDb.getCompletedWorkoutDates();
  const currentStreak = calculateStreak(completedDates, restDays);
  const mostTrainedMuscle = historyDb.getMostTrainedMuscle();

  const consistency = overallStats.totalWorkouts > 0
    ? Math.round((overallStats.completedWorkouts / overallStats.totalWorkouts) * 100)
    : 0;

  return {
    totalWorkouts: overallStats.totalWorkouts,
    completedWorkouts: overallStats.completedWorkouts,
    currentStreak,
    longestStreak: currentStreak,
    mostTrainedMuscle,
    consistencyPercentage: consistency,
    totalVolumeLiftedKg: overallStats.totalVolume,
    averageDurationMinutes: Math.round(overallStats.avgDuration),
  };
};

/**
 * Calculate workout consistency for a specific time range.
 * Returns percentage of scheduled workouts that were completed.
 */
export const calculateConsistency = (
  totalScheduled: number,
  totalCompleted: number
): number => {
  if (totalScheduled <= 0) return 0;
  return Math.min(100, Math.round((totalCompleted / totalScheduled) * 100));
};

/**
 * Determine the "grade" based on consistency percentage.
 */
export const getConsistencyGrade = (percentage: number): {
  grade: string;
  emoji: string;
  message: string;
} => {
  if (percentage >= 90) return { grade: 'A+', emoji: '🔥', message: 'Unstoppable!' };
  if (percentage >= 80) return { grade: 'A', emoji: '💪', message: 'Crushing it!' };
  if (percentage >= 70) return { grade: 'B', emoji: '👍', message: 'Good work!' };
  if (percentage >= 60) return { grade: 'C', emoji: '⚡', message: 'Keep pushing!' };
  if (percentage >= 40) return { grade: 'D', emoji: '🏃', message: 'Room to grow' };
  return { grade: 'F', emoji: '🌱', message: 'Just getting started!' };
};
