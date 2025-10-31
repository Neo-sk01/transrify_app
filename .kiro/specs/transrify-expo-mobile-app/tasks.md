# Implementation Plan

- [x] 1. Initialize Expo project and install dependencies

  - Create new Expo project with TypeScript template using Expo SDK 52
  - Install core dependencies: React Navigation, Zustand, React Hook Form, Zod
  - Install Expo packages: expo-secure-store, expo-location, expo-constants, expo-application, expo-crypto, expo-camera, expo-av
  - Install dev dependencies: Jest, @testing-library/react-native, TypeScript types
  - Configure TypeScript with strict mode enabled
  - Set up project structure with /src folder and subdirectories
  - _Requirements: 15.1, 15.2, 15.5, 19.5, 21.3, 21.4_

- [x] 2. Configure app settings and environment

  - Configure app.json with app name, version, orientation, and dark theme
  - Add iOS location, camera, and microphone permission descriptions to app.json
  - Add Android location, camera, and audio permissions to app.json
  - Create .env.example file with API_BASE_URL, TENANT_KEY variables
  - Configure babel to support environment variables
  - Set up splash screen and app icon placeholders
  - _Requirements: 10.1, 16.2, 16.3, 16.4, 21.1, 21.2_

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

- [x] 8.1 Create configuration module

  - Create src/config.ts with environment configuration
  - Export API_BASE_URL from EXPO_PUBLIC_API_BASE_URL env variable
  - Export TENANT_KEY from EXPO_PUBLIC_TENANT_KEY env variable
  - Export APP_VERSION from Constants.expoConfig.version
  - Export isAndroid and isIOS platform helpers
  - _Requirements: 16.2, 16.4_

- [x] 8.2 Implement typed API client with retry logic

  - Create src/lib/api.ts with generic api function
  - Accept path and RequestInit options as parameters
  - Automatically include Content-Type: application/json header
  - Construct full URL from API_BASE_URL and path
  - Handle 429 rate limit errors with exponential backoff (800-1200ms jitter)
  - Limit retries to 1 attempt (retry=false on second call)
  - Throw errors for non-2xx responses
  - Return typed JSON response
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 23.1, 23.2, 23.3, 23.4, 23.5_

- [x] 8.3 Implement session management functions

  - Create src/lib/sessions.ts with loginSession and verifySession functions
  - Define LoginVerdict and RecommendedAction types
  - Implement loginSession: get location permission, get coordinates, call POST /v1/sessions/login
  - Include tenantKey, customerRef, pin, deviceInfo (platform, version), geo (lat, lng) in request
  - Return typed response with verdict, recommendedAction, sessionId
  - Implement verifySession: call GET /v1/sessions/verify with sessionId query param
  - Return typed response with ok and session data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 18.1, 18.2_

- [x] 8.4 Implement evidence collection functions

  - Create src/lib/evidence.ts with presignEvidence, finalizeEvidence, sha256String, uploadToS3 functions
  - Implement presignEvidence: call POST /v1/evidence/presign with incidentId and contentType
  - Return presigned URL and S3 key
  - Implement finalizeEvidence: call POST /evidence/finalize with incidentId, kind, key, size, sha256, encIv
  - Return confirmation with evidence ID
  - Implement sha256String using Crypto.digestStringAsync with SHA-256 algorithm
  - Implement uploadToS3: PUT file to presigned URL with Content-Type header
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 20.1, 20.2, 20.3, 20.4_

- [x] 9. Implement auth state management with Zustand

  - Create state/useAuthStore.ts with Zustand store
  - Define AuthState interface with user, sessionMode, limitedMode, isAuthenticated, isLoading
  - Implement setSession action to update state, set limitedMode=true when verdict is DURESS, and store data
  - Implement clearSession action to clear state and SecureStore
  - Implement setLoading action to update loading state
  - Implement initializeAuth action to read session from SecureStore on app start and set limitedMode based on sessionMode
  - _Requirements: 4.1, 4.2, 6.1, 8.3, 17.1, 17.3_

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
  - Implement handleSignIn function to call loginSession from sessions module
  - Handle NORMAL and DURESS verdicts by calling setSession with verdict and NOT manually navigating
  - Handle FAIL verdict by displaying error message
  - Disable button during submission and when validation fails
  - Clear error on input change
  - Request location permission on first launch
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 10.1_

