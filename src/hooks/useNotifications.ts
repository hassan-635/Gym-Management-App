/**
 * hooks/useNotifications.ts — Notification setup hook
 * 
 * Handles notification permission requests and scheduling
 * daily reminders based on user settings.
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { scheduleDailyReminder, cancelAllReminders } from '../services/notificationService';

/**
 * Hook that manages notification scheduling based on settings.
 * Automatically reschedules when reminder time changes.
 */
export const useNotifications = () => {
  const { settings, isLoaded: settingsLoaded } = useSettingsStore();

  useEffect(() => {
    // Skip notifications on web (not supported)
    if (Platform.OS === 'web') {
      console.log('🔔 useNotifications: Skipping notification setup on web');
      return;
    }

    // Only setup notifications after settings are loaded
    if (!settingsLoaded) {
      console.log('🔔 useNotifications: Settings not loaded yet, skipping notification setup');
      return;
    }

    console.log('🔔 useNotifications: Setting up notifications...');
    const setupNotifications = async () => {
      try {
        if (settings.reminderEnabled) {
          console.log('🔔 useNotifications: Scheduling daily reminder...');
          await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
        } else {
          console.log('🔔 useNotifications: Canceling all reminders...');
          await cancelAllReminders();
        }
        console.log('✅ useNotifications: Notifications setup complete');
      } catch (error) {
        console.error('❌ useNotifications: Failed to setup notifications:', error);
        // Don't crash the app if notifications fail
      }
    };

    setupNotifications();
  }, [settingsLoaded, settings.reminderEnabled, settings.reminderHour, settings.reminderMinute]);
};
