/**
 * database/workoutDb.ts — Workout CRUD operations (Zustand Adapter)
 * 
 * Manages workout sessions, exercise assignments, and set tracking.
 * Handles auto-completion logic and volume calculation using Zustand.
 */
import { useDataStore } from '../store/useDataStore';
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary } from '../types/workout';
import { generateUUID } from '../utils/helpers';
import { getDayOfWeek } from '../utils/dateUtils';

export const getWorkoutByDate = (date: string): Workout | null => {
  const state = useDataStore.getState();
  return state.workouts.find(w => w.date === date) || null;
};

export const createWorkout = (
  date: string,
  exerciseIds: string[],
  exerciseDetails: Array<{ id: string; name: string; muscleGroup: string }>
): Workout => {
  const workoutId = generateUUID();
  const dayOfWeek = getDayOfWeek(date);

  const exercises: WorkoutExercise[] = exerciseDetails.map((exercise, index) => {
    const workoutExerciseId = generateUUID();
    
    // Create 3 default sets for each exercise
    const sets: WorkoutSet[] = Array.from({ length: 3 }, (_, i) => ({
      id: generateUUID(),
      workoutExerciseId,
      setNumber: i + 1,
      reps: 0,
      weight: 0,
      isCompleted: false,
    }));

    const baseExercise = useDataStore.getState().exercises.find(e => e.id === exercise.id);

    return {
      id: workoutExerciseId,
      workoutId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets,
      isCompleted: false,
      sortOrder: index,
      targetMinReps: baseExercise?.targetMinReps,
      targetMaxReps: baseExercise?.targetMaxReps,
    };
  });

  const workout: Workout = {
    id: workoutId,
    date,
    dayOfWeek,
    exercises,
    isCompleted: false,
    completedAt: null,
    totalVolume: 0,
    durationMinutes: 0,
  };

  useDataStore.getState().addWorkout(workout);
  return workout;
};

export const updateSet = (
  setId: string,
  data: { reps?: number; weight?: number; isCompleted?: boolean }
): void => {
  const state = useDataStore.getState();
  const updatedWorkouts = state.workouts.map(workout => {
    let changed = false;
    const newExercises = workout.exercises.map(ex => {
      const setExists = ex.sets.some(s => s.id === setId);
      if (!setExists) return ex;
      
      changed = true;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, ...data } : s)
      };
    });
    
    return changed ? { ...workout, exercises: newExercises } : workout;
  });
  
  state.setWorkouts(updatedWorkouts);
};

export const addSet = (workoutExerciseId: string, setNumber: number): WorkoutSet => {
  const setId = generateUUID();
  const newSet: WorkoutSet = {
    id: setId,
    workoutExerciseId,
    setNumber,
    reps: 0,
    weight: 0,
    isCompleted: false,
  };

  const state = useDataStore.getState();
  const updatedWorkouts = state.workouts.map(workout => {
    let changed = false;
    const newExercises = workout.exercises.map(ex => {
      if (ex.id !== workoutExerciseId) return ex;
      changed = true;
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    return changed ? { ...workout, exercises: newExercises } : workout;
  });
  
  state.setWorkouts(updatedWorkouts);
  return newSet;
};

export const removeSet = (setId: string): void => {
  const state = useDataStore.getState();
  const updatedWorkouts = state.workouts.map(workout => {
    let changed = false;
    const newExercises = workout.exercises.map(ex => {
      const setExists = ex.sets.some(s => s.id === setId);
      if (!setExists) return ex;
      changed = true;
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
    });
    return changed ? { ...workout, exercises: newExercises } : workout;
  });
  
  state.setWorkouts(updatedWorkouts);
};

export const markExerciseCompleted = (workoutExerciseId: string, isCompleted: boolean): void => {
  const state = useDataStore.getState();
  const updatedWorkouts = state.workouts.map(workout => {
    let changed = false;
    const newExercises = workout.exercises.map(ex => {
      if (ex.id !== workoutExerciseId) return ex;
      changed = true;
      return { ...ex, isCompleted };
    });
    return changed ? { ...workout, exercises: newExercises } : workout;
  });
  
  state.setWorkouts(updatedWorkouts);
};

export const completeWorkout = (workoutId: string, totalVolume: number, durationMinutes: number): void => {
  const state = useDataStore.getState();
  const workout = state.workouts.find(w => w.id === workoutId);
  
  if (workout) {
    state.updateWorkout({
      ...workout,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      totalVolume,
      durationMinutes,
    });
  }
};

export const getWorkoutHistory = (limit: number = 50, offset: number = 0): WorkoutSummary[] => {
  const state = useDataStore.getState();
  const sortedWorkouts = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date));
  const paginated = sortedWorkouts.slice(offset, offset + limit);
  
  return paginated.map(w => ({
    id: w.id,
    date: w.date,
    dayOfWeek: w.dayOfWeek,
    isCompleted: w.isCompleted,
    totalVolume: w.totalVolume,
    durationMinutes: w.durationMinutes,
    exerciseCount: w.exercises.length,
    completedExerciseCount: w.exercises.filter(ex => ex.isCompleted).length,
  }));
};

export const getCompletedWorkoutDates = (): string[] => {
  const state = useDataStore.getState();
  return state.workouts
    .filter(w => w.isCompleted)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(w => w.date);
};

export const deleteWorkout = (workoutId: string): void => {
  useDataStore.getState().deleteWorkout(workoutId);
};

export const addExerciseToWorkout = (
  workoutId: string,
  exercise: { id: string; name: string; muscleGroup: string },
  sortOrder: number
): WorkoutExercise => {
  const workoutExerciseId = generateUUID();
  
  const sets: WorkoutSet[] = Array.from({ length: 3 }, (_, i) => ({
    id: generateUUID(),
    workoutExerciseId,
    setNumber: i + 1,
    reps: 0,
    weight: 0,
    isCompleted: false,
  }));

  const baseExercise = useDataStore.getState().exercises.find(e => e.id === exercise.id);

  const newExercise: WorkoutExercise = {
    id: workoutExerciseId,
    workoutId,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets,
    isCompleted: false,
    sortOrder,
    targetMinReps: baseExercise?.targetMinReps,
    targetMaxReps: baseExercise?.targetMaxReps,
  };

  const state = useDataStore.getState();
  const workout = state.workouts.find(w => w.id === workoutId);
  
  if (workout) {
    state.updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise].sort((a, b) => a.sortOrder - b.sortOrder)
    });
  }

  return newExercise;
};
