import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/AppNavigator';

/**
 * App - Root component of the Transrify mobile application
 * 
 * Requirements:
 * - 6.1: Initialize auth state on app mount
 * - 6.4: Show loading indicator while reading token from SecureStore
 * 
 * Structure:
 * 1. ErrorBoundary - Catches and handles global errors
 * 2. RootNavigator - Handles navigation and auth gate logic
 * 3. StatusBar - Configured for dark theme
 */
export default function App() {
  return (
    <ErrorBoundary>
      <RootNavigator />
      <StatusBar style="light" />
    </ErrorBoundary>
  );
}
