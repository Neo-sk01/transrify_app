import * as storage from './storage';

/**
 * Login request payload
 */
export interface LoginRequest {
  tenantKey: string;
  customerRef: string;
  pin: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    version: string;
    ip?: string;
  };
  geo?: {
    lat: number;
    lng: number;
  };
}

/**
 * Login response from API
 */
export interface LoginResponse {
  verdict: 'NORMAL' | 'DURESS' | 'FAIL';
  recommendedAction: 'ALLOW' | 'LIMIT_AND_MONITOR' | 'DENY';
  sessionId: string;
}

/**
 * API error response
 */
export interface ApiError {
  ok: false;
  error: 'INVALID_TENANT_KEY' | 'TENANT_SUSPENDED' | 'MISSING_REQUIRED_FIELDS' | 'RATE_LIMIT_EXCEEDED';
}

/**
 * User data
 */
export interface User {
  customerRef: string;
  sessionId: string;
}

/**
 * Auth adapter interface for replaceable authentication backends
 */
export interface AuthAdapter {
  /**
   * Authenticate user with customer reference and PIN
   * @param customerRef - User's customer reference
   * @param pin - User's PIN
   * @returns LoginResponse with verdict and session ID
   * @throws Error with API error code
   */
  signIn(customerRef: string, pin: string): Promise<LoginResponse>;

  /**
   * Sign out current user
   */
  signOut(): Promise<void>;

  /**
   * Get current user from stored session
   * @returns User data or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>;
}

/**
 * Mock authentication adapter for development
 * 
 * Mock logic:
 * - PIN ending in 1 = DURESS verdict
 * - Other valid PINs = NORMAL verdict
 * - Invalid input = FAIL verdict
 */
export class MockAuthAdapter implements AuthAdapter {
  async signIn(customerRef: string, pin: string): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate input
    const isValidCustomerRef = customerRef.length >= 3 && customerRef.length <= 50;
    const isValidPin = pin.length >= 4 && pin.length <= 8 && /^\d+$/.test(pin);

    if (!isValidCustomerRef || !isValidPin) {
      return {
        verdict: 'FAIL',
        recommendedAction: 'DENY',
        sessionId: '',
      };
    }

    // Determine verdict based on PIN pattern
    // PIN ending in 1 = DURESS, others = NORMAL
    const isDuress = pin.endsWith('1');
    const verdict = isDuress ? 'DURESS' : 'NORMAL';
    const recommendedAction = isDuress ? 'LIMIT_AND_MONITOR' : 'ALLOW';

    // Generate mock session ID
    const sessionId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Store session data in SecureStore
    await storage.setSessionId(sessionId);
    await storage.setCustomerRef(customerRef);
    await storage.setSessionMode(verdict);

    return {
      verdict,
      recommendedAction,
      sessionId,
    };
  }

  async signOut(): Promise<void> {
    // Clear all stored data
    await storage.clearAll();
  }

  async getCurrentUser(): Promise<User | null> {
    const sessionId = await storage.getSessionId();
    const customerRef = await storage.getCustomerRef();

    if (sessionId && customerRef) {
      return { sessionId, customerRef };
    }

    return null;
  }
}

/**
 * Production authentication adapter for Transrify API
 */
export class TransrifyAuthAdapter implements AuthAdapter {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async signIn(customerRef: string, pin: string): Promise<LoginResponse> {
    // Get tenant key from secure storage
    const tenantKey = await storage.getTenantKey();
    if (!tenantKey) {
      throw new Error('INVALID_TENANT_KEY');
    }

    // Get device info
    const deviceInfo = await this.getDeviceInfo();

    // Get location with timeout
    const geo = await this.getLocation();

    // Prepare request payload
    const payload: LoginRequest = {
      tenantKey,
      customerRef,
      pin,
      deviceInfo,
      geo,
    };

    try {
      // Make API request
      const response = await fetch(`${this.baseURL}/v1/sessions/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorCode = errorData.error || 'AUTHENTICATION_FAILED';
        throw new Error(errorCode);
      }

      // Parse successful response
      const data: LoginResponse = await response.json();

      // Validate response structure
      if (!data.verdict || !data.sessionId) {
        throw new Error('AUTHENTICATION_FAILED');
      }

      // Store session data in SecureStore only on successful authentication (NORMAL or DURESS)
      if (data.verdict === 'NORMAL' || data.verdict === 'DURESS') {
        await storage.setSessionId(data.sessionId);
        await storage.setCustomerRef(customerRef);
        await storage.setSessionMode(data.verdict);
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      // Re-throw API errors
      throw error;
    }
  }

  async signOut(): Promise<void> {
    // Clear all stored data from SecureStore
    await storage.clearAll();
  }

  async getCurrentUser(): Promise<User | null> {
    const sessionId = await storage.getSessionId();
    const customerRef = await storage.getCustomerRef();

    if (sessionId && customerRef) {
      return { sessionId, customerRef };
    }

    return null;
  }

  /**
   * Get device information for authentication request
   */
  private async getDeviceInfo(): Promise<LoginRequest['deviceInfo']> {
    // Dynamically import to avoid issues if not available
    const { Platform } = await import('react-native');
    const Application = await import('expo-application');

    return {
      platform: Platform.OS as 'ios' | 'android',
      version: Application.nativeApplicationVersion || '1.0.0',
    };
  }

  /**
   * Get location with timeout
   * Returns undefined if permission denied or timeout exceeded
   */
  private async getLocation(): Promise<{ lat: number; lng: number } | undefined> {
    try {
      const Location = await import('expo-location');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return undefined;
      }

      // Get current location with timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000);
      });

      // Race between location and timeout
      const result = await Promise.race([locationPromise, timeoutPromise]);

      if (result && 'coords' in result) {
        return {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        };
      }

      console.warn('Location request timed out');
      return undefined;
    } catch (error) {
      console.warn('Location unavailable:', error);
      return undefined;
    }
  }
}

/**
 * Export adapter based on environment configuration
 */
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://carboapi.me';

console.log('🔧 [auth] Initializing auth adapter...');
console.log('🔧 [auth] USE_MOCK_AUTH:', USE_MOCK_AUTH);
console.log('🔧 [auth] API_BASE_URL:', API_BASE_URL);

export const authAdapter: AuthAdapter = USE_MOCK_AUTH
  ? new MockAuthAdapter()
  : new TransrifyAuthAdapter(API_BASE_URL);

console.log('✅ [auth] Auth adapter initialized:', USE_MOCK_AUTH ? 'MockAuthAdapter' : 'TransrifyAuthAdapter');
