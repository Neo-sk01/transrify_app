import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { useAuthStore } from '../state/useAuthStore';
import { colors } from '../lib/theme';

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
 * 
 * Auth Gate Logic:
 * 1. On mount, call initializeAuth to read session from SecureStore
 * 2. While loading, show loading indicator
 * 3. If authenticated, show AppStack (Landing)
 * 4. If not authenticated, show AuthStack (Login)
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Initialize auth state on app mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
