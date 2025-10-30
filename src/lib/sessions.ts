import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { api } from './api';
import { TENANT_KEY, APP_VERSION } from '../config';

/**
 * Login verdict returned by the Transrify API
 */
export type LoginVerdict = 'NORMAL' | 'DURESS' | 'FAIL';

/**
 * Recommended action returned by the Transrify API
 */
export type RecommendedAction = 'ALLOW' | 'LIMIT_AND_MONITOR' | 'DENY';

/**
 * Response from the login session endpoint
 */
export interface LoginSessionResponse {
  verdict: LoginVerdict;
  recommendedAction: RecommendedAction;
  sessionId: string;
}

/**
 * Response from the verify session endpoint
 */
export interface VerifySessionResponse {
  ok: boolean;
  session: {
    id: string;
    result: string;
    createdAt: string;
    customerRef: string;
    tenantName: string;
  };
}

/**
 * Authenticate user with customer reference and PIN
 * Includes device info and geolocation in the request
 * 
 * @param customerRef - User's customer reference identifier
 * @param pin - User's PIN (normal or duress)
 * @returns Login response with verdict, recommended action, and session ID
 * @throws Error if authentication fails or network error occurs
 */
export async function loginSession(
  customerRef: string,
  pin: string
): Promise<LoginSessionResponse> {
  console.log('🔐 [sessions.loginSession] Starting login session...');

  // Request location permission
  console.log('📍 [sessions.loginSession] Requesting location permission...');
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log('📍 [sessions.loginSession] Location permission status:', status);

  // Get current coordinates if permission granted
  let geo: { lat: number; lng: number } | undefined;

  if (status === 'granted') {
    try {
      console.log('📍 [sessions.loginSession] Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      geo = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      console.log('📍 [sessions.loginSession] Location obtained:', geo);
    } catch (error) {
      console.warn('⚠️ [sessions.loginSession] Failed to get location:', error);
      // Continue without location data
    }
  } else {
    console.log('⚠️ [sessions.loginSession] Location permission not granted, continuing without geo data');
  }

  const requestBody = {
    tenantKey: TENANT_KEY,
    customerRef,
    pin,
    deviceInfo: {
      platform: Platform.OS,
      version: APP_VERSION,
    },
    geo,
  };

  console.log('🌐 [sessions.loginSession] Making API request to /v1/sessions/login');
  console.log('📦 [sessions.loginSession] Request body:', JSON.stringify(requestBody, null, 2));

  // Make API request with all required data
  const response = await api<LoginSessionResponse>('/v1/sessions/login', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('✅ [sessions.loginSession] API response received:', JSON.stringify(response, null, 2));

  return response;
}

/**
 * Verify session validity
 * Used on app resume to check if session is still active
 * 
 * @param sessionId - Session ID to verify
 * @returns Verification response with session data
 * @throws Error if verification fails or network error occurs
 */
export async function verifySession(
  sessionId: string
): Promise<VerifySessionResponse> {
  return api<VerifySessionResponse>(
    `/v1/sessions/verify?sessionId=${encodeURIComponent(sessionId)}`
  );
}
