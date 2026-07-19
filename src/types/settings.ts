/**
 * types/settings.ts — Settings and configuration type definitions
 * 
 * All settings are persisted via AsyncStorage.
 * Includes workout schedule customization, timer, notifications, and theme.
 */

/** Theme options */
export type ThemeMode = 'dark' | 'light';

/** Individual day schedule configuration */
export interface DaySchedule {
  /** Day index (0=Sunday, 1=Monday, ..., 6=Saturday) */
  dayIndex: number;
  /** Day name for display */
  dayName: string;
  /** Short name (Mon, Tue, etc.) */
  dayShort: string;
  /** Whether this is a workout day */
  isWorkoutDay: boolean;
  /** IDs of exercises assigned to this day */
  exerciseIds: string[];
}

/** Complete app settings */
export interface AppSettings {
  // ── Notifications ──
  /** Hour for daily reminder (0-23) */
  reminderHour: number;
  /** Minute for daily reminder (0-59) */
  reminderMinute: number;
  /** Whether reminders are enabled */
  reminderEnabled: boolean;

  // ── Rest Timer ──
  /** Rest timer duration in seconds (30-300) */
  restTimerDuration: number;
  /** Whether to vibrate on timer completion */
  vibrateOnTimerEnd: boolean;

  // ── Theme ──
  /** Current theme mode */
  theme: ThemeMode;

  // ── Workout Schedule ──
  /** Weekly schedule configuration for each day */
  weekSchedule: DaySchedule[];

  // ── Units ──
  /** Weight unit preference */
  weightUnit: 'kg' | 'lbs';

  // ── App State ──
  /** Whether onboarding has been completed */
  onboardingComplete: boolean;
  /** First launch date for streak calculation */
  firstLaunchDate: string | null;
}

/** Default settings values */
export const DEFAULT_SETTINGS: AppSettings = {
  reminderHour: 18,         // 6:00 PM
  reminderMinute: 0,
  reminderEnabled: true,
  restTimerDuration: 90,    // 90 seconds
  vibrateOnTimerEnd: true,
  theme: 'dark',
  weightUnit: 'kg',
  onboardingComplete: false,
  firstLaunchDate: null,
  weekSchedule: [
    { dayIndex: 0, dayName: 'Sunday', dayShort: 'Sun', isWorkoutDay: true, exerciseIds: [] },
    { dayIndex: 1, dayName: 'Monday', dayShort: 'Mon', isWorkoutDay: true, exerciseIds: [] },
    { dayIndex: 2, dayName: 'Tuesday', dayShort: 'Tue', isWorkoutDay: true, exerciseIds: [] },
    { dayIndex: 3, dayName: 'Wednesday', dayShort: 'Wed', isWorkoutDay: true, exerciseIds: [] },
    { dayIndex: 4, dayName: 'Thursday', dayShort: 'Thu', isWorkoutDay: true, exerciseIds: [] },
    { dayIndex: 5, dayName: 'Friday', dayShort: 'Fri', isWorkoutDay: false, exerciseIds: [] },  // Rest day
    { dayIndex: 6, dayName: 'Saturday', dayShort: 'Sat', isWorkoutDay: true, exerciseIds: [] },
  ],
};
