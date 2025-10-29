# Implementation Plan

- [x] 1. Initialize Expo project and install dependencies

  - Create new Expo project with TypeScript template using Expo SDK 52
  - Install core dependencies: React Navigation, Zustand, React Hook Form, Zod
  - Install Expo packages: expo-secure-store, expo-location, expo-constants, expo-application
  - Install dev dependencies: Jest, @testing-library/react-native, TypeScript types
  - Configure TypeScript with strict mode enabled
  - Set up project structure with /src folder and subdirectories
  - _Requirements: 15.1, 15.2, 15.5_

- [x] 2. Configure app settings and environment

  - Configure app.json with app name, version, orientation, and dark theme
  - Add iOS location permission description to app.json
  - Add Android location permissions to app.json
  - Create .env.example file with API_BASE_URL, USE_MOCK_AUTH, APP_ENV variables
  - Configure babel to support environment variables
  - Set up splash screen and app icon placeholders
  - _Requirements: 10.1, 16.2, 16.3, 16.4_

- [x] 3. Implement theme and design system

  - Create lib/theme.ts with color palette (dark theme colors)
  - Define spacing scale (xs, sm, md, lg, xl, xxl)
  - Define border radius values (sm, md, lg, xl)
  - Define typography styles (h1, h2, body, caption, button)
  - Export theme constants for use across components
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 4. Implement validation schemas

  - Create lib/validation.ts with Zod schemas
  - Implement customerRefSchema (alphanumeric, 3-50 chars, regex validation)
  - Implement pinSchema (numeric, 4-8 digits, regex validation)
  - Export validation schemas for use in forms
  - _Requirements: 2.1, 2.2_

- [x] 5. Implement secure storage utilities

  - Create lib/storage.ts with SecureStore wrapper functions
  - Implement setSessionId, getSessionId, deleteSessionId functions
  - Implement setCustomerRef, getCustomerRef, deleteCustomerRef functions
  - Implement setSessionMode, getSessionMode, deleteSessionMode functions
  - Implement setTenantKey, getTenantKey, deleteTenantKey functions
  - Implement clearAll function to remove all stored data
  - Add error handling for SecureStore operations
  - _Requirements: 4.1, 4.5, 8.1, 8.2, 16.1_

- [x] 6. Implement auth adapter interface and mock implementation

  - Create lib/auth.ts with AuthAdapter interface
  - Define LoginRequest, LoginResponse, ApiError, User types
  - Implement MockAuthAdapter class with signIn, signOut, getCurrentUser methods
  - Mock signIn logic: validate input, simulate delay, return verdict based on PIN pattern
  - Store session data in SecureStore on successful mock authentication
  - Export mock adapter for development use
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 7. Implement production auth adapter with Transrify API integration

  - Create TransrifyAuthAdapter class implementing AuthAdapter interface
  - Implement signIn method: get tenant key, device info, location, make API call
  - Request location permission and get coordinates with timeout
  - Make POST request to /v1/sessions/login with proper headers and body
  - Parse API response and extract verdict, sessionId, recommendedAction
  - Store session data in SecureStore on successful authentication
  - Implement error handling for API errors (INVALID_TENANT_KEY, RATE_LIMIT_EXCEEDED, etc.)
  - Implement signOut method to clear SecureStore
  - Implement getCurrentUser method to read from SecureStore
  - Export adapter based on environment configuration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 10.2, 10.3, 10.4, 10.5, 16.5_

- [x] 8. Implement error handling utilities

  - Create lib/errors.ts with error message mapping
  - Define ERROR_MESSAGES object with all API and network error codes
  - Implement getErrorMessage function to map errors to user-friendly messages
  - Export error utilities for use in components
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Implement auth state management with Zustand

  - Create state/useAuthStore.ts with Zustand store
  - Define AuthState interface with user, sessionMode, isAuthenticated, isLoading
  - Implement setSession action to update state and store data
  - Implement clearSession action to clear state and SecureStore
  - Implement setLoading action to update loading state
  - Implement initializeAuth action to read session from SecureStore on app start
  - _Requirements: 4.1, 4.2, 6.1, 8.3_

- [x] 10. Create reusable Button component

  - Create components/Button.tsx with primary and secondary variants
  - Implement ButtonProps interface with title, onPress, variant, loading, disabled, accessibilityLabel
  - Style button with theme colors, spacing, and border radius
  - Implement loading state with ActivityIndicator
  - Implement disabled state with reduced opacity
  - Add accessibility props (accessibilityRole, accessibilityState)
  - _Requirements: 12.2, 13.3, 13.5_

- [x] 11. Create reusable TextInput component

  - Create components/TextInput.tsx with label and error display
  - Implement TextInputProps interface with label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, accessibilityLabel
  - Style input with theme colors, spacing, and border radius
  - Implement focus and error border states
  - Display error message below input in red text
  - Add accessibility props (accessibilityLabel, accessibilityHint, accessibilityRole)
  - _Requirements: 12.1, 13.4_

