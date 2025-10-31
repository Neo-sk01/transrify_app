import {
  sendDuressAlert,
  pollNearbyAlerts,
  ackAlert,
  connectAlertsSocket,
  Alert,
  SendDuressAlertResponse,
  PollNearbyAlertsResponse,
  AckAlertResponse,
  WebSocketMessage,
} from '../src/lib/alerts';

// Mock the api module
jest.mock('../src/lib/api', () => ({
  api: jest.fn(),
}));

// Mock the config module
jest.mock('../src/config', () => ({
  TENANT_KEY: 'TEST_TENANT',
  APP_VERSION: '1.0.0',
}));

// Mock Platform from react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Import mocked api function
import { api } from '../src/lib/api';
const mockApi = api as jest.MockedFunction<typeof api>;

describe('Alert Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendDuressAlert', () => {
    it('should send duress alert with valid data', async () => {
      const sessionId = 'session-abc123';
      const geo = { lat: 37.7749, lng: -122.4194 };
      const mockResponse: SendDuressAlertResponse = {
        ok: true,
        alertId: 'alert-xyz789',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await sendDuressAlert(sessionId, geo);

      expect(result).toEqual(mockResponse);
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/duress', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          tenantKey: 'TEST_TENANT',
          alertKind: 'DURESS',
          geo,
          device: {
            platform: 'ios',
            appVersion: '1.0.0',
          },
        }),
      });
    });

    it('should send duress alert without geolocation', async () => {
      const sessionId = 'session-abc123';
      const mockResponse: SendDuressAlertResponse = {
        ok: true,
        alertId: 'alert-xyz789',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await sendDuressAlert(sessionId);

      expect(result).toEqual(mockResponse);
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/duress', {
        method: 'POST',
        body: expect.any(String),
      });
      
      // Verify the request body structure
      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.sessionId).toBe(sessionId);
      expect(requestBody.tenantKey).toBe('TEST_TENANT');
      expect(requestBody.alertKind).toBe('DURESS');
    });

    it('should throw error when API call fails', async () => {
      const sessionId = 'session-abc123';
      const geo = { lat: 37.7749, lng: -122.4194 };

      mockApi.mockRejectedValueOnce(new Error('Network error'));

      await expect(sendDuressAlert(sessionId, geo)).rejects.toThrow('Network error');
    });

    it('should include correct device platform', async () => {
      const sessionId = 'session-abc123';
      const mockResponse: SendDuressAlertResponse = {
        ok: true,
        alertId: 'alert-xyz789',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      await sendDuressAlert(sessionId);

      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      
      expect(requestBody.device.platform).toBe('ios');
      expect(requestBody.device.appVersion).toBe('1.0.0');
    });
  });

  describe('pollNearbyAlerts', () => {
    it('should poll nearby alerts with default radius', async () => {
      const geo = { lat: 37.7749, lng: -122.4194 };
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          kind: 'DURESS',
          sessionId: 'session-1',
          customerRef: 'USER_001',
          geo: { lat: 37.7750, lng: -122.4195 },
          createdAt: '2025-10-31T12:00:00Z',
        },
      ];
      const mockResponse: PollNearbyAlertsResponse = {
        ok: true,
        alerts: mockAlerts,
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await pollNearbyAlerts(geo);

      expect(result).toEqual(mockResponse);
      expect(mockApi).toHaveBeenCalledWith(
        expect.stringContaining('/v1/alerts/nearby?'),
        { method: 'GET' }
      );
      
      const callArgs = mockApi.mock.calls[0][0] as string;
      expect(callArgs).toContain('tenantKey=TEST_TENANT');
      expect(callArgs).toContain('lat=37.7749');
      expect(callArgs).toContain('lng=-122.4194');
      expect(callArgs).toContain('radius=1000');
    });

    it('should poll nearby alerts with custom radius', async () => {
      const geo = { lat: 37.7749, lng: -122.4194 };
      const radius = 5000;
      const mockResponse: PollNearbyAlertsResponse = {
        ok: true,
        alerts: [],
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      await pollNearbyAlerts(geo, radius);

      const callArgs = mockApi.mock.calls[0][0] as string;
      expect(callArgs).toContain('radius=5000');
    });

    it('should poll nearby alerts with since parameter', async () => {
      const geo = { lat: 37.7749, lng: -122.4194 };
      const since = '2025-10-31T12:00:00Z';
      const mockResponse: PollNearbyAlertsResponse = {
        ok: true,
        alerts: [],
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      await pollNearbyAlerts(geo, 1000, since);

      const callArgs = mockApi.mock.calls[0][0] as string;
      expect(callArgs).toContain('since=2025-10-31T12%3A00%3A00Z');
    });

    it('should return empty alerts array when no alerts nearby', async () => {
      const geo = { lat: 37.7749, lng: -122.4194 };
      const mockResponse: PollNearbyAlertsResponse = {
        ok: true,
        alerts: [],
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await pollNearbyAlerts(geo);

      expect(result.alerts).toEqual([]);
    });

    it('should throw error when API call fails', async () => {
      const geo = { lat: 37.7749, lng: -122.4194 };

      mockApi.mockRejectedValueOnce(new Error('Network error'));

      await expect(pollNearbyAlerts(geo)).rejects.toThrow('Network error');
    });
  });

  describe('ackAlert', () => {
    it('should acknowledge alert with INAPP method', async () => {
      const alertId = 'alert-xyz789';
      const ackBy = 'USER_001';
      const method = 'INAPP';
      const mockResponse: AckAlertResponse = {
        ok: true,
        acknowledgedAt: '2025-10-31T12:05:00Z',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await ackAlert(alertId, ackBy, method);

      expect(result).toEqual(mockResponse);
      expect(mockApi).toHaveBeenCalledWith('/v1/alerts/ack', {
        method: 'POST',
        body: JSON.stringify({
          alertId,
          ackBy,
          method,
        }),
      });
    });

    it('should acknowledge alert with NFC method', async () => {
      const alertId = 'alert-xyz789';
      const ackBy = 'USER_002';
      const method = 'NFC';
      const mockResponse: AckAlertResponse = {
        ok: true,
        acknowledgedAt: '2025-10-31T12:06:00Z',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await ackAlert(alertId, ackBy, method);

      expect(result).toEqual(mockResponse);
      
      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.method).toBe('NFC');
    });

    it('should acknowledge alert with PUSH method', async () => {
      const alertId = 'alert-xyz789';
      const ackBy = 'USER_003';
      const method = 'PUSH';
      const mockResponse: AckAlertResponse = {
        ok: true,
        acknowledgedAt: '2025-10-31T12:07:00Z',
      };

      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await ackAlert(alertId, ackBy, method);

      expect(result).toEqual(mockResponse);
      
      const callArgs = mockApi.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.method).toBe('PUSH');
    });

    it('should throw error when API call fails', async () => {
      const alertId = 'alert-xyz789';
      const ackBy = 'USER_001';
      const method = 'INAPP';

      mockApi.mockRejectedValueOnce(new Error('Network error'));

      await expect(ackAlert(alertId, ackBy, method)).rejects.toThrow('Network error');
    });
  });

  describe('connectAlertsSocket', () => {
    let mockWebSocket: any;
    let mockWebSocketInstance: any;
    let originalEnv: any;

    beforeEach(() => {
      // Save original environment
      originalEnv = { ...process.env };

      // Create a mock WebSocket instance
      mockWebSocketInstance = {
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null,
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1, // OPEN
      };

      // Mock the WebSocket constructor
      mockWebSocket = jest.fn(() => mockWebSocketInstance);
      global.WebSocket = mockWebSocket as any;
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should create WebSocket connection with correct URL', () => {
      const onMessage = jest.fn();

      connectAlertsSocket(onMessage);

      // Should be called with a URL containing the tenant key
      expect(mockWebSocket).toHaveBeenCalled();
      const calledUrl = mockWebSocket.mock.calls[0][0];
      expect(calledUrl).toContain('/v1/alerts/stream');
      expect(calledUrl).toContain('tenantKey=TEST_TENANT');
    });

    it('should handle DURESS_ALERT message', () => {
      const onMessage = jest.fn();
      const mockAlert: Alert = {
        id: 'alert-1',
        kind: 'DURESS',
        sessionId: 'session-1',
        customerRef: 'USER_001',
        geo: { lat: 37.7749, lng: -122.4194 },
        createdAt: '2025-10-31T12:00:00Z',
      };
      const mockMessage: WebSocketMessage = {
        type: 'DURESS_ALERT',
        alert: mockAlert,
      };

      const ws = connectAlertsSocket(onMessage);

      // Simulate WebSocket open
      if (mockWebSocketInstance.onopen) {
        mockWebSocketInstance.onopen();
      }

      // Simulate receiving a message
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: JSON.stringify(mockMessage),
        });
      }

      expect(onMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should respond to PING with PONG', () => {
      const onMessage = jest.fn();
      const mockPingMessage: WebSocketMessage = {
        type: 'PING',
        timestamp: '2025-10-31T12:00:00Z',
      };

      const ws = connectAlertsSocket(onMessage);

      // Simulate WebSocket open
      if (mockWebSocketInstance.onopen) {
        mockWebSocketInstance.onopen();
      }

      // Simulate receiving a PING message
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: JSON.stringify(mockPingMessage),
        });
      }

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"PONG"')
      );
    });

    it('should call onError callback when error occurs', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const mockError = new Event('error');

      const ws = connectAlertsSocket(onMessage, onError);

      // Simulate WebSocket error
      if (mockWebSocketInstance.onerror) {
        mockWebSocketInstance.onerror(mockError);
      }

      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should call onClose callback when connection closes', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      const mockCloseEvent = {
        code: 1000,
        reason: 'Normal closure',
      } as CloseEvent;

      const ws = connectAlertsSocket(onMessage, onError, onClose);

      // Simulate WebSocket close
      if (mockWebSocketInstance.onclose) {
        mockWebSocketInstance.onclose(mockCloseEvent);
      }

      expect(onClose).toHaveBeenCalledWith(mockCloseEvent);
    });

    it('should handle invalid JSON message gracefully', () => {
      const onMessage = jest.fn();

      const ws = connectAlertsSocket(onMessage);

      // Simulate receiving invalid JSON
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: 'invalid json',
        });
      }

      // Should not call onMessage for invalid JSON
      expect(onMessage).not.toHaveBeenCalled();
    });

    it('should construct WebSocket URL with tenant key parameter', () => {
      const onMessage = jest.fn();

      connectAlertsSocket(onMessage);

      // Verify URL structure
      const calledUrl = mockWebSocket.mock.calls[0][0];
      expect(calledUrl).toMatch(/^wss?:\/\//); // Starts with ws:// or wss://
      expect(calledUrl).toContain('/v1/alerts/stream');
      expect(calledUrl).toContain('?tenantKey=');
      expect(calledUrl).toContain('TEST_TENANT');
    });

    it('should handle multiple message types', () => {
      const onMessage = jest.fn();

      const ws = connectAlertsSocket(onMessage);

      // Simulate WebSocket open
      if (mockWebSocketInstance.onopen) {
        mockWebSocketInstance.onopen();
      }

      // Send DURESS_ALERT
      const duressMessage: WebSocketMessage = {
        type: 'DURESS_ALERT',
        alert: {
          id: 'alert-1',
          kind: 'DURESS',
          sessionId: 'session-1',
          customerRef: 'USER_001',
          createdAt: '2025-10-31T12:00:00Z',
        },
      };

      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: JSON.stringify(duressMessage),
        });
      }

      expect(onMessage).toHaveBeenCalledWith(duressMessage);

      // Send PING
      const pingMessage: WebSocketMessage = {
        type: 'PING',
        timestamp: '2025-10-31T12:00:00Z',
      };

      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: JSON.stringify(pingMessage),
        });
      }

      expect(mockWebSocketInstance.send).toHaveBeenCalled();

      // Send PONG (other message type)
      const pongMessage: WebSocketMessage = {
        type: 'PONG',
        timestamp: '2025-10-31T12:00:01Z',
      };

      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({
          data: JSON.stringify(pongMessage),
        });
      }

      expect(onMessage).toHaveBeenCalledWith(pongMessage);
    });
  });
});
