import { Alert } from 'react-native';

/**
 * Display a simple toast message using Alert.alert
 * Cross-platform compatible (iOS and Android)
 * 
 * @param message - The message to display
 */
export function toast(message: string): void {
  Alert.alert('', message);
}
