import { create } from 'zustand';
import {
  Alert,
  connectAlertsSocket,
  pollNearbyAlerts,
  WebSocketMessage,
} from '../lib/alerts';
import { calculateDistance, getCurrentLocation } from '../lib/geo';

/**
 * Alert state interface
 */
export interface AlertsState {
  alerts: Alert[];
  lastCheckedAt: string | null;
  subscribed: boolean;
  wsConnection: WebSocket | null;
  pollingInterval: NodeJS.Timeout | null;
  alertDebounceMap: Map<string, number>;
}

/**
 * Alert actions interface
 */
interface AlertsActions {
  addAlert: (alert: Alert, userLocation?: { lat: number; lng: number }) => void;
  removeAlert: (alertId: string) => void;
  startForegroundAlerts: (userLocation: { lat: number; lng: number }) => Promise<void>;
  stopForegroundAlerts: () => void;
  connectWebSocket: (userLocation: { lat: number; lng: number }) => void;
  disconnectWebSocket: () => void;
}

/**
 * Combined store type
 */
type AlertsStore = AlertsState & AlertsActions;

/**
 * Default alert radius in meters (1 km)
 */
const ALERT_RADIUS_METERS = parseInt(
  process.env.EXPO_PUBLIC_ALERT_RADIUS_METERS || '1000',
  10
);

/**
 * Default polling interval in milliseconds (15 seconds)
 */
const ALERT_POLL_INTERVAL_MS = parseInt(
  process.env.EXPO_PUBLIC_ALERT_POLL_INTERVAL_MS || '15000',
  10
);

/**
 * Debounce duration for identical alerts (60 seconds)
 */
const ALERT_DEBOUNCE_MS = 60000;

/**
 * Zustand store for managing duress proximity alerts
 * 
 * Features:
 * - Real-time WebSocket connection with fallback to polling
 * - Alert debouncing to prevent spam
 * - Distance calculation for nearby alerts
 * - Automatic cleanup on unmount
 */
