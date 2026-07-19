/**
 * store/useExerciseStore.ts — Exercise state management
 * 
 * Manages the exercise library with SQLite-backed CRUD operations.
 * Supports search, filter by muscle group, and exercise management.
 */
import { create } from 'zustand';
import { Exercise, ExerciseFormData, MuscleGroup } from '../types/exercise';
import * as exerciseDb from '../database/exerciseDb';

interface ExerciseState {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  selectedMuscleGroup: MuscleGroup | null;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  loadExercises: () => void;
  addExercise: (data: ExerciseFormData) => Exercise | null;
  updateExercise: (id: string, data: ExerciseFormData) => void;
  deleteExercise: (id: string) => void;
  setMuscleGroupFilter: (group: MuscleGroup | null) => void;
  setSearchQuery: (query: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  getExercisesByIds: (ids: string[]) => Exercise[];
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  filteredExercises: [],
  selectedMuscleGroup: null,
  searchQuery: '',
  isLoading: false,

  /**
   * Load all exercises from SQLite.
   */
  loadExercises: () => {
    set({ isLoading: true });
    try {
      const exercises = exerciseDb.getAllExercises();
      set({ exercises, isLoading: false });
      // Apply current filters
      get().setMuscleGroupFilter(get().selectedMuscleGroup);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Add a new exercise. Returns the created exercise or null if name exists.
   */
  addExercise: (data) => {
    // Check for duplicate name
    if (exerciseDb.exerciseExists(data.name)) {
      return null;
    }
    
    const exercise = exerciseDb.createExercise(data);
    const { exercises } = get();
    const updated = [...exercises, exercise].sort((a, b) => a.name.localeCompare(b.name));
    set({ exercises: updated });
    // Re-apply filters
    get().setMuscleGroupFilter(get().selectedMuscleGroup);
    return exercise;
  },

  /**
   * Update an existing exercise.
   */
  updateExercise: (id, data) => {
    exerciseDb.updateExercise(id, data);
    const { exercises } = get();
    const updated = exercises.map((e) =>
      e.id === id ? { ...e, name: data.name, muscleGroup: data.muscleGroup } : e
    );
    set({ exercises: updated });
    get().setMuscleGroupFilter(get().selectedMuscleGroup);
  },

  /**
   * Delete an exercise.
   */
  deleteExercise: (id) => {
    exerciseDb.deleteExercise(id);
    const { exercises } = get();
    set({ exercises: exercises.filter((e) => e.id !== id) });
    get().setMuscleGroupFilter(get().selectedMuscleGroup);
  },

  /**
   * Filter exercises by muscle group. Pass null to show all.
   */
  setMuscleGroupFilter: (group) => {
    const { exercises, searchQuery } = get();
    let filtered = group
      ? exercises.filter((e) => e.muscleGroup === group)
      : exercises;

    // Also apply search if active
    if (searchQuery) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({ selectedMuscleGroup: group, filteredExercises: filtered });
  },

  /**
   * Search exercises by name.
   */
  setSearchQuery: (query) => {
    const { exercises, selectedMuscleGroup } = get();
    let filtered = selectedMuscleGroup
      ? exercises.filter((e) => e.muscleGroup === selectedMuscleGroup)
      : exercises;

    if (query) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    set({ searchQuery: query, filteredExercises: filtered });
  },

  /**
   * Get a single exercise by ID from the loaded list.
   */
  getExerciseById: (id) => {
    return get().exercises.find((e) => e.id === id);
  },

  /**
   * Get multiple exercises by their IDs.
   */
  getExercisesByIds: (ids) => {
    return get().exercises.filter((e) => ids.includes(e.id));
  },
}));
