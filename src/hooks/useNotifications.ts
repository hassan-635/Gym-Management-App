/**
 * hooks/useNotifications.ts — Notification setup hook
 * 
 * Handles notification permission requests and scheduling
 * daily reminders based on user settings.
 */
import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { scheduleDailyReminder, cancelAllReminders } from '../services/notificationService';

/**
 * Hook that manages notification scheduling based on settings.
 * Automatically reschedules when reminder time changes.
 */
export const useNotifications = () => {
  const { settings } = useSettingsStore();

  useEffect(() => {
    const setupNotifications = async () => {
      if (settings.reminderEnabled) {
        await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
      } else {
        await cancelAllReminders();
      }
    };

    setupNotifications();
  }, [settings.reminderEnabled, settings.reminderHour, settings.reminderMinute]);
};
