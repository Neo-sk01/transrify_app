# Requirements Document

## Introduction

Transrify is an Expo-managed React Native mobile application that provides a dual-PIN authentication system for silent duress detection. The app enables users to authenticate with either a normal PIN (regular access) or a duress PIN (silent distress signal) without revealing the duress state to potential attackers. The app features a dark-themed UI and is designed to run in Expo Go without custom native modules. The authentication system uses a replaceable adapter pattern that integrates with the Transrify duress detection API, allowing future integration with various backend services.

## Glossary

- **Transrify App**: The mobile application being developed
- **Transrify API**: The backend duress detection service that processes dual-PIN authentication
- **Normal PIN**: The user's regular authentication PIN that grants full access to the application
- **Duress PIN**: An alternative PIN that signals distress while appearing to authenticate normally
- **Verdict**: The authentication result returned by the API (NORMAL, DURESS, or FAIL)
- **Auth Adapter**: An interface-based authentication module that can be swapped for different backend implementations
- **Expo Go**: The Expo client app that allows running React Native apps without building native code
- **SecureStore**: Expo's encrypted key-value storage for sensitive data like authentication tokens
- **Auth Gate**: Navigation logic that determines which screen stack to show based on authentication state
- **AuthStack**: Navigation stack containing unauthenticated screens (Login)
- **AppStack**: Navigation stack containing authenticated screens (Landing)
- **Session ID**: A unique identifier for an authentication session returned by the Transrify API
- **Tenant Key**: The organization's unique API key for accessing the Transrify API
- **Customer Reference**: A unique identifier for the user account within the tenant's system

## Requirements

### Requirement 1

**User Story:** As a first-time user, I want to see a login screen when I open the app, so that I can authenticate before accessing the application.

#### Acceptance Criteria

1. WHEN THE Transrify App launches AND no authentication token exists in SecureStore, THE Transrify App SHALL display the Login screen
2. THE Login screen SHALL display customer reference input field, PIN input field, and sign-in button
3. THE Login screen SHALL display the title "Welcome back" and subtitle "Sign in to continue"
4. THE Login screen SHALL display disabled placeholder links for "Forgot password?" and "Create account"
5. THE PIN input field SHALL mask entered digits for security

### Requirement 2

**User Story:** As a user, I want to enter my customer reference and PIN to log in, so that I can access my account.

#### Acceptance Criteria

1. WHEN the user enters text in the customer reference field, THE Transrify App SHALL validate that the reference is alphanumeric with 3 to 50 characters
2. WHEN the user enters text in the PIN field, THE Transrify App SHALL validate that the PIN contains 4 to 8 digits
3. WHEN the customer reference format is invalid OR the PIN length is invalid, THE Transrify App SHALL disable the sign-in button
4. WHEN the user taps the sign-in button with valid input, THE Transrify App SHALL display a loading spinner on the button
5. WHILE the authentication request is processing, THE Transrify App SHALL prevent additional sign-in button taps

### Requirement 3

**User Story:** As a user, I want the app to communicate with the Transrify API for authentication, so that the dual-PIN duress detection system works correctly.

#### Acceptance Criteria

1. WHEN the user submits valid credentials, THE Transrify App SHALL send a POST request to the Transrify API endpoint "/v1/sessions/login"
2. THE Transrify App SHALL include tenant key, customer reference, PIN, device information, and geolocation in the authentication request
3. THE Transrify App SHALL set device platform to the current platform ("ios" or "android")
4. THE Transrify App SHALL set device version to the current app version from the app bundle
5. WHEN geolocation permission is granted, THE Transrify App SHALL include latitude and longitude coordinates in the authentication request
6. WHEN the API returns a response, THE Transrify App SHALL extract the verdict, recommended action, and session ID from the response

### Requirement 4

**User Story:** As a user, I want the app to handle different authentication outcomes appropriately, so that I receive the correct level of access.

#### Acceptance Criteria