- [x] 15. Implement LandingScreen

  - Create screens/LandingScreen.tsx with header and card layout
  - Display Logo and customer reference in header
  - Display "You're signed in" message in card
  - Display last 4 characters of session ID in card
  - If limitedMode is true, display subtle "Limited Mode (Monitoring)" pill indicator
  - Add Log Out button
  - Implement handleLogout function to call clearSession
  - Read user data and limitedMode from auth store
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.4, 8.5, 17.2, 17.5_

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

- [x] 17.1 Implement optional session verification on app resume

  - Add AppState listener in App.tsx or AppNavigator
  - When app transitions from background to active, check if user is authenticated
  - If authenticated, call verifySession with current sessionId
  - If verification fails (ok: false), call clearSession and navigate to Login
  - If network error occurs, continue with current session (graceful degradation)
  - Handle errors gracefully without disrupting user experience
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 17.2 Update .env.example with new environment variables

  - Update .env.example to include EXPO_PUBLIC_API_BASE_URL=https://api.example.com
  - Include EXPO_PUBLIC_TENANT_KEY=DEMO_TENANT
  - Remove USE_MOCK_AUTH and APP_ENV variables (no longer needed)
  - Add comments explaining each variable
  - _Requirements: 16.2, 16.4_

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
  - Verify login flow hits backend and follows verdict rules
  - Verify DURESS verdict sets limitedMode=true and displays pill indicator
  - Verify logout flow
  - Verify app restart with active session
  - Verify app restart without session
  - Verify optional session verification on app resume
  - Test location permission flow
  - Test rate limit backoff (429 errors)
  - Test error handling scenarios
  - Verify accessibility with screen reader
  - Check color contrast ratios
  - _Requirements: 17.2, 17.5, 18.4, 22.1, 22.2, 22.5, 12.3, 12.4, 15.3, 15.4_

- [x] 25. Add evidence collection helpers (optional for future use)

  - Create helper functions for requesting camera and microphone permissions
  - Create helper function to capture photo using expo-camera
  - Create helper function to record audio using expo-av
  - Create helper function to compute SHA-256 hash of file
  - Create complete evidence upload flow: presign → upload to S3 → finalize
  - Add retry logic with exponential backoff for finalize (up to 2 retries)
  - Export evidence collection utilities for use in screens
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 20.1, 20.2, 20.3, 20.4, 20.5, 21.1, 21.2, 21.5_

- [ ] 26. Create README documentation
  - Document project setup instructions
  - Document how to run the app with Expo Go
  - Document environment variable configuration (API_BASE_URL, TENANT_KEY)
  - Document how to run tests
  - Document API endpoint contract (login, verify, presign, finalize)
  - Document evidence upload flow
  - Include screenshots of Login and Landing screens
  - _Requirements: 15.1, 15.3, 15.4_

- [x] 27. Install dependencies for Duress Proximity Alerts
  - Install expo-notifications for push notification support
  - Install expo-haptics for haptic feedback on alerts
  - Configure app.json with notification permissions for iOS and Android
  - Add notification channel configuration for Android
  - Verify packages are compatible with Expo Go
  - _Requirements: 28.1, 29.1_

- [x] 28. Implement geolocation helpers
  - Create lib/geo.ts with location and distance utilities
  - Implement getCurrentLocation function using expo-location with Balanced accuracy
  - Implement calculateDistance function using Haversine formula
  - Implement formatDistance function to display meters or kilometers
  - Handle location permission errors gracefully
  - Export geolocation utilities for use in alert system
  - _Requirements: 24.1, 26.3, 33.3_

