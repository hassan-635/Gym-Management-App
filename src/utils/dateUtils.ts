/**
 * utils/dateUtils.ts — Date utility functions using Day.js
 * 
 * Wraps Day.js for consistent date formatting, comparison,
 * and streak calculation throughout the app.
 */
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekday from 'dayjs/plugin/weekday';

// Extend Day.js with plugins
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.extend(weekday);

// ── Formatting ──

/** Format date as 'YYYY-MM-DD' for database storage */
export const formatDateForDb = (date?: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

/** Format date for display: 'Mon, Jan 15' */
export const formatDateShort = (date: string | Date): string => {
  return dayjs(date).format('ddd, MMM D');
};

/** Format date for display: 'Monday, January 15, 2025' */
export const formatDateFull = (date: string | Date): string => {
  return dayjs(date).format('dddd, MMMM D, YYYY');
};

/** Format date as relative time: '2 days ago', 'today' */
export const formatRelativeDate = (date: string | Date): string => {
  const d = dayjs(date);
  if (d.isToday()) return 'Today';
  if (d.isYesterday()) return 'Yesterday';
  return d.fromNow();
};

/** Format time: '6:00 PM' */
export const formatTime = (hour: number, minute: number): string => {
  return dayjs().hour(hour).minute(minute).format('h:mm A');
};

/** Format seconds as mm:ss for timer display */
export const formatTimerDisplay = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// ── Queries ──

/** Get today's date as YYYY-MM-DD */
export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

/** Get the day of week index (0=Sunday, 6=Saturday) */
export const getDayOfWeek = (date?: string | Date): number => {
  return dayjs(date).day();
};

/** Get the day name (Monday, Tuesday, etc.) */
export const getDayName = (date?: string | Date): string => {
  return dayjs(date).format('dddd');
};

/** Check if a date is today */
export const isDateToday = (date: string | Date): boolean => {
  return dayjs(date).isToday();
};

/** Check if a date is in the past */
export const isDatePast = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/** Check if a date is in the future */
export const isDateFuture = (date: string | Date): boolean => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

// ── Streak Calculation ──

/**
 * Calculate the current workout streak from a list of completed workout dates.
 * A streak counts consecutive workout days (skipping designated rest days).
 * 
 * @param completedDates - Array of 'YYYY-MM-DD' strings (sorted descending)
 * @param restDays - Array of day indices that are rest days (e.g., [5] for Friday)
 * @returns Current streak count
 */
export const calculateStreak = (
  completedDates: string[],
  restDays: number[] = [5], // Friday by default
): number => {
  if (completedDates.length === 0) return 0;

  let streak = 0;
  let currentDate = dayjs();

  // If today hasn't been completed yet, start checking from yesterday
  // (unless today is a rest day)
  const todayStr = currentDate.format('YYYY-MM-DD');
  const todayDow = currentDate.day();
  
  if (!completedDates.includes(todayStr) && !restDays.includes(todayDow)) {
    // Today is a workout day but not completed — check if it's still ongoing
    // If it's before evening, give benefit of doubt; otherwise streak may be broken
    currentDate = currentDate.subtract(1, 'day');
  }

  // Walk backwards through dates
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dow = currentDate.day();

    if (completedDates.includes(dateStr)) {
      streak++;
      currentDate = currentDate.subtract(1, 'day');
    } else if (restDays.includes(dow)) {
      // Rest day and didn't workout — skip, don't break streak
      currentDate = currentDate.subtract(1, 'day');
    } else {
      // Workout day not completed — streak broken
      break;
    }
  }

  return streak;
};

/**
 * Calculate the longest streak ever achieved.
 */
export const calculateLongestStreak = (
  completedDates: string[],
  restDays: number[] = [5] // Friday by default
): number => {
  if (completedDates.length === 0) return 0;

  // We can just iterate backwards from the most recent workout to the oldest
  // The logic is similar, but we check gaps between workouts.
  
  // Sort dates descending
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  // Start from the most recent workout
  let currentDate = dayjs(sorted[0]);

  // We will loop back in time indefinitely until we run out of workouts to process.
  // Actually, we can just walk backwards day by day from the newest workout 
  // to the oldest workout.
  const oldestDate = dayjs(sorted[sorted.length - 1]);
  const daysDiff = currentDate.diff(oldestDate, 'day') + 1; // +1 to include the oldest day

  for (let i = 0; i < daysDiff + 5; i++) { // small buffer
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dow = currentDate.day();

    if (sorted.includes(dateStr)) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      currentDate = currentDate.subtract(1, 'day');
    } else if (restDays.includes(dow)) {
      // Rest day without a workout doesn't break the streak
      currentDate = currentDate.subtract(1, 'day');
    } else {
      // Streak broken
      currentStreak = 0;
      currentDate = currentDate.subtract(1, 'day');
    }
  }

  return maxStreak;
};

// ── Date Ranges ──

/** Get the start and end of the current week */
export const getCurrentWeekRange = (): { start: string; end: string } => {
  const start = dayjs().startOf('week').format('YYYY-MM-DD');
  const end = dayjs().endOf('week').format('YYYY-MM-DD');
  return { start, end };
};

/** Get dates for the current week as an array */
export const getCurrentWeekDates = (): string[] => {
  const start = dayjs().startOf('week');
  return Array.from({ length: 7 }, (_, i) =>
    start.add(i, 'day').format('YYYY-MM-DD')
  );
};

/** Get the month label from a date */
export const getMonthLabel = (date: string | Date): string => {
  return dayjs(date).format('MMM');
};