1. WHEN the API returns verdict "NORMAL", THE Transrify App SHALL store the session token in SecureStore and navigate to the full-access Landing screen
2. WHEN the API returns verdict "DURESS", THE Transrify App SHALL store the session token in SecureStore and navigate to the limited-access Landing screen
3. WHEN the API returns verdict "FAIL", THE Transrify App SHALL display the error message "Invalid credentials. Please try again." and remain on the Login screen
4. THE Transrify App SHALL NOT display any visual indication that differentiates between NORMAL and DURESS authentication states
5. WHEN authentication succeeds with either NORMAL or DURESS verdict, THE Transrify App SHALL store the session ID in SecureStore

### Requirement 5

**User Story:** As a user, I want to see clear error messages when login fails, so that I understand what went wrong.

#### Acceptance Criteria

1. WHEN the API returns an error with code "INVALID_TENANT_KEY", THE Transrify App SHALL display the error message "Configuration error. Please contact support."
2. WHEN the API returns an error with code "TENANT_SUSPENDED", THE Transrify App SHALL display the error message "Service unavailable. Please contact support."
3. WHEN the API returns an error with code "RATE_LIMIT_EXCEEDED", THE Transrify App SHALL display the error message "Too many attempts. Please wait a minute."
4. WHEN a network error occurs during authentication, THE Transrify App SHALL display the error message "Network error. Please check your connection."
5. WHEN an error is displayed, THE Transrify App SHALL re-enable the sign-in button
6. THE Transrify App SHALL clear any previous error messages when the user modifies the customer reference or PIN fields

### Requirement 6

**User Story:** As an authenticated user, I want to be taken directly to the landing screen when I reopen the app, so that I don't have to log in every time.

#### Acceptance Criteria

1. WHEN THE Transrify App launches AND a valid authentication token exists in SecureStore, THE Transrify App SHALL display the Landing screen
2. WHEN THE Transrify App reads the token from SecureStore, THE Transrify App SHALL complete the operation within 2 seconds
3. IF the token read operation fails, THEN THE Transrify App SHALL treat the user as unauthenticated and display the Login screen
4. WHILE the token is being read from SecureStore, THE Transrify App SHALL display a loading indicator

### Requirement 7

**User Story:** As an authenticated user, I want to see my account information on the landing screen, so that I know I'm logged in correctly.

#### Acceptance Criteria

1. THE Landing screen SHALL display the Transrify logo in the header
2. THE Landing screen SHALL display the user's customer reference in the header
3. THE Landing screen SHALL display a card with the text "You're signed in."
4. THE Landing screen SHALL display the last 4 characters of the session ID in the card
5. THE Landing screen SHALL display a "Log out" button

### Requirement 8

**User Story:** As an authenticated user, I want to log out of the app, so that I can secure my account when I'm done.

#### Acceptance Criteria

1. WHEN the user taps the "Log out" button, THE Transrify App SHALL remove the authentication token from SecureStore
2. WHEN the user taps the "Log out" button, THE Transrify App SHALL remove the session ID from SecureStore
3. WHEN the user taps the "Log out" button, THE Transrify App SHALL clear the user data from the application state
4. WHEN the logout operation completes, THE Transrify App SHALL navigate to the Login screen
5. WHEN the user returns to the Login screen after logout, THE Transrify App SHALL display empty customer reference and PIN fields

### Requirement 9

**User Story:** As a user in a duress situation, I want the app to appear completely normal when I use my duress PIN, so that attackers cannot detect that I've signaled for help.

#### Acceptance Criteria

1. WHEN the API returns verdict "DURESS", THE Transrify App SHALL display the Landing screen with identical visual appearance to the NORMAL verdict
2. WHEN the API returns verdict "DURESS", THE Transrify App SHALL NOT display any alerts, warnings, or notifications that indicate duress state
3. WHEN the API returns verdict "DURESS", THE Transrify App SHALL NOT modify the UI in any way that could reveal the duress state to an observer
4. WHEN the API returns verdict "DURESS", THE Transrify App SHALL store the session mode in SecureStore for internal tracking without displaying it
5. THE Transrify App SHALL NOT include any debug logs, console messages, or error messages that reveal the duress state

### Requirement 10

**User Story:** As a user, I want the app to request location permission, so that emergency responders can locate me if I use my duress PIN.

#### Acceptance Criteria

