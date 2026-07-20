/**
 * store/useStatsStore.ts — Statistics state management
 * 
 * Aggregates and caches workout statistics from SQLite.
 * Provides data for the Stats screen charts and stat blocks.
 */
import { create } from 'zustand';
import { WorkoutStats, WeeklyFrequency, MonthlyVolume, MuscleDistribution } from '../types/stats';
import * as historyDb from '../database/historyDb';
import * as workoutDb from '../database/workoutDb';
import { calculateStreak, calculateLongestStreak } from '../utils/dateUtils';
import { colors } from '../theme/colors';
import { DAYS_SHORT } from '../utils/constants';

interface StatsState {
  stats: WorkoutStats;
  weeklyFrequency: WeeklyFrequency[];
  monthlyVolume: MonthlyVolume[];
  muscleDistribution: MuscleDistribution[];
  isLoading: boolean;
  lastUpdated: number | null;

  // Actions
  loadStats: () => void;
  refreshStats: () => void;
}

const DEFAULT_STATS: WorkoutStats = {
  totalWorkouts: 0,
  completedWorkouts: 0,
  currentStreak: 0,
  longestStreak: 0,
  mostTrainedMuscle: 'None',
  consistencyPercentage: 0,
  totalVolumeLiftedKg: 0,
  averageDurationMinutes: 0,
};

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: DEFAULT_STATS,
  weeklyFrequency: [],
  monthlyVolume: [],
  muscleDistribution: [],
  isLoading: false,
  lastUpdated: null,

  /**
   * Load all statistics from the database.
   */
  loadStats: () => {
    set({ isLoading: true });

    try {
      // ── Overall Stats ──
      const overallStats = historyDb.getOverallStats();
      
      // ── Streak Calculation ──
      const completedDates = workoutDb.getCompletedWorkoutDates();
      const currentStreak = calculateStreak(completedDates);
      const longestStreak = calculateLongestStreak(completedDates);

      // ── Most Trained Muscle ──
      const mostTrainedMuscle = historyDb.getMostTrainedMuscle();

      // ── Consistency ──
      const consistency = overallStats.totalWorkouts > 0
        ? Math.round((overallStats.completedWorkouts / overallStats.totalWorkouts) * 100)
        : 0;

      const stats: WorkoutStats = {
        totalWorkouts: overallStats.totalWorkouts,
        completedWorkouts: overallStats.completedWorkouts,
        currentStreak,
        longestStreak,
        mostTrainedMuscle,
        consistencyPercentage: consistency,
        totalVolumeLiftedKg: overallStats.totalVolume,
        averageDurationMinutes: Math.round(overallStats.avgDuration),
      };

      // ── Weekly Frequency Data ──
      const weeklyData = historyDb.getWeeklyFrequencyData();
      const weeklyFrequency: WeeklyFrequency[] = DAYS_SHORT.map((label, index) => ({
        label,
        value: weeklyData.find((d) => d.dayOfWeek === index)?.count ?? 0,
      }));

      // ── Monthly Volume Data ──
      const monthlyData = historyDb.getMonthlyVolumeData(6);
      const monthlyVolume: MonthlyVolume[] = monthlyData.map((d) => ({
        label: d.month.split('-')[1] ?? d.month,
        value: d.volume,
      }));

      // ── Muscle Distribution ──
      const muscleData = historyDb.getMuscleDistribution();
      const totalMuscleCount = muscleData.reduce((sum, d) => sum + d.count, 0);
      const muscleGroupColors: Record<string, string> = colors.muscleGroups;

      const muscleDistribution: MuscleDistribution[] = muscleData.map((d) => ({
        name: d.muscleGroup,
        count: d.count,
        percentage: totalMuscleCount > 0
          ? Math.round((d.count / totalMuscleCount) * 100)
          : 0,
        color: muscleGroupColors[d.muscleGroup] ?? '#6C63FF',
      }));

      set({
        stats,
        weeklyFrequency,
        monthlyVolume,
        muscleDistribution,
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Force refresh stats (call after workout completion).
   */
  refreshStats: () => {
    get().loadStats();
  },
}));