- [x] 12. Create Screen wrapper component

  - Create components/Screen.tsx with SafeAreaView wrapper
  - Apply consistent background color and padding
  - Support optional KeyboardAvoidingView for forms
  - Export Screen component for use in all screens
  - _Requirements: 13.1_

- [x] 13. Create Logo component

  - Create components/Logo.tsx with Transrify branding
  - Use SVG or PNG asset for logo
  - Implement responsive sizing
  - Export Logo component for use in screens
  - _Requirements: 7.1_

- [x] 14. Implement LoginScreen

  - Create screens/LoginScreen.tsx with form layout
  - Add header with "Welcome back" title and "Sign in to continue" subtitle
  - Add customer reference TextInput with validation
  - Add PIN TextInput with secureTextEntry and numeric keyboard
  - Add error message display area
  - Add Sign In Button with loading state
  - Add disabled placeholder links for "Forgot password?" and "Create account"
  - Integrate React Hook Form with Zod validation
  - Implement handleSignIn function to call auth adapter
  - Handle NORMAL and DURESS verdicts by navigating to Landing
  - Handle FAIL verdict by displaying error message
  - Disable button during submission and when validation fails
  - Clear error on input change
  - Request location permission on first launch
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 2.4, 2.5, 4.3, 4.4, 10.1_

- [x] 15. Implement LandingScreen

  - Create screens/LandingScreen.tsx with header and card layout
  - Display Logo and customer reference in header
  - Display "You're signed in" message in card
  - Display last 4 characters of session ID in card
  - Add Log Out button
  - Implement handleLogout function to call clearSession and navigate to Login
  - Ensure UI is identical for NORMAL and DURESS session modes
  - Read user data from auth store
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 16. Implement navigation with auth gate

  - Create app/AppNavigator.tsx with Stack Navigator
  - Define AuthStack with Login screen
  - Define AppStack with Landing screen
  - Implement auth gate logic: check isAuthenticated from store
  - Show loading indicator while initializeAuth is running
  - Navigate to AppStack if authenticated, AuthStack if not
  - Call initializeAuth on app mount
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 17. Wire up App.tsx with navigation and state

  - Import AppNavigator and wrap with NavigationContainer
  - Import useAuthStore and call initializeAuth on mount
  - Add ErrorBoundary wrapper for global error handling
  - Configure status bar for dark theme
  - _Requirements: 6.1, 6.4_

- [x] 18. Write unit tests for validation schemas

  - Create tests/validation.test.ts
  - Test customerRefSchema with valid and invalid inputs
  - Test pinSchema with valid and invalid inputs
  - Verify error messages for validation failures
  - _Requirements: 14.1, 14.2_

- [x] 19. Write unit tests for storage utilities

  - Create tests/storage.test.ts
  - Test setSessionId and getSessionId
  - Test setCustomerRef and getCustomerRef
  - Test setSessionMode and getSessionMode
  - Test clearAll function removes all keys
  - Mock SecureStore for testing
  - _Requirements: 14.5_

- [ ] 20. Write unit tests for auth adapters

  - Create tests/auth.test.ts
  - Test MockAuthAdapter signIn with valid credentials
  - Test MockAuthAdapter signIn with DURESS PIN pattern
  - Test MockAuthAdapter signIn with invalid credentials
  - Test TransrifyAuthAdapter error handling
  - Mock fetch for API calls
  - _Requirements: 14.3_

- [ ] 21. Write integration tests for LoginScreen

  - Create tests/LoginScreen.test.tsx
  - Test that input fields and button render correctly
  - Test that button is disabled when input is invalid
  - Test that button is enabled when input is valid
  - Test that valid credentials trigger navigation to Landing
  - Test that invalid credentials display error message
  - Test that error clears on input change
  - Mock auth adapter and navigation
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 22. Write integration tests for LandingScreen

  - Create tests/LandingScreen.test.tsx
  - Test that customer reference is displayed
  - Test that session ID tail is displayed
  - Test that logout clears session and navigates to Login
  - Test that UI is identical for NORMAL and DURESS modes
  - Mock auth store and navigation
  - _Requirements: 14.4, 14.5, 14.6_

- [ ] 23. Configure Jest and testing environment

  - Configure jest.config.js for React Native
  - Set up test setup file with mocks for SecureStore, Location, etc.
  - Add test scripts to package.json
  - Verify all tests pass
  - _Requirements: 15.5_

- [ ] 24. Manual testing and polish

  - Test app in Expo Go on iOS device
  - Test app in Expo Go on Android device
  - Verify login flow with mock adapter
  - Verify logout flow
  - Verify app restart with active session
  - Verify app restart without session
  - Test location permission flow
  - Test error handling scenarios
  - Verify accessibility with screen reader
  - Check color contrast ratios
  - Verify no visual difference between NORMAL and DURESS modes
  - _Requirements: 9.1, 9.2, 9.3, 12.3, 12.4, 15.3, 15.4_

- [ ] 25. Create README documentation
  - Document project setup instructions
  - Document how to run the app with Expo Go
  - Document environment variable configuration
  - Document how to run tests
  - Document how to switch between mock and production auth
  - Include screenshots of Login and Landing screens
  - _Requirements: 15.1, 15.3, 15.4_
