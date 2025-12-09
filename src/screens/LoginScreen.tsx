import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '../components/Screen';
import { Logo } from '../components/Logo';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { loginFormSchema, LoginFormData } from '../lib/validation';
import { authAdapter } from '../lib/auth';
import { getErrorMessage } from '../lib/errors';
import { useAuthStore } from '../state/useAuthStore';
import { colors, spacing, typography } from '../lib/theme';
import { sendDuressAlert } from '../lib/alerts';
import { getCurrentLocation } from '../lib/geo';
import { requestAlertPermissions } from '../lib/permissions';
import { setDuressIncidentId, startDuressRecording } from '../lib/duressRecording';

export interface LoginScreenProps {
  navigation: any; // Will be typed by React Navigation
}

/**
 * LoginScreen component
 * Handles user authentication with customer reference and PIN
 * 
 * Requirements:
 * - 1.1: Display login screen when no auth token exists
 * - 1.2: Display customer reference, PIN inputs, and sign-in button
 * - 1.3: Display "Welcome back" title and "Sign in to continue" subtitle
 * - 1.4: Display disabled placeholder links
 * - 1.5: Mask PIN input
 * - 2.3: Disable button when validation fails
 * - 2.4: Show loading spinner during authentication
 * - 2.5: Prevent double-submission
 * - 4.3: Handle FAIL verdict with error message
 * - 4.4: Navigate to Landing on NORMAL/DURESS verdict
 * - 10.1: Request location permission on first launch
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  // Initialize React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      tenantKey: '',
      customerRef: '',
      pin: '',
    },
  });

  /**
   * Handle sign in form submission
   * Requirements:
   * - Call auth adapter with credentials
   * - Handle NORMAL/DURESS verdicts by navigating to Landing
   * - Handle FAIL verdict by displaying error
   * - Clear error on input change
   * - Send duress alert silently after DURESS authentication (24.1-24.5)
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('🔐 [LoginScreen] Starting login attempt...');
      console.log('📝 [LoginScreen] Tenant Key:', data.tenantKey);
      console.log('📝 [LoginScreen] Customer Ref:', data.customerRef);
      console.log('📝 [LoginScreen] PIN length:', data.pin.length);

      setIsSubmitting(true);
      setError(null);

      // Store tenant key in secure storage for auth adapter
      const storage = await import('../lib/storage');
      await storage.setTenantKey(data.tenantKey);
      console.log('💾 [LoginScreen] Tenant key stored in SecureStore');

      // Call auth adapter to authenticate
      console.log('🌐 [LoginScreen] Calling authAdapter.signIn...');
      const response = await authAdapter.signIn(data.customerRef, data.pin);

      console.log('✅ [LoginScreen] Received response:', JSON.stringify(response, null, 2));
      console.log('📊 [LoginScreen] Verdict:', response.verdict);
      console.log('📊 [LoginScreen] Recommended Action:', response.recommendedAction);
      console.log('📊 [LoginScreen] Session ID:', response.sessionId);

      // Handle FAIL verdict
      if (response.verdict === 'FAIL') {
        console.log('❌ [LoginScreen] Login failed - invalid credentials');
        setError('Invalid credentials. Please try again.');
        return;
      }

      // Handle NORMAL and DURESS verdicts
      // Both navigate to Landing screen (identical UI per requirement 9.1)
      if (response.verdict === 'NORMAL' || response.verdict === 'DURESS') {
        console.log('✅ [LoginScreen] Login successful - setting session');
        console.log('🔄 [LoginScreen] Calling setSession with verdict:', response.verdict);

        // Update auth store with session data
        // This will trigger RootNavigator to automatically switch to MainAppNavigator
        setSession(
          {
            customerRef: data.customerRef,
            sessionId: response.sessionId,
          },
          response.verdict
        );

        console.log('✅ [LoginScreen] Session set - navigation should happen automatically');

        // Request alert permissions after successful authentication
        // Requirements: 34.1, 34.2, 34.3, 34.4, 34.5
        // This runs in the background and doesn't block navigation
        requestAlertPermissions()
          .then((permissions) => {
            console.log('📍 [LoginScreen] Alert permissions requested:', permissions);
            if (!permissions.location) {
              console.warn('⚠️ [LoginScreen] Location permission denied - proximity alerts will be limited');
            }
            if (!permissions.notification) {
              console.warn('⚠️ [LoginScreen] Notification permission denied - background alerts will not work');
            }
          })
          .catch((error) => {
            // Handle permission errors gracefully without blocking app functionality
            console.warn('[LoginScreen] Failed to request alert permissions:', error);
          });

        // Send duress alert silently after successful duress authentication
        // Requirements: 24.1, 24.2, 24.3, 24.4, 24.5
        // Start automatic audio and video recording for evidence capture
        if (response.verdict === 'DURESS') {
          // Wrap in try-catch to fail silently without UI indication
          try {
            // Incident ID from login response (required for evidence linkage)
            const incidentId = response.incidentId || response.sessionId;

            // Prime duress recording state with incidentId so Landing can use it
            setDuressIncidentId(incidentId);

            // Get current location for duress alert
            const geo = await getCurrentLocation();
            
            // Send duress alert with session ID, geo, and device info
            const alertResponse = await sendDuressAlert(response.sessionId, geo);
            
            // Start automatic recording immediately after alert is sent
            // Use alertId as incidentId for evidence
            await startDuressRecording(incidentId);
            
            // Log success without revealing duress state to user
            console.warn('[LoginScreen] Background operation completed');
          } catch (error) {
            // Log errors without revealing duress state
            // Use console.warn to avoid alarming developers while maintaining silence to users
            console.warn('[LoginScreen] Background operation failed:', error);
          }
        }

        // Navigation happens automatically via auth gate in RootNavigator
        // Do not call navigation.navigate() manually
      }
    } catch (err) {
      console.error('❌ [LoginScreen] Login error:', err);
      console.error('❌ [LoginScreen] Error details:', JSON.stringify(err, null, 2));

      // Map error to user-friendly message
      const errorMessage = getErrorMessage(err);
      console.log('📝 [LoginScreen] User-friendly error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 [LoginScreen] Login attempt completed');
    }
  };

  /**
   * Clear error when user modifies input
   * Requirement: 5.6 - Clear error on input change
   */
  const handleInputChange = () => {
    if (error) {
      setError(null);
    }
  };

  return (
    <Screen withKeyboardAvoid>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Tenant Key Input */}
          <Controller
            control={control}
            name="tenantKey"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Tenant Key"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  handleInputChange();
                }}
                onBlur={onBlur}
                placeholder="Enter your tenant key"
                error={errors.tenantKey?.message}
                accessibilityLabel="Tenant key input"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* Customer Reference Input */}
          <Controller
            control={control}
            name="customerRef"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Customer Reference"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  handleInputChange();
                }}
                onBlur={onBlur}
                placeholder="Enter your customer reference"
                error={errors.customerRef?.message}
                accessibilityLabel="Customer reference input"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* PIN Input */}
          <Controller
            control={control}
            name="pin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="PIN"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  handleInputChange();
                }}
                onBlur={onBlur}
                placeholder="Enter your PIN"
                secureTextEntry
                keyboardType="numeric"
                error={errors.pin?.message}
                accessibilityLabel="PIN input"
              />
            )}
          />

          {/* Error Message Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            accessibilityLabel="Sign in button"
          />

          {/* Disabled Placeholder Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity disabled style={styles.link}>
              <Text style={styles.linkTextDisabled}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled style={styles.link}>
              <Text style={styles.linkTextDisabled}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    lineHeight: typography.h1.lineHeight,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    color: colors.error,
    textAlign: 'center',
  },
  linksContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  link: {
    paddingVertical: spacing.sm,
  },
  linkTextDisabled: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    color: colors.textDisabled,
  },
});

export default LoginScreen;