1. WHEN THE Transrify App launches for the first time, THE Transrify App SHALL request location permission with the message "We use your location to enhance security and provide emergency assistance if needed."
2. WHEN location permission is granted, THE Transrify App SHALL obtain the current latitude and longitude coordinates
3. WHEN location permission is denied, THE Transrify App SHALL proceed with authentication without location data
4. WHEN location data is unavailable within 5 seconds, THE Transrify App SHALL proceed with authentication using cached location or no location data
5. THE Transrify App SHALL include location data in the authentication request when available

### Requirement 11

**User Story:** As a developer, I want the authentication system to use an adapter interface, so that I can easily swap authentication backends in the future.

#### Acceptance Criteria

1. THE Auth Adapter SHALL define a signIn method that accepts customer reference and PIN parameters and returns a Promise with verdict, session ID, and recommended action
2. THE Auth Adapter SHALL define a signOut method that returns a Promise
3. THE Auth Adapter SHALL define a getCurrentUser method that returns a Promise with user data or null
4. THE Transrify App SHALL interact with authentication only through the Auth Adapter interface
5. THE Auth Adapter SHALL support both mock implementation for development and production Transrify API implementation

### Requirement 12

**User Story:** As a user with accessibility needs, I want the app to be fully accessible with screen readers, so that I can navigate and use all features.

#### Acceptance Criteria

1. THE Transrify App SHALL provide accessibility labels for all input fields
2. THE Transrify App SHALL set accessibilityRole="button" for all interactive button elements
3. THE Transrify App SHALL ensure all interactive elements are reachable via screen reader navigation
4. THE Transrify App SHALL maintain color contrast ratios of at least 4.5:1 between text and background colors

### Requirement 13

**User Story:** As a user, I want the app to have a consistent dark theme, so that I have a comfortable viewing experience.

#### Acceptance Criteria

1. THE Transrify App SHALL use background color #0B0B10 for screen backgrounds
2. THE Transrify App SHALL use background color #15151E for card components
3. THE Transrify App SHALL use color #7C4DFF for primary interactive elements
4. THE Transrify App SHALL use color #EDEDED for primary text and color #A0A0AE for muted text
5. THE Transrify App SHALL apply rounded corners (16px radius) and 16px padding to button components

### Requirement 14

**User Story:** As a developer, I want comprehensive test coverage for critical flows, so that I can ensure the app works correctly.

#### Acceptance Criteria

1. THE test suite SHALL verify that the Login screen renders customer reference and PIN input fields
2. THE test suite SHALL verify that the sign-in button is disabled when input is invalid
3. THE test suite SHALL verify that valid credentials trigger the Auth Adapter and navigate to the Landing screen
4. THE test suite SHALL verify that the Landing screen displays the user's customer reference
5. THE test suite SHALL verify that the log out action clears the token and navigates to the Login screen
6. THE test suite SHALL verify that DURESS verdict navigates to Landing screen without visual differentiation from NORMAL verdict

### Requirement 15

**User Story:** As a developer, I want the app to run in Expo Go on both iOS and Android, so that I can test without building native code.

#### Acceptance Criteria

1. THE Transrify App SHALL use only Expo SDK 52 compatible packages
2. THE Transrify App SHALL NOT include any packages that require custom native modules or prebuild
3. WHEN launched in Expo Go on iOS, THE Transrify App SHALL display all screens without crashes or errors
4. WHEN launched in Expo Go on Android, THE Transrify App SHALL display all screens without crashes or errors
5. THE Transrify App SHALL pass TypeScript type checking without errors

### Requirement 16

**User Story:** As a developer, I want to securely store API credentials and configuration, so that the app can communicate with the Transrify API.

#### Acceptance Criteria

1. THE Transrify App SHALL store the tenant API key in SecureStore
2. THE Transrify App SHALL read the API base URL from environment configuration
3. THE Transrify App SHALL NOT hardcode sensitive credentials in the source code
4. THE Transrify App SHALL support different API base URLs for development, staging, and production environments
5. THE Transrify App SHALL validate that the tenant key is present before making authentication requests

### Requirement 17

**User Story:** As a user in duress mode, I want the app to enable limited mode monitoring, so that my activity can be tracked for safety purposes.

