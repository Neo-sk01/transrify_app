import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { useAuthStore } from '../state/useAuthStore';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

/**
 * LandingScreen - Post-authentication home screen
 * Displays user information and provides logout functionality
 * UI is identical for NORMAL and DURESS session modes (plausible deniability)
 */
export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, clearSession } = useAuthStore();

  /**
   * Handle logout action
   * Clears session from SecureStore and state, then navigates to Login
   */
  const handleLogout = async () => {
    try {
      await clearSession();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if clear fails
      navigation.navigate('Login' as never);
    }
  };

  // Get last 4 characters of session ID for display
  const sessionIdTail = user?.sessionId?.slice(-4) || '----';

  return (
    <Screen>
      {/* Header with Logo and Customer Reference */}
      <View style={styles.header}>
        <Logo size="small" />
        <Text style={styles.customerRef} accessibilityLabel="Customer reference">
          {user?.customerRef || 'Unknown'}
        </Text>
      </View>

      {/* Main Content Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.signedInText} accessibilityLabel="Signed in message">
            You're signed in.
          </Text>
          <Text style={styles.sessionText} accessibilityLabel="Session ID tail">
            Session: ...{sessionIdTail}
          </Text>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="secondary"
          accessibilityLabel="Log out button"
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerRef: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  signedInText: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sessionText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LandingScreen;
