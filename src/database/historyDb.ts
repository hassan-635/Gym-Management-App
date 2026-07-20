/**
 * database/historyDb.ts — Exercise history and progressive overload queries (Zustand Adapter)
 * 
 * Handles logging completed exercise data and querying history
 * for progressive overload tracking and statistics using Zustand.
 */
import { useDataStore } from '../store/useDataStore';
import { ExerciseHistoryEntry } from '../types/stats';
import { generateUUID } from '../utils/helpers';
import dayjs from 'dayjs';

export const logExerciseHistory = (
  exerciseId: string,
  date: string,
  maxWeight: number,
  totalSets: number,
  totalReps: number,
  totalVolume: number
): void => {
  const id = generateUUID();
  useDataStore.getState().addHistoryEntry({
    id,
    exerciseId,
    date,
    maxWeight,
    totalSets,
    totalReps,
    totalVolume,
  });
};

export const getExerciseHistory = (
  exerciseId: string,
  limit: number = 30
): ExerciseHistoryEntry[] => {
  const state = useDataStore.getState();
  return state.exerciseHistory
    .filter(h => h.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
};

export const getLastSessions = (
  exerciseId: string,
  count: number = 5
): ExerciseHistoryEntry[] => {
  return getExerciseHistory(exerciseId, count);
};

export const getPersonalRecord = (exerciseId: string): number => {
  const history = getExerciseHistory(exerciseId, 9999);
  if (history.length === 0) return 0;
  return Math.max(...history.map(h => h.maxWeight));
};

export const getTotalVolumeInRange = (startDate: string, endDate: string): number => {
  const state = useDataStore.getState();
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  return state.exerciseHistory
    .filter(h => {
      const d = dayjs(h.date);
      return (d.isAfter(start, 'day') || d.isSame(start, 'day')) && 
             (d.isBefore(end, 'day') || d.isSame(end, 'day'));
    })
    .reduce((sum, h) => sum + h.totalVolume, 0);
};

export const getMostTrainedMuscle = (): string => {
  const state = useDataStore.getState();
  const muscleCounts: Record<string, number> = {};
  
  state.exerciseHistory.forEach(h => {
    const exercise = state.exercises.find(e => e.id === h.exerciseId);
    if (exercise) {
      muscleCounts[exercise.muscleGroup] = (muscleCounts[exercise.muscleGroup] || 0) + 1;
    }
  });
  
  const entries = Object.entries(muscleCounts);
  if (entries.length === 0) return 'None';
  
  return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

export const getMuscleDistribution = (): Array<{ muscleGroup: string; count: number }> => {
  const state = useDataStore.getState();
  const muscleCounts: Record<string, number> = {};
  
  state.exerciseHistory.forEach(h => {
    const exercise = state.exercises.find(e => e.id === h.exerciseId);
    if (exercise) {
      muscleCounts[exercise.muscleGroup] = (muscleCounts[exercise.muscleGroup] || 0) + 1;
    }
  });
  
  return Object.entries(muscleCounts)
    .map(([muscleGroup, count]) => ({ muscleGroup, count }))
    .sort((a, b) => b.count - a.count);
};

export const getMonthlyVolumeData = (months: number = 6): Array<{ month: string; volume: number }> => {
  const state = useDataStore.getState();
  const cutoff = dayjs().subtract(months, 'months');
  
  const monthlyData: Record<string, number> = {};
  
  state.exerciseHistory.forEach(h => {
    const date = dayjs(h.date);
    if (date.isAfter(cutoff)) {
      const monthStr = date.format('YYYY-MM');
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + h.totalVolume;
    }
  });
  
  return Object.entries(monthlyData)
    .map(([month, volume]) => ({ month, volume }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getWeeklyFrequencyData = (): Array<{ dayOfWeek: number; count: number }> => {
  const state = useDataStore.getState();
  
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  state.workouts.forEach(w => {
    if (w.isCompleted) {
      counts[w.dayOfWeek] = (counts[w.dayOfWeek] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .map(([dayOfWeek, count]) => ({ dayOfWeek: Number(dayOfWeek), count }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

export const getOverallStats = (): {
  totalWorkouts: number;
  completedWorkouts: number;
  totalVolume: number;
  avgDuration: number;
} => {
  const state = useDataStore.getState();
  
  const totalWorkouts = state.workouts.length;
  const completedWorkouts = state.workouts.filter(w => w.isCompleted);
  const numCompleted = completedWorkouts.length;
  
  const totalVolume = completedWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
  
  const workoutsWithDuration = completedWorkouts.filter(w => w.durationMinutes > 0);
  const avgDuration = workoutsWithDuration.length > 0
    ? workoutsWithDuration.reduce((sum, w) => sum + w.durationMinutes, 0) / workoutsWithDuration.length
    : 0;
    
  return {
    totalWorkouts,
    completedWorkouts: numCompleted,
    totalVolume,
    avgDuration,
  };
};