- [x] 29. Implement alert API functions
  - Create lib/alerts.ts with alert-related API calls
  - Implement sendDuressAlert function: POST /v1/alerts/duress with sessionId, tenantKey, geo, device
  - Implement pollNearbyAlerts function: GET /v1/alerts/nearby with tenantKey, geo, radius, since params
  - Implement ackAlert function: POST /v1/alerts/ack with alertId, ackBy, method
  - Implement connectAlertsSocket function for WebSocket connection with tenant key
  - Handle WebSocket message parsing for DURESS_ALERT type
  - Export alert functions for use in screens and state management
  - _Requirements: 24.1, 24.2, 24.3, 25.2, 25.3, 27.1, 27.2, 35.1, 35.2_

- [x] 30. Implement push notification registration
  - Create lib/push.ts with push notification utilities
  - Implement registerForPushNotifications function to request permissions
  - Implement getPushTokenAsync function to retrieve Expo push token
  - Configure Android notification channel for duress alerts with high importance
  - Set vibration pattern and light color for alert notifications
  - Handle permission denial gracefully
  - Export push notification functions for use in app initialization
  - _Requirements: 28.1, 28.2, 28.5, 34.2, 34.4_

- [x] 31. Implement NFC stub module (Expo Go compatible)
  - Create lib/nfc.ts with feature-flagged NFC functions
  - Read EXPO_PUBLIC_NFC_ENABLED environment variable
  - Export isNfcAvailable boolean based on environment flag
  - Implement startNfcReader stub that throws error in Expo Go
  - Implement stopNfcReader stub for future Development Build support
  - Implement writeNfcTag stub for future Development Build support
  - Add clear error messages explaining NFC requires Development Build
  - _Requirements: 30.1, 30.2, 30.3, 30.4, 31.5_

- [x] 32. Implement alerts state management
  - Create state/useAlertsStore.ts with Zustand store
  - Define Alert interface with id, kind, sessionId, customerRef, geo, createdAt, distance
  - Define AlertsState with alerts array, lastCheckedAt, subscribed, wsConnection
  - Implement addAlert action to add new alerts and compute distance
  - Implement removeAlert action to dismiss acknowledged alerts
  - Implement startForegroundAlerts action: try WebSocket first, fall back to polling
  - Implement stopForegroundAlerts action: disconnect WebSocket and stop polling
  - Implement connectWebSocket action to establish WebSocket connection
  - Implement disconnectWebSocket action to close connection
  - Debounce identical alerts for 60 seconds to prevent spam
  - _Requirements: 25.1, 25.2, 25.4, 25.5, 29.3, 35.3, 35.4, 35.5_

