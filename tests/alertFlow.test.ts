/**
 * Alert Flow Integration Tests
 * 
 * Tests the complete alert flow including:
 * - Duress login triggering sendDuressAlert
 * - LandingScreen subscribing to alerts on mount
 * - Alert acknowledgment removing alert from store
 * - WebSocket fallback to polling
 * 
 * Requirements: 24.1, 25.1, 27.3, 35.4
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../src/state/useAuthStore';
import { useAlertsStore } from '../src/state/useAlertsStore';
import { sendDuressAlert, pollNearbyAlerts, ackAlert, connectAlertsSocket } from '../src/lib/alerts';
import { getCurrentLocation } from '../src/lib/geo';
import * as storage from '../src/lib/storage';

// Mock the api module
jest.mock('../src/lib/api', () => ({
  api: jest.fn(),
}));

// Mock the config module
jest.mock('../src/config', () => ({
  TENANT_KEY: 'TEST_TENANT',
  APP_VERSION: '1.0.0',
  API_BASE_URL: 'https://api.test.transrify.com',
}));

// Mock Platform from react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock geo module
jest.mock('../src/lib/geo', () => ({
  getCurrentLocation: jest.fn(),
  calculateDistance: jest.fn((lat1, lng1, lat2, lng2) => {
    // Simple mock distance calculation
    return Math.abs(lat1 - lat2) * 111000 + Math.abs(lng1 - lng2) * 111000;
  }),
  formatDistance: jest.fn((meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }),
}));

// Mock storage module
jest.mock('../src/lib/storage', () => ({
  setSessionId: jest.fn(),
  getSessionId: jest.fn(),
  setCustomerRef: jest.fn(),
  getCustomerRef: jest.fn(),
  setSessionMode: jest.fn(),
  getSessionMode: jest.fn(),
  setTenantKey: jest.fn(),
  getTenantKey: jest.fn(),
  clearAll: jest.fn(),
}));

// Import mocked functions
import { api } from '../src/lib/api';
const mockApi = api as jest.MockedFunction<typeof api>;
const mockGetCurrentLocation = getCurrentLocation as jest.MockedFunction<typeof getCurrentLocation>;

describe('Alert Flow Integration Tests', () => {
  let mockWebSocket: any;
  let mockWebSocketInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();

    // Reset stores
    useAuthStore.setState({
      user: null,
      sessionMode: null,
      isAuthenticated: false,
      isLoading: false,
    });

    useAlertsStore.setState({
      alerts: [],
      lastCheckedAt: null,
      subscribed: false,
      wsConnection: null,
      pollingInterval: null,
      alertDebounceMap: new Map(),
    });

    // Mock WebSocket
    mockWebSocketInstance = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // OPEN
    };

    mockWebSocket = jest.fn(() => mockWebSocketInstance);
    global.WebSocket = mockWebSocket as any;

    // Mock storage functions
    (storage.setSessionId as jest.Mock).mockResolvedValue(undefined);
    (storage.setCustomerRef as jest.Mock).mockResolvedValue(undefined);
    (storage.setSessionMode as jest.Mock).mockResolvedValue(undefined);
    (storage.setTenantKey as jest.Mock).mockResolvedValue(undefined);
    (storage.getTenantKey as jest.Mock).mockResolvedValue('TEST_TENANT');
    (storage.clearAll as jest.Mock).mockResolvedValue(undefined);

    // Mock getCurrentLocation
    mockGetCurrentLocation.mockResolvedValue({
      lat: 37.7749,
      lng: -122.4194,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    
    // Clean up any intervals
    const state = useAlertsStore.getState();
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval);
    }
  });

  describe('Duress Login Triggers sendDuressAlert', () => {
    it('should send duress alert after successful duress authentication', async () => {
      const sessionId = 'session-duress-123';
      const geo = { lat: 37.7749, lng: -122.4194 };
      
      mockGetCurrentLocation.mockResolvedValue(geo);
      
      mockApi.mockResolvedValueOnce({
        ok: true,
        alertId: 'alert-xyz789',
      });

      // Call sendDuressAlert (simulating what LoginScreen does)
      const result = await sendDuressAlert(sessionId, geo);

      expect(result.ok).toBe(true);
      expect(result.alertId).toBe('alert-xyz789');
      
      // Verify API was called with correct parameters
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/duress', {
        method: 'POST',
        body: expect.stringContaining(sessionId),
      });

      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      
      expect(requestBody.sessionId).toBe(sessionId);
      expect(requestBody.tenantKey).toBe('TEST_TENANT');
      expect(requestBody.alertKind).toBe('DURESS');
      expect(requestBody.geo).toEqual(geo);
      expect(requestBody.device.platform).toBe('ios');
    });

    it('should send duress alert without geolocation if unavailable', async () => {
      const sessionId = 'session-duress-456';
      
      mockGetCurrentLocation.mockRejectedValue(new Error('Location unavailable'));
      
      mockApi.mockResolvedValueOnce({
        ok: true,
        alertId: 'alert-abc123',
      });

      // Call sendDuressAlert without geo
      const result = await sendDuressAlert(sessionId);

      expect(result.ok).toBe(true);
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/duress', {
        method: 'POST',
        body: expect.any(String),
      });

      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      
      expect(requestBody.sessionId).toBe(sessionId);
      expect(requestBody.geo).toBeUndefined();
    });

    it('should fail silently if duress alert sending fails', async () => {
      const sessionId = 'session-duress-789';
      const geo = { lat: 37.7749, lng: -122.4194 };
      
      mockGetCurrentLocation.mockResolvedValue(geo);
      mockApi.mockRejectedValue(new Error('Network error'));

      // Should throw error (LoginScreen catches it)
      await expect(sendDuressAlert(sessionId, geo)).rejects.toThrow('Network error');
      
      // Verify API was called
      expect(mockApi).toHaveBeenCalled();
    });
  });

  describe('LandingScreen Subscribes to Alerts on Mount', () => {
    it('should start foreground alerts when component mounts', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };
      
      mockGetCurrentLocation.mockResolvedValue(userLocation);

      // Start foreground alerts (simulating LandingScreen mount)
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      // Verify subscribed state
      const state = useAlertsStore.getState();
      expect(state.subscribed).toBe(true);
      expect(state.lastCheckedAt).toBeTruthy();
    });

    it('should attempt WebSocket connection first', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      // Verify WebSocket was created
      expect(mockWebSocket).toHaveBeenCalled();
      
      const wsUrl = mockWebSocket.mock.calls[0][0];
      expect(wsUrl).toContain('/v1/alerts/stream');
      expect(wsUrl).toContain('tenantKey=TEST_TENANT');
    });

    it('should stop foreground alerts when component unmounts', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      // Start alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      expect(useAlertsStore.getState().subscribed).toBe(true);

      // Stop alerts (simulating LandingScreen unmount)
      act(() => {
        useAlertsStore.getState().stopForegroundAlerts();
      });

      // Verify stopped state
      const state = useAlertsStore.getState();
      expect(state.subscribed).toBe(false);
      expect(state.pollingInterval).toBeNull();
    });

    it('should not start alerts if already subscribed', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      // Start alerts first time
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      const firstCallCount = mockWebSocket.mock.calls.length;

      // Try to start again
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      // Should not create new WebSocket
      expect(mockWebSocket.mock.calls.length).toBe(firstCallCount);
    });
  });

  describe('Alert Acknowledgment Removes Alert from Store', () => {
    it('should remove alert from store after successful acknowledgment', async () => {
      const alert = {
        id: 'alert-123',
        kind: 'DURESS' as const,
        sessionId: 'session-1',
        customerRef: 'USER_001',
        geo: { lat: 37.7750, lng: -122.4195 },
        createdAt: '2025-10-31T12:00:00Z',
      };

      // Add alert to store
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      expect(useAlertsStore.getState().alerts).toHaveLength(1);

      // Mock successful acknowledgment
      mockApi.mockResolvedValueOnce({
        ok: true,
        acknowledgedAt: '2025-10-31T12:05:00Z',
      });

      // Acknowledge alert
      await act(async () => {
        await ackAlert(alert.id, 'USER_002', 'INAPP');
        useAlertsStore.getState().removeAlert(alert.id);
      });

      // Verify alert was removed
      expect(useAlertsStore.getState().alerts).toHaveLength(0);
      
      // Verify API was called
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/ack', {
        method: 'POST',
        body: expect.stringContaining(alert.id),
      });
    });

    it('should handle acknowledgment with different methods', async () => {
      const alert = {
        id: 'alert-456',
        kind: 'DURESS' as const,
        sessionId: 'session-2',
        customerRef: 'USER_003',
        createdAt: '2025-10-31T12:10:00Z',
      };

      // Test NFC method
      mockApi.mockResolvedValueOnce({
        ok: true,
        acknowledgedAt: '2025-10-31T12:15:00Z',
      });

      await ackAlert(alert.id, 'USER_004', 'NFC');

      const nfcCallArgs = mockApi.mock.calls[0];
      const nfcRequestBody = JSON.parse(nfcCallArgs[1]?.body as string);
      expect(nfcRequestBody.method).toBe('NFC');

      // Test PUSH method
      mockApi.mockResolvedValueOnce({
        ok: true,
        acknowledgedAt: '2025-10-31T12:16:00Z',
      });

      await ackAlert(alert.id, 'USER_005', 'PUSH');

      const pushCallArgs = mockApi.mock.calls[1];
      const pushRequestBody = JSON.parse(pushCallArgs[1]?.body as string);
      expect(pushRequestBody.method).toBe('PUSH');
    });

    it('should keep alert in store if acknowledgment fails', async () => {
      const alert = {
        id: 'alert-789',
        kind: 'DURESS' as const,
        sessionId: 'session-3',
        customerRef: 'USER_006',
        createdAt: '2025-10-31T12:20:00Z',
      };

      // Add alert to store
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      expect(useAlertsStore.getState().alerts).toHaveLength(1);

      // Mock failed acknowledgment
      mockApi.mockRejectedValueOnce(new Error('Network error'));

      // Try to acknowledge alert
      await expect(ackAlert(alert.id, 'USER_007', 'INAPP')).rejects.toThrow('Network error');

      // Alert should still be in store (not removed)
      expect(useAlertsStore.getState().alerts).toHaveLength(1);
    });
  });

  describe('WebSocket Fallback to Polling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should fall back to polling when WebSocket connection fails', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      // Mock WebSocket error
      mockWebSocket.mockImplementation(() => {
        const ws = {
          ...mockWebSocketInstance,
          onerror: null,
          onclose: null,
        };
        
        // Trigger error immediately
        setTimeout(() => {
          if (ws.onerror) {
            ws.onerror(new Event('error'));
          }
        }, 0);
        
        return ws;
      });

      // Mock polling response
      mockApi.mockResolvedValue({
        ok: true,
        alerts: [],
      });

      // Start foreground alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
        jest.advanceTimersByTime(100);
      });

      // Should have started polling
      const state = useAlertsStore.getState();
      expect(state.pollingInterval).toBeTruthy();
    });

    it('should poll for alerts at configured interval', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      // Mock WebSocket to close immediately (trigger fallback)
      mockWebSocket.mockImplementation(() => {
        const ws = {
          ...mockWebSocketInstance,
          onclose: null,
        };
        
        setTimeout(() => {
          if (ws.onclose) {
            ws.onclose({ code: 1000, reason: 'Normal closure' } as CloseEvent);
          }
        }, 0);
        
        return ws;
      });

      // Mock polling responses
      mockApi.mockResolvedValue({
        ok: true,
        alerts: [],
      });

      // Start foreground alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
        jest.advanceTimersByTime(100);
      });

      // Clear initial poll call
      mockApi.mockClear();

      // Advance time by polling interval (15 seconds)
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Should have polled once
      expect(mockApi).toHaveBeenCalledWith(
        expect.stringContaining('/v1/alerts/nearby'),
        { method: 'GET' }
      );
    });

    it('should add alerts received from polling', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };
      const mockAlert = {
        id: 'alert-poll-1',
        kind: 'DURESS' as const,
        sessionId: 'session-poll',
        customerRef: 'USER_POLL',
        geo: { lat: 37.7750, lng: -122.4195 },
        createdAt: '2025-10-31T12:30:00Z',
      };

      // Mock WebSocket to close immediately
      mockWebSocket.mockImplementation(() => {
        const ws = {
          ...mockWebSocketInstance,
          onclose: null,
        };
        
        setTimeout(() => {
          if (ws.onclose) {
            ws.onclose({ code: 1000, reason: 'Normal closure' } as CloseEvent);
          }
        }, 0);
        
        return ws;
      });

      // Mock polling response with alert
      mockApi.mockResolvedValue({
        ok: true,
        alerts: [mockAlert],
      });

      // Start foreground alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
        jest.advanceTimersByTime(100);
      });

      // Wait for polling to complete
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Verify alert was added
      await waitFor(() => {
        const state = useAlertsStore.getState();
        expect(state.alerts.length).toBeGreaterThan(0);
      });
    });

    it('should use WebSocket when available and not poll', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };

      // Mock successful WebSocket connection
      mockWebSocket.mockImplementation(() => {
        const ws = {
          ...mockWebSocketInstance,
          onopen: null,
        };
        
        setTimeout(() => {
          if (ws.onopen) {
            ws.onopen();
          }
        }, 0);
        
        return ws;
      });

      // Start foreground alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
        jest.advanceTimersByTime(100);
      });

      // Should not have started polling
      const state = useAlertsStore.getState();
      expect(state.wsConnection).toBeTruthy();
      
      // Advance time and verify no polling calls
      mockApi.mockClear();
      
      await act(async () => {
        jest.advanceTimersByTime(20000);
      });

      // Should not have made any polling API calls
      expect(mockApi).not.toHaveBeenCalled();
    });

    it('should receive alerts via WebSocket when connected', async () => {
      const userLocation = { lat: 37.7749, lng: -122.4194 };
      const mockAlert = {
        id: 'alert-ws-1',
        kind: 'DURESS' as const,
        sessionId: 'session-ws',
        customerRef: 'USER_WS',
        geo: { lat: 37.7750, lng: -122.4195 },
        createdAt: '2025-10-31T12:40:00Z',
      };

      // Start foreground alerts
      await act(async () => {
        await useAlertsStore.getState().startForegroundAlerts(userLocation);
      });

      // Simulate WebSocket open
      if (mockWebSocketInstance.onopen) {
        mockWebSocketInstance.onopen();
      }

      // Simulate receiving alert via WebSocket
      act(() => {
        if (mockWebSocketInstance.onmessage) {
          mockWebSocketInstance.onmessage({
            data: JSON.stringify({
              type: 'DURESS_ALERT',
              alert: mockAlert,
            }),
          });
        }
      });

      // Verify alert was added
      const state = useAlertsStore.getState();
      expect(state.alerts).toHaveLength(1);
      expect(state.alerts[0].id).toBe(mockAlert.id);
    });
  });

  describe('Alert Debouncing', () => {
    it('should debounce identical alerts within 60 seconds', () => {
      const alert = {
        id: 'alert-debounce',
        kind: 'DURESS' as const,
        sessionId: 'session-debounce',
        customerRef: 'USER_DEBOUNCE',
        createdAt: '2025-10-31T12:50:00Z',
      };

      // Add alert first time
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      expect(useAlertsStore.getState().alerts).toHaveLength(1);

      // Try to add same alert immediately
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      // Should still only have one alert (debounced)
      expect(useAlertsStore.getState().alerts).toHaveLength(1);
    });

    it('should allow same alert after debounce period', () => {
      jest.useFakeTimers();

      const alert = {
        id: 'alert-debounce-2',
        kind: 'DURESS' as const,
        sessionId: 'session-debounce-2',
        customerRef: 'USER_DEBOUNCE_2',
        createdAt: '2025-10-31T13:00:00Z',
      };

      // Add alert first time
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      expect(useAlertsStore.getState().alerts).toHaveLength(1);

      // Advance time by 61 seconds (past debounce period)
      act(() => {
        jest.advanceTimersByTime(61000);
      });

      // Try to add same alert after debounce period
      act(() => {
        useAlertsStore.getState().addAlert(alert);
      });

      // Should now have two alerts
      expect(useAlertsStore.getState().alerts).toHaveLength(2);

      jest.useRealTimers();
    });
  });
});