#### Acceptance Criteria

1. WHEN the API returns verdict "DURESS", THE Transrify App SHALL set limitedMode flag to true in the auth state
2. WHEN limitedMode is true, THE Landing screen SHALL display a subtle "Limited Mode" pill indicator
3. THE Transrify App SHALL persist the limitedMode flag in SecureStore alongside the session data
4. WHEN the user logs out, THE Transrify App SHALL clear the limitedMode flag
5. THE limitedMode indicator SHALL be subtle and not alarming to avoid alerting potential attackers

### Requirement 18

**User Story:** As a user, I want the app to verify my session on app resume, so that my authentication remains valid.

#### Acceptance Criteria

1. WHEN THE Transrify App resumes from background, THE Transrify App SHALL call the session verify endpoint with the current session ID
2. THE Transrify App SHALL send a GET request to "/v1/sessions/verify" with the session ID as a query parameter
3. WHEN the verify response indicates the session is invalid, THE Transrify App SHALL clear the session and navigate to Login
4. WHEN the verify response indicates the session is valid, THE Transrify App SHALL continue with the current session
5. THE Transrify App SHALL handle network errors during verification gracefully without logging out the user

### Requirement 19

**User Story:** As a user in duress mode, I want to capture evidence securely, so that authorities can be notified with proof.

#### Acceptance Criteria

1. WHEN limitedMode is true AND the user captures media, THE Transrify App SHALL request a presigned upload URL from the API
2. THE Transrify App SHALL send a POST request to "/v1/evidence/presign" with incident ID and content type
3. THE Transrify App SHALL receive a presigned PUT URL and S3 object key from the presign response
4. THE Transrify App SHALL upload the media file to the presigned URL using a PUT request
5. THE Transrify App SHALL compute the SHA-256 hash of the uploaded file client-side using expo-crypto

### Requirement 20

**User Story:** As a user in duress mode, I want evidence uploads to be finalized, so that the evidence is properly recorded.

#### Acceptance Criteria

1. WHEN the media upload to S3 completes successfully, THE Transrify App SHALL send a POST request to "/evidence/finalize"
2. THE finalize request SHALL include incident ID, evidence kind, S3 key, file size, and SHA-256 hash
3. THE Transrify App SHALL support evidence kinds: VIDEO, AUDIO, PHOTO, NEARBY, TEXT
4. WHEN the finalize response is successful, THE Transrify App SHALL receive a confirmation with evidence ID
5. THE Transrify App SHALL handle finalize errors by retrying up to 2 times with exponential backoff

### Requirement 21

**User Story:** As a user, I want the app to request necessary permissions for evidence collection, so that I can capture media when needed.

#### Acceptance Criteria

1. WHEN evidence collection is initiated, THE Transrify App SHALL request camera permission if not already granted
2. WHEN audio evidence is needed, THE Transrify App SHALL request microphone permission if not already granted
3. THE Transrify App SHALL use expo-camera for camera access
4. THE Transrify App SHALL use expo-av for audio recording
5. WHEN permissions are denied, THE Transrify App SHALL display an error message and not attempt to capture media

### Requirement 22

**User Story:** As a developer, I want the app to handle API rate limits gracefully, so that users have a smooth experience.

#### Acceptance Criteria

1. WHEN the API returns HTTP status 429, THE Transrify App SHALL recognize this as a rate limit error
2. THE Transrify App SHALL implement exponential backoff with jitter for rate-limited requests
3. THE first retry SHALL wait 800-1200 milliseconds before retrying
4. THE Transrify App SHALL limit retries to a maximum of 2 attempts for rate-limited requests
5. WHEN rate limit retries are exhausted, THE Transrify App SHALL display the error message "Too many requests. Please try again in a moment."

### Requirement 23

**User Story:** As a developer, I want a typed API client, so that all API calls are type-safe and consistent.

#### Acceptance Criteria

1. THE Transrify App SHALL implement a generic API client function that accepts a path and request options
2. THE API client SHALL automatically include Content-Type header as "application/json"
3. THE API client SHALL construct full URLs by combining the base URL with the provided path
4. THE API client SHALL parse JSON responses and return typed data
5. THE API client SHALL throw errors for non-2xx HTTP status codes with the status code included

