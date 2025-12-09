import { create } from 'zustand';
import * as storage from '../lib/storage';
import { User, AuthState } from '../types';

/**
 * Zustand store for authentication state management
 * Handles user session, authentication status, and SecureStore synchronization
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionMode: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Set user session and store data in SecureStore
   * @param user - User data with customerRef and sessionId
   * @param mode - Session mode (NORMAL or DURESS)
   */
  setSession: (user: User, mode: 'NORMAL' | 'DURESS') => {
    set({
      user,
      sessionMode: mode,
      isAuthenticated: true,
    });
  },

  /**
   * Clear user session and remove all data from SecureStore
   */
  clearSession: async () => {
    try {
      await storage.clearAll();
      set({
        user: null,
        sessionMode: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw error;
    }
  },

  /**
   * Update loading state
   * @param loading - Loading state boolean
   */
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  /**
   * Initialize authentication state from SecureStore on app start
   * Reads session data and updates state if valid session exists
   */
  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const sessionId = await storage.getSessionId();
      const customerRef = await storage.getCustomerRef();
      const mode = await storage.getSessionMode();
      const incidentId = await storage.getIncidentId();

      if (sessionId && customerRef && mode) {
        set({
          user: { customerRef, sessionId },
          sessionMode: mode as 'NORMAL' | 'DURESS',
          isAuthenticated: true,
        });

        // Prime duress incident ID for downstream flows (e.g., video recording)
        if (mode === 'DURESS' && incidentId) {
          const { setDuressIncidentId } = await import('../lib/duressRecording');
          setDuressIncidentId(incidentId);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
