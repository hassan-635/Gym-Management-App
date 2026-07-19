/**
 * hooks/useRestTimer.ts — Rest timer hook with haptic feedback
 * 
 * Wraps the timer store with haptic/vibration on completion.
 * Provides a clean API for starting rest timer after set completion.
 */
import { useEffect, useCallback } from 'react';
import { useTimerStore } from '../store/useTimerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { triggerHaptic } from '../utils/helpers';

/**
 * Hook for managing the rest timer with settings integration.
 */
export const useRestTimer = () => {
  const timer = useTimerStore();
  const { settings } = useSettingsStore();

  // Sync timer duration with settings
  useEffect(() => {
    timer.setDuration(settings.restTimerDuration);
  }, [settings.restTimerDuration]);

  // Haptic feedback when timer completes
  useEffect(() => {
    if (timer.isCompleted && settings.vibrateOnTimerEnd) {
      triggerHaptic('heavy');
    }
  }, [timer.isCompleted]);

  /**
   * Start rest timer with the configured duration.
   */
  const startRest = useCallback(() => {
    timer.startTimer(settings.restTimerDuration);
    triggerHaptic('light');
  }, [settings.restTimerDuration]);

  /**
   * Progress percentage (0 to 1) for circular progress display.
   */
  const progress = timer.totalSeconds > 0
    ? 1 - (timer.remainingSeconds / timer.totalSeconds)
    : 0;

  return {
    ...timer,
    startRest,
    progress,
    duration: settings.restTimerDuration,
  };
};
