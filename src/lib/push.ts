/**
 * Push notification registration utilities
 * Handles permission requests, token retrieval, and Android notification channel configuration
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Register for push notifications
 * Requests permissions and configures Android notification channel
 * @returns Promise<boolean> - true if permissions granted, false otherwise
 */
export async function registerForPushNotifications(): Promise<boolean> {
  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Handle permission denial gracefully
    if (finalStatus !== 'granted') {
      console.warn('Push notification permissions denied');
      return false;
    }

    // Configure Android notification channel for duress alerts
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('duress-alerts', {
        name: 'Duress Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250], // Vibration pattern: pause, vibrate, pause, vibrate
        lightColor: '#FF5252', // Red light for alert notifications
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        description: 'Critical alerts for nearby duress situations',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return false;
  }
}

/**
 * Get the Expo push token for this device
 * @returns Promise<string | null> - push token or null if unavailable
 */
export async function getPushTokenAsync(): Promise<string | null> {
  try {
    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.warn('Failed to get push token:', error);
    return null;
  }
}

/**
 * Configure default notification handler
 * Sets how notifications should be displayed when app is in foreground
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
