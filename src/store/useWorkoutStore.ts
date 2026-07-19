/**
 * store/useWorkoutStore.ts — Workout session state management
 * 
 * Manages the active workout session, set tracking, completion logic,
 * and auto-completion when all sets are checked.
 */
import { create } from 'zustand';
import { Workout, WorkoutExercise, WorkoutSet } from '../types/workout';
import * as workoutDb from '../database/workoutDb';
import * as historyDb from '../database/historyDb';
import { calculateTotalVolume } from '../utils/helpers';

interface WorkoutState {
  currentWorkout: Workout | null;
  isActive: boolean;
  workoutStartTime: number | null;
  isLoading: boolean;

  // Actions
  loadWorkoutForDate: (date: string) => void;
  createWorkout: (
    date: string,
    exerciseDetails: Array<{ id: string; name: string; muscleGroup: string }>
  ) => void;
  updateSet: (setId: string, workoutExerciseId: string, data: { reps?: number; weight?: number; isCompleted?: boolean }) => void;
  toggleSetCompletion: (setId: string, workoutExerciseId: string) => void;
  addSet: (workoutExerciseId: string) => void;
  removeSet: (setId: string, workoutExerciseId: string) => void;
  addExerciseToWorkout: (exercise: { id: string; name: string; muscleGroup: string }) => void;
  completeWorkout: () => void;
  startWorkout: () => void;
  clearCurrentWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  currentWorkout: null,
  isActive: false,
  workoutStartTime: null,
  isLoading: false,

  /**
   * Load a workout for a specific date from SQLite.
   */
  loadWorkoutForDate: (date) => {
    set({ isLoading: true });
    try {
      const workout = workoutDb.getWorkoutByDate(date);
      set({ currentWorkout: workout, isLoading: false });
    } catch (error) {
      console.error('Failed to load workout:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Create a new workout for a date with exercises.
   */
  createWorkout: (date, exerciseDetails) => {
    try {
      const exerciseIds = exerciseDetails.map((e) => e.id);
      const workout = workoutDb.createWorkout(date, exerciseIds, exerciseDetails);
      set({ currentWorkout: workout });
    } catch (error) {
      console.error('Failed to create workout:', error);
    }
  },

  /**
   * Start tracking a workout session (records start time).
   */
  startWorkout: () => {
    set({ isActive: true, workoutStartTime: Date.now() });
  },

  /**
   * Update a set's reps, weight, or completion status.
   * Also checks for auto-completion of the parent exercise.
   */
  updateSet: (setId, workoutExerciseId, data) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    // Update in database
    workoutDb.updateSet(setId, data);

    // Update local state
    const updatedExercises = currentWorkout.exercises.map((exercise) => {
      if (exercise.id !== workoutExerciseId) return exercise;

      const updatedSets = exercise.sets.map((s) =>
        s.id === setId ? { ...s, ...data } : s
      );

      // Check if all sets are completed → auto-complete exercise
      const allSetsCompleted = updatedSets.every((s) => s.isCompleted);
      if (allSetsCompleted !== exercise.isCompleted) {
        workoutDb.markExerciseCompleted(exercise.id, allSetsCompleted);
      }

      return {
        ...exercise,
        sets: updatedSets,
        isCompleted: allSetsCompleted,
      };
    });

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: updatedExercises,
      },
    });
  },

  /**
   * Toggle a set's completion checkbox.
   */
  toggleSetCompletion: (setId, workoutExerciseId) => {
    const { currentWorkout, updateSet: updateSetAction } = get();
    if (!currentWorkout) return;

    // Find current state
    const exercise = currentWorkout.exercises.find((e) => e.id === workoutExerciseId);
    const setData = exercise?.sets.find((s) => s.id === setId);
    if (setData) {
      updateSetAction(setId, workoutExerciseId, { isCompleted: !setData.isCompleted });
    }
  },

  /**
   * Add a new set to a workout exercise.
   */
  addSet: (workoutExerciseId) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const exercise = currentWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!exercise) return;

    const newSetNumber = exercise.sets.length + 1;
    const newSet = workoutDb.addSet(workoutExerciseId, newSetNumber);

    const updatedExercises = currentWorkout.exercises.map((e) =>
      e.id === workoutExerciseId
        ? { ...e, sets: [...e.sets, newSet], isCompleted: false }
        : e
    );

    set({ currentWorkout: { ...currentWorkout, exercises: updatedExercises } });
  },

  /**
   * Remove a set from a workout exercise.
   */
  removeSet: (setId, workoutExerciseId) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    workoutDb.removeSet(setId);

    const updatedExercises = currentWorkout.exercises.map((e) => {
      if (e.id !== workoutExerciseId) return e;
      const filteredSets = e.sets
        .filter((s) => s.id !== setId)
        .map((s, i) => ({ ...s, setNumber: i + 1 })); // Re-number
      return {
        ...e,
        sets: filteredSets,
        isCompleted: filteredSets.length > 0 && filteredSets.every((s) => s.isCompleted),
      };
    });

    set({ currentWorkout: { ...currentWorkout, exercises: updatedExercises } });
  },

  /**
   * Add a new exercise to the current workout.
   */
  addExerciseToWorkout: (exercise) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const sortOrder = currentWorkout.exercises.length;
    const workoutExercise = workoutDb.addExerciseToWorkout(
      currentWorkout.id,
      exercise,
      sortOrder
    );

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, workoutExercise],
      },
    });
  },

  /**
   * Complete the entire workout.
   * Calculates volume, logs exercise history, marks as done.
   */
  completeWorkout: () => {
    const { currentWorkout, workoutStartTime } = get();
    if (!currentWorkout) return;

    // Calculate total volume from completed sets
    const totalVolume = calculateTotalVolume(currentWorkout.exercises);

    // Calculate duration
    const durationMinutes = workoutStartTime
      ? Math.round((Date.now() - workoutStartTime) / 60000)
      : 0;

    // Mark workout as complete in DB
    workoutDb.completeWorkout(currentWorkout.id, totalVolume, durationMinutes);

    // Log each exercise's history for progressive overload tracking
    currentWorkout.exercises.forEach((exercise) => {
      const completedSets = exercise.sets.filter((s) => s.isCompleted);
      if (completedSets.length === 0) return;

      const maxWeight = Math.max(...completedSets.map((s) => s.weight));
      const totalSets = completedSets.length;
      const totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
      const exerciseVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

      historyDb.logExerciseHistory(
        exercise.exerciseId,
        currentWorkout.date,
        maxWeight,
        totalSets,
        totalReps,
        exerciseVolume
      );
    });

    // Update local state
    set({
      currentWorkout: {
        ...currentWorkout,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        totalVolume,
        durationMinutes,
      },
      isActive: false,
      workoutStartTime: null,
    });
  },

  /**
   * Clear the current workout from state.
   */
  clearCurrentWorkout: () => {
    set({ currentWorkout: null, isActive: false, workoutStartTime: null });
  },
}));
