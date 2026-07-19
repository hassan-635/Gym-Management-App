/**
 * services/notificationService.ts — Local push notification management
 * 
 * Schedules daily workout reminders using expo-notifications.
 * Works 100% offline — no server required.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION } from '../utils/constants';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * Must be called before scheduling any notifications.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Schedule a daily workout reminder notification.
 * Cancels any existing reminder before scheduling a new one.
 * 
 * @param hour - Hour of day (0-23), default 18 (6 PM)
 * @param minute - Minute of hour (0-59), default 0
 */
export const scheduleDailyReminder = async (
  hour: number = 18,
  minute: number = 0
): Promise<string | null> => {
  try {
    // Cancel existing reminders first
    await cancelAllReminders();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION.CHANNEL_ID, {
        name: NOTIFICATION.CHANNEL_NAME,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    }

    // Schedule daily repeating notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION.DEFAULT_TITLE,
        body: NOTIFICATION.DEFAULT_BODY,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: NOTIFICATION.CHANNEL_ID,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`📅 Daily reminder scheduled at ${hour}:${minute.toString().padStart(2, '0')}`);
    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

/**
 * Get all currently scheduled notifications (for debugging).
 */
export const getScheduledNotifications = async () => {
  return Notifications.getAllScheduledNotificationsAsync();
};
