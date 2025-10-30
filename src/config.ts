import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com';
export const TENANT_KEY = process.env.EXPO_PUBLIC_TENANT_KEY ?? 'DEMO_TENANT';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

// Log configuration on load
console.log('⚙️ [config] Configuration loaded:');
console.log('⚙️ [config] API_BASE_URL:', API_BASE_URL);
console.log('⚙️ [config] TENANT_KEY:', TENANT_KEY);
console.log('⚙️ [config] APP_VERSION:', APP_VERSION);
console.log('⚙️ [config] Platform:', Platform.OS);
