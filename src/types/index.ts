// API Request Types
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

// API Response Types
export interface LoginResponse {
  verdict: 'NORMAL' | 'DURESS' | 'FAIL';
  recommendedAction: 'ALLOW' | 'LIMIT_AND_MONITOR' | 'DENY';
  sessionId: string;
}

// API Error Response
export interface ApiError {
  ok: false;
  error: 'INVALID_TENANT_KEY' | 'TENANT_SUSPENDED' | 'MISSING_REQUIRED_FIELDS' | 'RATE_LIMIT_EXCEEDED';
}

// User Data
export interface User {
  customerRef: string;
  sessionId: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  sessionMode: 'NORMAL' | 'DURESS' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: User, mode: 'NORMAL' | 'DURESS') => void;
  clearSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}
