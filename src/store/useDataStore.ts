import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../types/exercise';
import { Workout } from '../types/workout';
import { ExerciseHistoryEntry } from '../types/stats';

interface DataState {
  exercises: Exercise[];
  workouts: Workout[];
  exerciseHistory: ExerciseHistoryEntry[];
  
  // Actions
  setExercises: (exercises: Exercise[]) => void;
  setWorkouts: (workouts: Workout[]) => void;
  setExerciseHistory: (history: ExerciseHistoryEntry[]) => void;
  
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  
  addWorkout: (workout: Workout) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  
  addHistoryEntry: (entry: ExerciseHistoryEntry) => void;
  
  resetData: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      exercises: [],
      workouts: [],
      exerciseHistory: [],
      
      setExercises: (exercises) => set({ exercises }),
      setWorkouts: (workouts) => set({ workouts }),
      setExerciseHistory: (exerciseHistory) => set({ exerciseHistory }),
      
      addExercise: (exercise) => set((state) => ({ exercises: [...state.exercises, exercise] })),
      updateExercise: (exercise) => set((state) => ({
        exercises: state.exercises.map(e => e.id === exercise.id ? exercise : e)
      })),
      deleteExercise: (id) => set((state) => ({
        exercises: state.exercises.filter(e => e.id !== id)
      })),
      
      addWorkout: (workout) => set((state) => ({ workouts: [...state.workouts, workout] })),
      updateWorkout: (workout) => set((state) => ({
        workouts: state.workouts.map(w => w.id === workout.id ? workout : w)
      })),
      deleteWorkout: (id) => set((state) => ({
        workouts: state.workouts.filter(w => w.id !== id)
      })),
      
      addHistoryEntry: (entry) => set((state) => ({
        exerciseHistory: [...state.exerciseHistory, entry]
      })),
      
      resetData: () => set({ exercises: [], workouts: [], exerciseHistory: [] })
    }),
    {
      name: '@gym_tracker/data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
