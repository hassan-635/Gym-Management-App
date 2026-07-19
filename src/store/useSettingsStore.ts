/**
 * store/useSettingsStore.ts — Settings state management
 * 
 * Persists all app settings via AsyncStorage.
 * Includes workout schedule, notifications, timer, and theme config.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DaySchedule, DEFAULT_SETTINGS } from '../types/settings';
import { STORAGE_KEYS } from '../utils/constants';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateScheduleDay: (dayIndex: number, updates: Partial<DaySchedule>) => Promise<void>;
  toggleWorkoutDay: (dayIndex: number) => Promise<void>;
  setExercisesForDay: (dayIndex: number, exerciseIds: string[]) => Promise<void>;
  addExerciseToDay: (dayIndex: number, exerciseId: string) => Promise<void>;
  removeExerciseFromDay: (dayIndex: number, exerciseId: string) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  /**
   * Load settings from AsyncStorage on app startup.
   * Falls back to defaults if no saved settings exist.
   */
  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        // Merge with defaults to ensure new settings fields are included
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        set({ settings: merged, isLoaded: true });
      } else {
        // First launch — save defaults
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        set({ 
          settings: { 
            ...DEFAULT_SETTINGS, 
            firstLaunchDate: new Date().toISOString() 
          }, 
          isLoaded: true 
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ settings: DEFAULT_SETTINGS, isLoaded: true });
    }
  },

  /**
   * Update one or more settings and persist to AsyncStorage.
   */
  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    set({ settings: newSettings });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  /**
   * Update a specific day in the schedule.
   */
  updateScheduleDay: async (dayIndex, updates) => {
    const { settings, updateSettings } = get();
    const newSchedule = settings.weekSchedule.map((day) =>
      day.dayIndex === dayIndex ? { ...day, ...updates } : day
    );
    await updateSettings({ weekSchedule: newSchedule });
  },

  /**
   * Toggle whether a day is a workout day or rest day.
   */
  toggleWorkoutDay: async (dayIndex) => {
    const { settings, updateScheduleDay } = get();
    const day = settings.weekSchedule.find((d) => d.dayIndex === dayIndex);
    if (day) {
      await updateScheduleDay(dayIndex, { isWorkoutDay: !day.isWorkoutDay });
    }
  },

  /**
   * Set the complete list of exercises for a specific day.
   */
  setExercisesForDay: async (dayIndex, exerciseIds) => {
    await get().updateScheduleDay(dayIndex, { exerciseIds });
  },

  /**
   * Add a single exercise to a day's schedule.
   */
  addExerciseToDay: async (dayIndex, exerciseId) => {
    const { settings } = get();
    const day = settings.weekSchedule.find((d) => d.dayIndex === dayIndex);
    if (day && !day.exerciseIds.includes(exerciseId)) {
      await get().updateScheduleDay(dayIndex, {
        exerciseIds: [...day.exerciseIds, exerciseId],
      });
    }
  },

  /**
   * Remove an exercise from a day's schedule.
   */
  removeExerciseFromDay: async (dayIndex, exerciseId) => {
    const { settings } = get();
    const day = settings.weekSchedule.find((d) => d.dayIndex === dayIndex);
    if (day) {
      await get().updateScheduleDay(dayIndex, {
        exerciseIds: day.exerciseIds.filter((id) => id !== exerciseId),
      });
    }
  },

  /**
   * Reset all settings to defaults.
   */
  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
}));
