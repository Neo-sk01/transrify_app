import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { useAuthStore } from '../state/useAuthStore';
import { colors } from '../lib/theme';
import { verifySession } from '../lib/sessions';

/**
 * Navigation type definitions
 */
export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Landing: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Create stack navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

/**
 * AuthNavigator - Stack for unauthenticated users
 * Contains only the Login screen
 */
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

/**
 * AppNavigator - Stack for authenticated users
 * Contains the Landing screen and future authenticated screens
 */
const MainAppNavigator: React.FC = () => {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen name="Landing" component={LandingScreen} />
    </AppStack.Navigator>
  );
};

/**
 * RootNavigator - Main navigation component with auth gate
 * 
 * Requirements:
 * - 6.1: Display Landing screen when valid token exists
 * - 6.2: Complete token read within 2 seconds
 * - 6.3: Display Login screen if token read fails
 * - 6.4: Show loading indicator while reading token
 * - 18.1: Verify session on app resume from background
 * - 18.2: Call verify endpoint with session ID
 * - 18.3: Clear session if verification fails
 * - 18.4: Continue with current session on network error
 * - 18.5: Handle errors gracefully without disrupting user
 * 
 * Auth Gate Logic:
 * 1. On mount, call initializeAuth to read session from SecureStore
 * 2. While loading, show loading indicator
 * 3. If authenticated, show AppStack (Landing)
 * 4. If not authenticated, show AuthStack (Login)
 * 5. On app resume, verify session if authenticated
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth, user, clearSession } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Initialize auth state on app mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle app state changes for session verification
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Check if app is transitioning from background to active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Only verify if user is authenticated and has a session ID
        if (isAuthenticated && user?.sessionId) {
          try {
            // Call verify endpoint with current session ID
            const response = await verifySession(user.sessionId);
            
            // If verification fails, clear session and navigate to Login
            if (!response.ok) {
              console.warn('Session verification failed, clearing session');
              await clearSession();
            }
            // If ok is true, continue with current session (no action needed)
          } catch (error) {
            // Network error or other error - continue with current session (graceful degradation)
            console.warn('Session verification error (continuing with current session):', error);
            // Do not clear session on network errors to avoid disrupting user experience
          }
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, user, clearSession]);

  // Show loading indicator while initializing auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth gate: show appropriate stack based on authentication status
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