export const useAlertsStore = create<AlertsStore>((set, get) => ({
  // Initial state
  alerts: [],
  lastCheckedAt: null,
  subscribed: false,
  wsConnection: null,
  pollingInterval: null,
  alertDebounceMap: new Map(),

  /**
   * Add a new alert to the store
   * Computes distance if user location is provided
   * Debounces identical alerts for 60 seconds
   * 
   * @param alert - Alert to add
   * @param userLocation - Current user location for distance calculation
   */
  addAlert: (alert: Alert, userLocation?: { lat: number; lng: number }) => {
    const state = get();
    
    // Check if alert is debounced
    const lastSeenAt = state.alertDebounceMap.get(alert.id);
    const now = Date.now();
    
    if (lastSeenAt && now - lastSeenAt < ALERT_DEBOUNCE_MS) {
      console.log('🔇 [useAlertsStore.addAlert] Alert debounced:', alert.id);
      return;
    }
    
    // Update debounce map
    const newDebounceMap = new Map(state.alertDebounceMap);
    newDebounceMap.set(alert.id, now);
    
    // Compute distance if both locations are available
    let distance: number | undefined;
    if (userLocation && alert.geo) {
      distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        alert.geo.lat,
        alert.geo.lng
      );
      console.log('📏 [useAlertsStore.addAlert] Distance calculated:', distance, 'meters');
    }
    
    // Add alert with computed distance
    const alertWithDistance: Alert = {
      ...alert,
      distance,
    };
    
    console.log('➕ [useAlertsStore.addAlert] Adding alert:', alertWithDistance.id);
    
    set({
      alerts: [...state.alerts, alertWithDistance],
      alertDebounceMap: newDebounceMap,
    });
  },

  /**
   * Remove an alert from the store
   * Called after acknowledgment
   * 
   * @param alertId - ID of alert to remove
   */
  removeAlert: (alertId: string) => {
    console.log('➖ [useAlertsStore.removeAlert] Removing alert:', alertId);
    
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    }));
  },

  /**
   * Start foreground alert monitoring
   * Tries WebSocket first, falls back to polling if unavailable
   * 
   * @param userLocation - Current user location
   */
  startForegroundAlerts: async (userLocation: { lat: number; lng: number }) => {
    const state = get();
    
    if (state.subscribed) {
      console.log('⚠️ [useAlertsStore.startForegroundAlerts] Already subscribed');
      return;
    }
    
    console.log('🚀 [useAlertsStore.startForegroundAlerts] Starting alert monitoring...');
    
    set({ subscribed: true, lastCheckedAt: new Date().toISOString() });
    
    // Try WebSocket first
    try {
      get().connectWebSocket(userLocation);
      console.log('✅ [useAlertsStore.startForegroundAlerts] WebSocket connection initiated');
    } catch (error) {
      console.warn('⚠️ [useAlertsStore.startForegroundAlerts] WebSocket failed, falling back to polling:', error);
      // Fall back to polling
      startPolling(userLocation, set, get);
    }
  },

  /**
   * Stop foreground alert monitoring
   * Disconnects WebSocket and stops polling
   */
  stopForegroundAlerts: () => {
    console.log('🛑 [useAlertsStore.stopForegroundAlerts] Stopping alert monitoring...');
    
    const state = get();
    
    // Disconnect WebSocket
    get().disconnectWebSocket();
    
    // Stop polling
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval);
      console.log('⏹️ [useAlertsStore.stopForegroundAlerts] Polling stopped');
    }
    
    set({
      subscribed: false,
      pollingInterval: null,
    });
  },

  /**
   * Connect to WebSocket for real-time alerts
   * Falls back to polling if connection fails
   * 
   * @param userLocation - Current user location
   */
  connectWebSocket: (userLocation: { lat: number; lng: number }) => {
    const state = get();
    
    // Close existing connection if any
    if (state.wsConnection) {
      console.log('🔌 [useAlertsStore.connectWebSocket] Closing existing connection');
      state.wsConnection.close();
    }
    
    console.log('🔌 [useAlertsStore.connectWebSocket] Establishing WebSocket connection...');
    
    try {
      const ws = connectAlertsSocket(
        // onMessage
        (message: WebSocketMessage) => {
          if (message.type === 'DURESS_ALERT' && message.alert) {
            console.log('🚨 [useAlertsStore.connectWebSocket] DURESS_ALERT received');
            get().addAlert(message.alert, userLocation);
          }
        },
        // onError
        (error: Event) => {
          console.error('❌ [useAlertsStore.connectWebSocket] WebSocket error:', error);
          // Fall back to polling on error
          console.log('🔄 [useAlertsStore.connectWebSocket] Falling back to polling...');
          get().disconnectWebSocket();
          startPolling(userLocation, set, get);
        },
        // onClose
        (event: CloseEvent) => {
          console.log('🔌 [useAlertsStore.connectWebSocket] WebSocket closed:', event.code);
          
          // Only fall back to polling if we're still subscribed
          const currentState = get();
          if (currentState.subscribed && !currentState.pollingInterval) {
            console.log('🔄 [useAlertsStore.connectWebSocket] Connection closed, falling back to polling...');
            startPolling(userLocation, set, get);
          }
        }
      );
      
      set({ wsConnection: ws });
      console.log('✅ [useAlertsStore.connectWebSocket] WebSocket connection established');
    } catch (error) {
      console.error('❌ [useAlertsStore.connectWebSocket] Failed to connect:', error);
      // Fall back to polling
      startPolling(userLocation, set, get);
    }
  },

  /**
   * Disconnect WebSocket connection
   */
  disconnectWebSocket: () => {
    const state = get();
    
    if (state.wsConnection) {
      console.log('🔌 [useAlertsStore.disconnectWebSocket] Closing WebSocket connection');
      state.wsConnection.close();
      set({ wsConnection: null });
    }
  },
}));

/**
 * Start polling for nearby alerts
 * Used as fallback when WebSocket is unavailable
 * 
 * @param userLocation - Current user location
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
function startPolling(
  userLocation: { lat: number; lng: number },
  set: (partial: Partial<AlertsState>) => void,
  get: () => AlertsStore
) {
  console.log('🔄 [startPolling] Starting polling with interval:', ALERT_POLL_INTERVAL_MS, 'ms');
  
  // Poll immediately
  pollForAlerts(userLocation, set, get);
  
  // Set up polling interval
  const interval = setInterval(() => {
    pollForAlerts(userLocation, set, get);
  }, ALERT_POLL_INTERVAL_MS);
  
  set({ pollingInterval: interval });
}

/**
 * Poll for nearby alerts
 * 
 * @param userLocation - Current user location
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
async function pollForAlerts(
  userLocation: { lat: number; lng: number },
  set: (partial: Partial<AlertsState>) => void,
  get: () => AlertsStore
) {
  try {
    const state = get();
    
    console.log('🔍 [pollForAlerts] Polling for nearby alerts...');
    
    const response = await pollNearbyAlerts(
      userLocation,
      ALERT_RADIUS_METERS,
      state.lastCheckedAt || undefined
    );
    
    if (response.ok && response.alerts.length > 0) {
      console.log('📨 [pollForAlerts] Received', response.alerts.length, 'alerts');
      
      // Add each alert
      response.alerts.forEach((alert) => {
        get().addAlert(alert, userLocation);
      });
    }
    
    // Update last checked timestamp
    set({ lastCheckedAt: new Date().toISOString() });
  } catch (error) {
    console.error('❌ [pollForAlerts] Failed to poll alerts:', error);
  }
}
