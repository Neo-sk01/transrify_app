import { Platform } from 'react-native';
import { api } from './api';
import { TENANT_KEY, APP_VERSION } from '../config';

/**
 * Alert kind types
 */
export type AlertKind = 'DURESS';

/**
 * Acknowledgment method types
 */
export type AckMethod = 'NFC' | 'PUSH' | 'INAPP';

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 'DURESS_ALERT' | 'PING' | 'PONG';

/**
 * Alert data structure
 */
export interface Alert {
  id: string;
  kind: AlertKind;
  sessionId: string;
  customerRef: string;
  geo?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  distance?: number;
}

/**
 * Response from sending a duress alert
 */
export interface SendDuressAlertResponse {
  ok: boolean;
  alertId: string;
}

/**
 * Response from polling nearby alerts
 */
export interface PollNearbyAlertsResponse {
  ok: boolean;
  alerts: Alert[];
}

/**
 * Response from acknowledging an alert
 */
export interface AckAlertResponse {
  ok: boolean;
  acknowledgedAt: string;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  alert?: Alert;
  timestamp?: string;
}

/**
 * Send a duress alert to notify nearby users
 * Called immediately after successful duress authentication
 * 
 * @param sessionId - Current session ID
 * @param geo - Current geolocation coordinates
 * @returns Response with alert ID
 * @throws Error if alert sending fails
 */
export async function sendDuressAlert(
  sessionId: string,
  geo?: { lat: number; lng: number }
): Promise<SendDuressAlertResponse> {
  console.log('🚨 [alerts.sendDuressAlert] Sending duress alert...');
  console.log('🚨 [alerts.sendDuressAlert] Session ID:', sessionId);
  console.log('🚨 [alerts.sendDuressAlert] Geo:', geo);

  const requestBody = {
    sessionId,
    tenantKey: TENANT_KEY,
    alertKind: 'DURESS' as AlertKind,
    geo,
    device: {
      platform: Platform.OS,
      appVersion: APP_VERSION,
    },
  };

  console.log('🌐 [alerts.sendDuressAlert] Making API request to /v1/alerts/duress');
  console.log('📦 [alerts.sendDuressAlert] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await api<SendDuressAlertResponse>('/v1/alerts/duress', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('✅ [alerts.sendDuressAlert] Alert sent successfully:', response.alertId);

  return response;
}

/**
 * Poll for nearby duress alerts
 * Used when WebSocket is unavailable or as fallback
 * 
 * @param geo - Current geolocation coordinates
 * @param radius - Search radius in meters (default: 1000)
 * @param since - Timestamp to get alerts since (ISO string)
 * @returns Response with array of nearby alerts
 * @throws Error if polling fails
 */
export async function pollNearbyAlerts(
  geo: { lat: number; lng: number },
  radius: number = 1000,
  since?: string
): Promise<PollNearbyAlertsResponse> {
  console.log('🔍 [alerts.pollNearbyAlerts] Polling for nearby alerts...');
  console.log('🔍 [alerts.pollNearbyAlerts] Geo:', geo);
  console.log('🔍 [alerts.pollNearbyAlerts] Radius:', radius);
  console.log('🔍 [alerts.pollNearbyAlerts] Since:', since);

  // Build query parameters
  const params = new URLSearchParams({
    tenantKey: TENANT_KEY,
    lat: geo.lat.toString(),
    lng: geo.lng.toString(),
    radius: radius.toString(),
  });

  if (since) {
    params.append('since', since);
  }

  const endpoint = `/v1/alerts/nearby?${params.toString()}`;
  console.log('🌐 [alerts.pollNearbyAlerts] Making API request to', endpoint);

  const response = await api<PollNearbyAlertsResponse>(endpoint, {
    method: 'GET',
  });

  console.log('✅ [alerts.pollNearbyAlerts] Received', response.alerts?.length || 0, 'alerts');

  return response;
}

/**
 * Acknowledge a duress alert
 * Indicates that the user is aware and responding to the alert
 * 
 * @param alertId - ID of the alert to acknowledge
 * @param ackBy - Customer reference of the acknowledging user
 * @param method - Method used to acknowledge (NFC, PUSH, or INAPP)
 * @returns Response with acknowledgment timestamp
 * @throws Error if acknowledgment fails
 */
export async function ackAlert(
  alertId: string,
  ackBy: string,
  method: AckMethod
): Promise<AckAlertResponse> {
  console.log('✓ [alerts.ackAlert] Acknowledging alert...');
  console.log('✓ [alerts.ackAlert] Alert ID:', alertId);
  console.log('✓ [alerts.ackAlert] Ack by:', ackBy);
  console.log('✓ [alerts.ackAlert] Method:', method);

  const requestBody = {
    alertId,
    ackBy,
    method,
  };

  console.log('🌐 [alerts.ackAlert] Making API request to /v1/alerts/ack');
  console.log('📦 [alerts.ackAlert] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await api<AckAlertResponse>('/v1/alerts/ack', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('✅ [alerts.ackAlert] Alert acknowledged at:', response.acknowledgedAt);

  return response;
}

/**
 * Connect to the alerts WebSocket for real-time notifications
 * Provides lower latency than polling for alert delivery
 * 
 * @param onMessage - Callback function to handle incoming messages
 * @param onError - Callback function to handle errors
 * @param onClose - Callback function to handle connection close
 * @returns WebSocket instance
 */
export function connectAlertsSocket(
  onMessage: (message: WebSocketMessage) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket {
  // Get WebSocket URL from environment or construct from API base URL
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/^http/, 'ws') || 
    'ws://api.example.com';
  
  // Construct WebSocket URL with tenant key as query parameter
  const url = `${wsUrl}/v1/alerts/stream?tenantKey=${encodeURIComponent(TENANT_KEY)}`;
  
  console.log('🔌 [alerts.connectAlertsSocket] Connecting to WebSocket...');
  console.log('🔌 [alerts.connectAlertsSocket] URL:', url);

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('✅ [alerts.connectAlertsSocket] WebSocket connected');
  };

  ws.onmessage = (event) => {
    console.log('📨 [alerts.connectAlertsSocket] Message received:', event.data);
    
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Handle different message types
      if (message.type === 'DURESS_ALERT') {
        console.log('🚨 [alerts.connectAlertsSocket] DURESS_ALERT received:', message.alert);
        onMessage(message);
      } else if (message.type === 'PING') {
        // Respond to ping with pong
        console.log('🏓 [alerts.connectAlertsSocket] PING received, sending PONG');
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      } else {
        console.log('ℹ️ [alerts.connectAlertsSocket] Other message type:', message.type);
        onMessage(message);
      }
    } catch (error) {
      console.error('❌ [alerts.connectAlertsSocket] Failed to parse message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ [alerts.connectAlertsSocket] WebSocket error:', error);
    if (onError) {
      onError(error);
    }
  };

  ws.onclose = (event) => {
    console.log('🔌 [alerts.connectAlertsSocket] WebSocket closed:', event.code, event.reason);
    if (onClose) {
      onClose(event);
    }
  };

  return ws;
}
