/**
 * AlertBanner Component
 * 
 * Displays a high-contrast alert banner when a nearby duress alert is detected.
 * Shows user information, distance, and action buttons for responding to the alert.
 * 
 * Features:
 * - High contrast red background with white text for visibility
 * - Haptic feedback on mount to alert the user
 * - Accessible labels and roles for screen readers
 * - Conditional NFC button based on feature flag
 * - Action buttons: Acknowledge, View Map, Call Emergency, NFC Confirm
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '../lib/theme';
import { isNfcAvailable } from '../lib/nfc';

export interface AlertBannerProps {
  alert: {
    id: string;
    customerRef: string;
    distance?: string;
  };
  onAck: () => void;
  onMap: () => void;
  onCall: () => void;
  onNfc?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onAck,
  onMap,
  onCall,
  onNfc,
}) => {
  useEffect(() => {
    // Trigger haptic feedback (warning pattern) on component mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel="Nearby duress alert notification"
    >
      <View style={styles.header}>
        <Text
          style={styles.title}
          accessibilityLabel="Nearby duress alert"
        >
          ⚠️ Nearby Duress Alert
        </Text>
      </View>

      <Text style={styles.info} accessibilityLabel={`User in duress: ${alert.customerRef}`}>
        User: {alert.customerRef}
      </Text>

      {alert.distance && (
        <Text style={styles.info} accessibilityLabel={`Distance: ${alert.distance}`}>
          Distance: {alert.distance}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onAck}
          accessibilityLabel="Acknowledge alert"
          accessibilityHint="Tap to acknowledge that you have seen this alert"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Acknowledge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onMap}
          accessibilityLabel="View map"
          accessibilityHint="Tap to view the alert location on a map"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>View Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onCall}
          accessibilityLabel="Call emergency"
          accessibilityHint="Tap to call emergency services"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Call Emergency</Text>
        </TouchableOpacity>

        {isNfcAvailable && onNfc && (
          <TouchableOpacity
            style={[styles.button, styles.nfcButton]}
            onPress={onNfc}
            accessibilityLabel="NFC confirm"
            accessibilityHint="Tap to confirm your presence via NFC"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>📱 NFC Confirm</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF5252',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
  header: {
    marginBottom: spacing.md,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  } as TextStyle,
  info: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    lineHeight: 20,
  } as TextStyle,
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,
  primaryButton: {
    backgroundColor: '#FFFFFF',
  } as ViewStyle,
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  } as ViewStyle,
  nfcButton: {
    backgroundColor: '#FFFFFF',
  } as ViewStyle,
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 20,
  } as TextStyle,
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  } as TextStyle,
});

export default AlertBanner;
