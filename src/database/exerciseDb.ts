/**
 * database/exerciseDb.ts — Exercise CRUD operations (Zustand Adapter)
 * 
 * All database operations for exercise management.
 * Exercises are user-created and stored locally via Zustand.
 */
import { useDataStore } from '../store/useDataStore';
import { Exercise, ExerciseFormData, MuscleGroup } from '../types/exercise';
import { generateUUID } from '../utils/helpers';

/**
 * Get all exercises, optionally filtered by muscle group.
 */
export const getAllExercises = (muscleGroup?: MuscleGroup): Exercise[] => {
  const state = useDataStore.getState();
  let exercises = state.exercises;
  
  if (muscleGroup) {
    exercises = exercises.filter(e => e.muscleGroup === muscleGroup);
  }
  
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get a single exercise by ID.
 */
export const getExerciseById = (id: string): Exercise | null => {
  const state = useDataStore.getState();
  return state.exercises.find(e => e.id === id) || null;
};

/**
 * Create a new exercise.
 */
export const createExercise = (data: ExerciseFormData): Exercise => {
  const id = generateUUID();
  const createdAt = new Date().toISOString();

  const exercise: Exercise = {
    id,
    name: data.name.trim(),
    muscleGroup: data.muscleGroup,
    isCustom: true,
    createdAt,
  };

  useDataStore.getState().addExercise(exercise);
  return exercise;
};

/**
 * Update an existing exercise.
 */
export const updateExercise = (id: string, data: ExerciseFormData): void => {
  const exercise = getExerciseById(id);
  if (exercise) {
    useDataStore.getState().updateExercise({
      ...exercise,
      name: data.name.trim(),
      muscleGroup: data.muscleGroup,
    });
  }
};

/**
 * Delete an exercise and all related history.
 * Handles cascade deletion from workouts and history manually.
 */
export const deleteExercise = (id: string): void => {
  const state = useDataStore.getState();
  
  state.deleteExercise(id);
  
  // Cascade delete workout_exercises
  const updatedWorkouts = state.workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.filter(we => we.exerciseId !== id)
  }));
  state.setWorkouts(updatedWorkouts);
  
  // Cascade delete history
  const updatedHistory = state.exerciseHistory.filter(h => h.exerciseId !== id);
  state.setExerciseHistory(updatedHistory);
};

/**
 * Search exercises by name (case-insensitive).
 */
export const searchExercises = (query: string): Exercise[] => {
  const state = useDataStore.getState();
  const lowerQuery = query.toLowerCase();
  
  return state.exercises
    .filter(e => e.name.toLowerCase().includes(lowerQuery))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Check if an exercise with the given name already exists.
 */
export const exerciseExists = (name: string): boolean => {
  const state = useDataStore.getState();
  const lowerName = name.trim().toLowerCase();
  return state.exercises.some(e => e.name.toLowerCase() === lowerName);
};

/**
 * Get exercise count by muscle group (for stats).
 */
export const getExerciseCountByMuscle = (): Record<string, number> => {
  const state = useDataStore.getState();
  
  return state.exercises.reduce((acc, exercise) => {
    acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};
