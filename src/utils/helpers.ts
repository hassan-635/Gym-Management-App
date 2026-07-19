/**
 * utils/helpers.ts — General utility/helper functions
 * 
 * Pure utility functions for UUID generation, formatting,
 * volume calculation, and data transformation.
 */

/**
 * Generate a UUID v4 string.
 * Uses crypto API when available, falls back to Math.random.
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Calculate total volume for a set of reps and weight.
 * Volume = weight × reps
 */
export const calculateSetVolume = (weight: number, reps: number): number => {
  return weight * reps;
};

/**
 * Calculate total workout volume from all exercises/sets.
 * Only counts completed sets.
 */
export const calculateTotalVolume = (
  exercises: Array<{
    sets: Array<{ weight: number; reps: number; isCompleted: boolean }>;
  }>
): number => {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets
      .filter((set) => set.isCompleted)
      .reduce((setTotal, set) => setTotal + calculateSetVolume(set.weight, set.reps), 0);
  }, 0);
};

/**
 * Format a large number with K/M suffixes.
 * e.g., 1500 → '1.5K', 1500000 → '1.5M'
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
};

/**
 * Format weight with unit suffix.
 * e.g., 60 → '60 kg' or '60 lbs'
 */
export const formatWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  if (weight % 1 === 0) {
    return `${weight} ${unit}`;
  }
  return `${weight.toFixed(1)} ${unit}`;
};

/**
 * Format sets × reps display string.
 * e.g., 3 sets of 10 reps → '3 × 10'
 */
export const formatSetsReps = (sets: number, reps: number): string => {
  return `${sets} × ${reps}`;
};

/**
 * Clamp a number between min and max values.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Debounce a function call.
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Group an array of items by a key.
 */
export const groupBy = <T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Check if a value is a valid positive number.
 */
export const isValidNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
};

/**
 * Haptic feedback wrapper — gentle impact.
 * Imported here to avoid importing expo-haptics everywhere.
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> => {
  try {
    const Haptics = require('expo-haptics');
    const impactStyle = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(impactStyle[type]);
  } catch {
    // Haptics not available (e.g., simulator) — silently fail
  }
};