- [x] 33. Create AlertBanner component
  - Create components/AlertBanner.tsx with alert display and actions
  - Display "⚠️ Nearby Duress Alert" title with high contrast
  - Display customer reference of user in duress
  - Display distance to duress location if available
  - Add "Acknowledge", "View Map", and "Call Emergency" action buttons
  - Conditionally show "📱 NFC Confirm" button when EXPO_PUBLIC_NFC_ENABLED is true
  - Trigger haptic feedback (warning pattern) on component mount
  - Style with red background (#FF5252), white text, and accessible labels
  - Add accessibility role="alert" and proper button labels
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 29.1, 29.5, 30.5, 31.1_

- [x] 34. Update LoginScreen to send duress alerts
  - Import sendDuressAlert, getCurrentLocation from alert libraries
  - After successful duress authentication (verdict === 'DURESS'), get current location
  - Call sendDuressAlert with sessionId, tenantKey, geo, device info (platform, appVersion)
  - Wrap duress alert sending in try-catch to fail silently (no UI indication)
  - Log errors to console.warn without revealing duress state to user
  - Ensure no visual difference between NORMAL and DURESS authentication flows
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [x] 35. Update LandingScreen to display alerts
  - Import useAlertsStore, AlertBanner, and alert functions
  - Add state for user's current location
  - On component mount, get current location and call startForegroundAlerts
  - On component unmount, call stopForegroundAlerts to clean up subscriptions
  - Read alerts array from useAlertsStore
  - Compute distance for first alert using calculateDistance and formatDistance
  - Render AlertBanner when alerts[0] exists
  - Implement handleAck to call ackAlert with 'INAPP' method and remove alert from store
  - Implement handleMap as mock (console.log for now)
  - Implement handleCall as mock (console.log for now)
  - Implement handleNfc as mock (console.log for now)
  - _Requirements: 25.1, 25.4, 26.3, 27.1, 27.2, 27.3, 27.5_

- [x] 36. Add alert configuration to environment
  - Update .env.example with EXPO_PUBLIC_NFC_ENABLED=false
  - Add EXPO_PUBLIC_WS_URL for WebSocket connection (optional)
  - Add ALERT_RADIUS_METERS=1000 for nearby alert search radius
  - Add ALERT_POLL_INTERVAL_MS=15000 for polling interval
  - Add comments explaining each alert-related variable
  - Document Expo Go vs Development Build differences for NFC
  - _Requirements: 30.1, 33.1, 33.2, 34.3_

- [x] 37. Request permissions for alert functionality
  - Update LoginScreen or App.tsx to request location permission on first launch
  - Request notification permission on first launch or after authentication
  - Display permission rationale before requesting (location for proximity, notifications for background alerts)
  - Handle permission denial gracefully without blocking app functionality
  - Store permission status in state to avoid repeated requests
  - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5_

- [x] 38. Write unit tests for alert functions
  - Create tests/alerts.test.ts
  - Test sendDuressAlert with valid data
  - Test pollNearbyAlerts with different parameters
  - Test ackAlert with different methods (NFC, PUSH, INAPP)
  - Test connectAlertsSocket connection and message handling
  - Mock fetch and WebSocket for testing
  - _Requirements: 24.1, 25.2, 27.1_

- [x] 39. Write unit tests for geolocation helpers
  - Create tests/geo.test.ts
  - Test calculateDistance with known coordinates
  - Test formatDistance with meters and kilometers
  - Test getCurrentLocation with granted and denied permissions
  - Mock expo-location for testing
  - _Requirements: 26.3, 28.8_

- [x] 40. Write integration tests for AlertBanner
  - Create tests/AlertBanner.test.tsx
  - Test that alert information is displayed correctly
  - Test that action buttons trigger callbacks
  - Test that NFC button is conditionally rendered based on feature flag
  - Test haptic feedback is triggered on mount
  - Mock expo-haptics for testing
  - _Requirements: 26.1, 26.4, 30.5_

- [x] 41. Write integration tests for alert flow
  - Create tests/alertFlow.test.ts
  - Test duress login triggers sendDuressAlert
  - Test LandingScreen subscribes to alerts on mount
  - Test alert acknowledgment removes alert from store
  - Test WebSocket fallback to polling
  - Mock API calls and WebSocket for testing
  - _Requirements: 24.1, 25.1, 27.3, 35.4_

- [ ] 42. Manual testing for Duress Proximity Alerts
  - Test duress login sends alert without visual indication
  - Test nearby device receives alert in foreground (polling or WebSocket)
  - Test alert banner displays with correct information and distance
  - Test acknowledge button dismisses alert
  - Test haptic and audio feedback on alert receipt
  - Test NFC button only appears when EXPO_PUBLIC_NFC_ENABLED=true
  - Test background push notifications (if configured)
  - Test with two devices: one duress, one nearby
  - Test WebSocket connection and fallback to polling
  - Test alert debouncing (no repeated alerts within 60s)
  - Verify Expo Go compatibility (NFC disabled)
  - Test location permission flow
  - Test notification permission flow
  - _Requirements: 24.5, 25.4, 26.5, 27.5, 28.2, 28.3, 29.3, 30.4, 31.1, 34.5_

- [ ] 43. Update README with alert system documentation
  - Document Duress Proximity Alerts feature
  - Explain Expo Go vs Development Build for NFC support
  - Document alert configuration variables (NFC_ENABLED, WS_URL, RADIUS, POLL_INTERVAL)
  - Document how to test alerts with two devices
  - Document WebSocket vs polling behavior
  - Document permission requirements (location, notifications)
  - Include screenshots of AlertBanner
  - _Requirements: 30.1, 33.1, 34.3, 35.1_