### Requirement 24

**User Story:** As a user in duress mode, I want to silently alert nearby users in my organization, so that help can be dispatched quickly without alerting my attacker.

#### Acceptance Criteria

1. WHEN the API returns verdict "DURESS", THE Transrify App SHALL send a POST request to "/v1/alerts/duress" with session ID, tenant key, geolocation, and device information
2. THE duress alert request SHALL include alertKind set to "DURESS"
3. THE Transrify App SHALL send the duress alert immediately after successful duress authentication
4. WHEN the duress alert is sent successfully, THE Transrify App SHALL receive an alert ID in the response
5. THE Transrify App SHALL NOT display any visual indication that a duress alert has been sent

### Requirement 25

**User Story:** As a user with the app installed, I want to receive alerts when nearby colleagues are in duress, so that I can respond or notify authorities.

#### Acceptance Criteria

1. WHEN THE Transrify App is in the foreground AND the user is authenticated, THE Transrify App SHALL subscribe to nearby alerts for the user's tenant
2. THE Transrify App SHALL poll the "/v1/alerts/nearby" endpoint every 15 seconds when WebSocket is unavailable
3. THE Transrify App SHALL include tenant key, current geolocation, radius in meters, and timestamp in the nearby alerts request
4. WHEN a DURESS alert is received for the user's tenant, THE Transrify App SHALL display an in-app alert banner
5. THE Transrify App SHALL stop polling for nearby alerts when the app moves to background or user logs out

### Requirement 26

**User Story:** As a user receiving a duress alert, I want to see relevant information about the alert, so that I can assess the situation and respond appropriately.

#### Acceptance Criteria

1. THE alert banner SHALL display the text "Nearby Duress Alert"
2. THE alert banner SHALL display the customer reference of the user in duress
3. THE alert banner SHALL display the approximate distance to the duress location when geolocation is available
4. THE alert banner SHALL provide action buttons for "Acknowledge", "View Map", and "Call Emergency"
5. THE alert banner SHALL use high-contrast colors and accessible labels for screen readers

### Requirement 27

**User Story:** As a user receiving a duress alert, I want to acknowledge the alert, so that others know I am aware and responding.

#### Acceptance Criteria

1. WHEN the user taps the "Acknowledge" button on an alert banner, THE Transrify App SHALL send a POST request to "/v1/alerts/ack"
2. THE acknowledgment request SHALL include the alert ID, acknowledging user's customer reference, and method set to "PUSH" or "INAPP"
3. WHEN the acknowledgment is successful, THE Transrify App SHALL dismiss the alert banner
4. WHEN the acknowledgment fails, THE Transrify App SHALL display an error message and keep the banner visible
5. THE Transrify App SHALL provide haptic feedback when the alert is acknowledged

### Requirement 28

**User Story:** As a user receiving a duress alert, I want to receive notifications even when the app is in the background, so that I don't miss critical alerts.

#### Acceptance Criteria

1. WHEN THE Transrify App is installed AND notification permissions are granted, THE Transrify App SHALL register for push notifications
2. WHEN a duress alert is received while the app is in the background, THE Transrify App SHALL display a push notification
3. THE push notification SHALL include the text "Nearby Duress Alert" and the customer reference
4. WHEN the user taps the push notification, THE Transrify App SHALL open and display the alert banner
5. THE Transrify App SHALL request notification permissions on first launch or when alerts are enabled

### Requirement 29

**User Story:** As a user receiving a duress alert, I want haptic and audio feedback, so that I notice the alert immediately.

#### Acceptance Criteria

1. WHEN a duress alert is received in the foreground, THE Transrify App SHALL trigger a haptic notification
2. WHEN a duress alert is received in the foreground, THE Transrify App SHALL play a soft alert sound
3. THE Transrify App SHALL debounce identical alerts for 60 seconds to prevent repeated haptic and audio feedback
4. THE Transrify App SHALL respect the device's silent mode settings for audio feedback
5. THE Transrify App SHALL use the "warning" haptic pattern for alert notifications

### Requirement 30

