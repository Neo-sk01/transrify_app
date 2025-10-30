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
