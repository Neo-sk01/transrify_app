/**
 * Permission management utilities
 * Handles requesting and tracking location and notification permissions
 * 
 * Requirements:
 * - 34.1: Request foreground location permission on first authentication
 * - 34.2: Request notification permission on first authentication
 * - 34.3: Explain location is needed for proximity alerts
 * - 34.4: Explain notifications are needed for background alerts
 * - 34.5: Continue to function when permissions are denied
 */

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import * as storage from './storage';

// Storage keys for permission status
const PERMISSION_KEYS = {
  LOCATION_REQUESTED: 'permissions_location_requested',
  NOTIFICATION_REQUESTED: 'permissions_notification_requested',
} as const;

/**
 * Check if location permission has been requested before
 */
async function hasRequestedLocationPermission(): Promise<boolean> {
  try {
    const value = await storage.getItem(PERMISSION_KEYS.LOCATION_REQUESTED);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if notification permission has been requested before
 */
async function hasRequestedNotificationPermission(): Promise<boolean> {
  try {
    const value = await storage.getItem(PERMISSION_KEYS.NOTIFICATION_REQUESTED);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark location permission as requested
 */
async function markLocationPermissionRequested(): Promise<void> {
  try {
    await storage.setItem(PERMISSION_KEYS.LOCATION_REQUESTED, 'true');
  } catch (error) {
    console.warn('Failed to mark location permission as requested:', error);
  }
}

/**
 * Mark notification permission as requested
 */
async function markNotificationPermissionRequested(): Promise<void> {
  try {
    await storage.setItem(PERMISSION_KEYS.NOTIFICATION_REQUESTED, 'true');
  } catch (error) {
    console.warn('Failed to mark notification permission as requested:', error);
  }
}

/**
 * Request location permission with rationale
 * Shows explanation before requesting permission
 * 
 * @returns Promise<boolean> - true if granted, false if denied
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    // Check if already requested
    const alreadyRequested = await hasRequestedLocationPermission();
    
    // Check current permission status
    const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
    
    // If already granted, no need to request again
    if (currentStatus === 'granted') {
      await markLocationPermissionRequested();
      return true;
    }
    
    // If not already requested, show rationale first
    if (!alreadyRequested) {
      // Show rationale alert explaining why we need location
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Location Permission',
          'We use your location to enhance security and provide emergency assistance if needed. This enables proximity alerts when colleagues nearby are in distress.',
          [
            {
              text: 'Continue',
              onPress: () => resolve(),
            },
          ],
          { cancelable: false }
        );
      });
    }
    
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    // Mark as requested
    await markLocationPermissionRequested();
    
    // Handle permission result
    if (status === 'granted') {
      console.log('✅ Location permission granted');
      return true;
    } else {
      console.warn('⚠️ Location permission denied - alert features will be limited');
      return false;
    }
  } catch (error) {
    console.error('Failed to request location permission:', error);
    // Mark as requested even on error to avoid repeated prompts
    await markLocationPermissionRequested();
    return false;
  }
}

/**
 * Request notification permission with rationale
 * Shows explanation before requesting permission
 * 
 * @returns Promise<boolean> - true if granted, false if denied
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Check if already requested
    const alreadyRequested = await hasRequestedNotificationPermission();
    
    // Check current permission status
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    
    // If already granted, no need to request again
    if (currentStatus === 'granted') {
      await markNotificationPermissionRequested();
      
      // Configure Android notification channel if needed
      if (Platform.OS === 'android') {
        await configureAndroidNotificationChannel();
      }
      
      return true;
    }
    
    // If not already requested, show rationale first
    if (!alreadyRequested) {
      // Show rationale alert explaining why we need notifications
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Notification Permission',
          'We need notification permission to alert you about critical security events, even when the app is in the background. This ensures you receive timely proximity alerts.',
          [
            {
              text: 'Continue',
              onPress: () => resolve(),
            },
          ],
          { cancelable: false }
        );
      });
    }
    
    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    
    // Mark as requested
    await markNotificationPermissionRequested();
    
    // Handle permission result
    if (status === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await configureAndroidNotificationChannel();
      }
      
      return true;
    } else {
      console.warn('⚠️ Notification permission denied - background alerts will not work');
      return false;
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    // Mark as requested even on error to avoid repeated prompts
    await markNotificationPermissionRequested();
    return false;
  }
}

/**
 * Configure Android notification channel for duress alerts
 */
async function configureAndroidNotificationChannel(): Promise<void> {
  try {
    await Notifications.setNotificationChannelAsync('duress-alerts', {
      name: 'Duress Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5252',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
      description: 'Critical alerts for nearby duress situations',
    });
  } catch (error) {
    console.warn('Failed to configure Android notification channel:', error);
  }
}

/**
 * Request all required permissions for alert functionality
 * Should be called on first launch or after authentication
 * 
 * @returns Promise<{ location: boolean; notification: boolean }>
 */
export async function requestAlertPermissions(): Promise<{
  location: boolean;
  notification: boolean;
}> {
  // Request location permission first
  const locationGranted = await requestLocationPermission();
  
  // Request notification permission second
  const notificationGranted = await requestNotificationPermission();
  
  return {
    location: locationGranted,
    notification: notificationGranted,
  };
}

/**
 * Check if all alert permissions are granted
 * 
 * @returns Promise<boolean> - true if both location and notification are granted
 */
export async function checkAlertPermissions(): Promise<boolean> {
  try {
    const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
    const { status: notificationStatus } = await Notifications.getPermissionsAsync();
    
    return locationStatus === 'granted' && notificationStatus === 'granted';
  } catch (error) {
    console.error('Failed to check alert permissions:', error);
    return false;
  }
}
