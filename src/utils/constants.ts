/**
 * utils/constants.ts — App-wide constants and configuration
 * 
 * Central place for all magic numbers, default values,
 * and configuration constants used throughout the app.
 */

// ── App Info ──
export const APP_NAME = 'Gym Progress Tracker';
export const APP_VERSION = '1.0.0';

// ── Database ──
export const DB_NAME = 'gym_tracker.db';
export const DB_VERSION = 1;

// ── AsyncStorage Keys ──
export const STORAGE_KEYS = {
  SETTINGS: '@gym_tracker/settings',
  ONBOARDING: '@gym_tracker/onboarding',
  LAST_WORKOUT_DATE: '@gym_tracker/last_workout_date',
} as const;

// ── Notification ──
export const NOTIFICATION = {
  CHANNEL_ID: 'gym-reminder',
  CHANNEL_NAME: 'Gym Reminders',
  DEFAULT_TITLE: "It's Gym Time! 💪",
  DEFAULT_BODY: 'Time to crush your workout. Your muscles are waiting!',
  REST_DAY_TITLE: 'Rest Day 😴',
  REST_DAY_BODY: 'Enjoy your rest day! Recovery is part of the process.',
} as const;

// ── Rest Timer ──
export const TIMER = {
  DEFAULT_DURATION: 90,    // seconds
  MIN_DURATION: 30,        // seconds
  MAX_DURATION: 300,       // seconds (5 minutes)
  STEP: 15,                // increment/decrement step in seconds
} as const;

// ── Workout Defaults ──
export const WORKOUT = {
  DEFAULT_SETS: 3,
  DEFAULT_REPS: 10,
  DEFAULT_WEIGHT: 0,
  MIN_SETS: 1,
  MAX_SETS: 20,
  MIN_REPS: 1,
  MAX_REPS: 100,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 999,
  WEIGHT_INCREMENT: 2.5,   // kg increment for progressive overload
} as const;

// ── Progressive Overload ──
export const OVERLOAD = {
  /** Minimum sessions at same weight before suggesting increase */
  MIN_SESSIONS_FOR_SUGGESTION: 3,
  /** Default weight increase suggestion in kg */
  DEFAULT_INCREASE_KG: 2.5,
  /** For exercises < 20kg, suggest smaller increments */
  SMALL_INCREASE_KG: 1.25,
  /** Weight threshold for small increments */
  SMALL_WEIGHT_THRESHOLD: 20,
  /** Target reps that trigger overload suggestion */
  TARGET_REPS_MET_THRESHOLD: 0.9, // 90% of target reps achieved across sets
} as const;

// ── Days of Week ──
export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export const DAYS_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
] as const;

// ── Animation Durations (ms) ──
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
} as const;

// ── Screen Names ──
export const SCREENS = {
  HOME: 'Home',
  WORKOUT: 'Workout',
  EXERCISES: 'Exercises',
  EXERCISE_DETAIL: 'ExerciseDetail',
  HISTORY: 'History',
  STATS: 'Stats',
  SETTINGS: 'Settings',
  ADD_EXERCISE: 'AddExercise',
  EDIT_SCHEDULE: 'EditSchedule',
} as const;