**User Story:** As a developer, I want NFC functionality to be feature-flagged, so that the app works in Expo Go while supporting NFC in production builds.

#### Acceptance Criteria

1. THE Transrify App SHALL read the EXPO_PUBLIC_NFC_ENABLED environment variable to determine NFC availability
2. WHEN EXPO_PUBLIC_NFC_ENABLED is "false" OR undefined, THE Transrify App SHALL disable all NFC features
3. WHEN EXPO_PUBLIC_NFC_ENABLED is "true", THE Transrify App SHALL enable NFC reader mode for alert acknowledgment
4. THE Transrify App SHALL NOT crash or throw errors when NFC is disabled in Expo Go
5. THE Transrify App SHALL display NFC-related UI elements only when EXPO_PUBLIC_NFC_ENABLED is "true"

### Requirement 31

**User Story:** As a responder with NFC enabled, I want to tap my device to acknowledge a duress alert, so that I can confirm my physical presence at the scene.

#### Acceptance Criteria

1. WHEN EXPO_PUBLIC_NFC_ENABLED is "true" AND an alert banner is displayed, THE Transrify App SHALL show a "Tap to Confirm via NFC" button
2. WHEN the user taps the NFC button, THE Transrify App SHALL enter NFC reader mode
3. WHEN an NFC tag is detected, THE Transrify App SHALL read the NDEF payload
4. WHEN the NFC read is successful, THE Transrify App SHALL send an acknowledgment with method set to "NFC"
5. WHEN NFC is not available on the device, THE Transrify App SHALL display an error message

### Requirement 32

**User Story:** As a user in duress mode with NFC enabled, I want my device to act as an NFC tag, so that responders can tap to confirm their presence.

#### Acceptance Criteria

1. WHEN EXPO_PUBLIC_NFC_ENABLED is "true" AND limitedMode is true, THE Transrify App SHALL enter NFC reader mode
2. THE Transrify App SHALL expose an NDEF payload containing the alert ID in the format "trf:duress:<alertId>"
3. WHEN a responder device taps the duressed device, THE Transrify App SHALL detect the NFC interaction
4. THE Transrify App SHALL maintain normal UI appearance while in NFC reader mode
5. THE Transrify App SHALL handle NFC errors gracefully without revealing duress state

### Requirement 33

**User Story:** As a developer, I want configurable alert parameters, so that the alert system can be tuned for different deployment scenarios.

#### Acceptance Criteria

1. THE Transrify App SHALL read ALERT_RADIUS_METERS from environment configuration with a default value of 1000
2. THE Transrify App SHALL read ALERT_POLL_INTERVAL_MS from environment configuration with a default value of 15000
3. THE Transrify App SHALL use the configured radius when querying for nearby alerts
4. THE Transrify App SHALL use the configured poll interval for the nearby alerts polling loop
5. THE Transrify App SHALL validate that ALERT_RADIUS_METERS is between 100 and 10000 meters

### Requirement 34

**User Story:** As a user, I want the app to request necessary permissions for alert functionality, so that I can receive and respond to alerts.

#### Acceptance Criteria

1. WHEN the user authenticates for the first time, THE Transrify App SHALL request foreground location permission
2. WHEN the user authenticates for the first time, THE Transrify App SHALL request notification permission
3. THE Transrify App SHALL explain that location is needed for proximity alerts before requesting permission
4. THE Transrify App SHALL explain that notifications are needed for background alerts before requesting permission
5. WHEN permissions are denied, THE Transrify App SHALL continue to function but disable alert features

### Requirement 35

**User Story:** As a developer, I want WebSocket support for real-time alerts, so that users receive alerts with minimal latency.

#### Acceptance Criteria

1. WHEN a WebSocket URL is configured, THE Transrify App SHALL attempt to connect to the alerts WebSocket channel
2. THE WebSocket connection SHALL include the tenant key as a query parameter
3. WHEN the WebSocket connection is established, THE Transrify App SHALL stop polling the nearby alerts endpoint
4. WHEN the WebSocket connection fails or is unavailable, THE Transrify App SHALL fall back to polling
5. WHEN the app moves to background, THE Transrify App SHALL close the WebSocket connection
