/**
 * navigation/types.ts — Type-safe navigation parameter lists
 * 
 * Defines all screen params for React Navigation type checking.
 */

/** Root stack navigator params */
export type RootStackParamList = {
  MainTabs: undefined;
  Workout: { date: string };
  ExerciseDetail: { exerciseId: string };
  AddExercise: undefined;
  EditSchedule: { dayIndex: number };
};

/** Bottom tab navigator params */
export type TabParamList = {
  Home: undefined;
  Exercises: undefined;
  Stats: undefined;
  History: undefined;
  Settings: undefined;
};
