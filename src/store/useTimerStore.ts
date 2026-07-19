/**
 * store/useTimerStore.ts — Rest timer state management
 * 
 * Manages the countdown rest timer between sets.
 * Supports start, pause, resume, reset, and custom duration.
 */
import { create } from 'zustand';
import { TIMER } from '../utils/constants';

interface TimerState {
  /** Current remaining seconds */
  remainingSeconds: number;
  /** Total duration for current timer */
  totalSeconds: number;
  /** Whether timer is actively counting down */
  isRunning: boolean;
  /** Whether timer has completed (hit zero) */
  isCompleted: boolean;
  /** Whether timer overlay is visible */
  isVisible: boolean;
  /** Interval ID for cleanup */
  intervalId: ReturnType<typeof setInterval> | null;

  // Actions
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  hideTimer: () => void;
  showTimer: () => void;
  tick: () => void;
  setDuration: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  remainingSeconds: TIMER.DEFAULT_DURATION,
  totalSeconds: TIMER.DEFAULT_DURATION,
  isRunning: false,
  isCompleted: false,
  isVisible: false,
  intervalId: null,

  /**
   * Start the rest timer with optional custom duration.
   */
  startTimer: (duration) => {
    const { intervalId: existingInterval } = get();
    
    // Clear any existing interval
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const totalSeconds = duration ?? get().totalSeconds;

    // Create new interval that ticks every second
    const newInterval = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      remainingSeconds: totalSeconds,
      totalSeconds,
      isRunning: true,
      isCompleted: false,
      isVisible: true,
      intervalId: newInterval,
    });
  },

  /**
   * Pause the timer.
   */
  pauseTimer: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({ isRunning: false, intervalId: null });
  },

  /**
   * Resume a paused timer.
   */
  resumeTimer: () => {
    const { isCompleted } = get();
    if (isCompleted) return;

    const newInterval = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, intervalId: newInterval });
  },

  /**
   * Reset the timer to the full duration.
   */
  resetTimer: () => {
    const { intervalId, totalSeconds } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      remainingSeconds: totalSeconds,
      isRunning: false,
      isCompleted: false,
      intervalId: null,
    });
  },

  /**
   * Hide the timer overlay.
   */
  hideTimer: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      isVisible: false,
      isRunning: false,
      isCompleted: false,
      intervalId: null,
    });
  },

  /**
   * Show the timer overlay.
   */
  showTimer: () => {
    set({ isVisible: true });
  },

  /**
   * Tick the timer down by 1 second.
   * Called by the interval every 1000ms.
   */
  tick: () => {
    const { remainingSeconds, intervalId } = get();

    if (remainingSeconds <= 1) {
      // Timer complete!
      if (intervalId) {
        clearInterval(intervalId);
      }
      set({
        remainingSeconds: 0,
        isRunning: false,
        isCompleted: true,
        intervalId: null,
      });
    } else {
      set({ remainingSeconds: remainingSeconds - 1 });
    }
  },

  /**
   * Update the timer duration (from settings).
   */
  setDuration: (seconds) => {
    set({
      totalSeconds: seconds,
      remainingSeconds: seconds,
    });
  },
}));
