# Requirements Document

## Introduction

This specification defines the upgrade of the Transrify mobile app's LandingScreen from a minimal authenticated view to a modern banking-style dashboard. The enhanced UI will display account balances, quick action buttons, recent transactions, and session information while maintaining full compatibility with the existing duress detection system. The design must ensure that users in duress mode (limited mode) see a normal-looking interface that does not alert potential attackers, while certain actions are subtly disabled.

## Glossary

- **LandingScreen**: The post-authentication home screen that displays account information and actions
- **Limited Mode**: The operational state when a user authenticates with their duress PIN, indicated by limitedMode flag
- **Account Card**: A visual component displaying account name, balance, currency, and account number
- **Quick Actions**: A set of four primary banking actions (Send, Receive, Top Up, Statements)
- **Transaction Item**: A list item showing merchant name, transaction note, date, and amount
- **Balance Masking**: The ability to hide/show account balances using a toggle, displaying "• • • •" when masked
- **Session Strip**: A footer component showing the last 4 characters of the session ID and logout button
- **Toast**: A brief message displayed to the user, implemented using Alert.alert
- **Expo Go**: The Expo client app that allows running React Native apps without building native code
- **SafeAreaView**: A React Native component from react-native-safe-area-context that ensures content is within safe boundaries
- **Ionicons**: The icon library from @expo/vector-icons compatible with Expo Go

## Requirements

### Requirement 1

**User Story:** As an authenticated user, I want to see a modern banking dashboard when I log in, so that I can quickly view my accounts and recent activity.

#### Acceptance Criteria

1. WHEN THE LandingScreen renders, THE LandingScreen SHALL display a header with greeting, tenant name, and notifications icon
2. THE LandingScreen SHALL display an accounts carousel showing 2 to 3 account cards
3. THE LandingScreen SHALL display a quick actions grid with 4 action buttons
4. THE LandingScreen SHALL display a recent transactions list with 8 to 12 transaction items
5. THE LandingScreen SHALL display a session strip at the bottom with session information and logout button

### Requirement 2

**User Story:** As a user, I want to see a personalized greeting in the header, so that I know I'm viewing my own account.

#### Acceptance Criteria

1. THE header SHALL display the text "Hi, {customerRef}" where customerRef is the user's customer reference
2. THE header SHALL display the tenant name or "Transrify" as a subtitle
3. THE header SHALL display a bell icon on the right side
4. WHEN mock unread notifications exist, THE bell icon SHALL display a small dot indicator
5. THE header SHALL use SafeAreaView to respect device safe areas

### Requirement 3

**User Story:** As a user in limited mode, I want to see a subtle indicator, so that I'm aware of the monitoring state without alarming observers.

#### Acceptance Criteria

1. WHEN limitedMode is true, THE LandingScreen SHALL display a "Limited Mode (Monitoring)" pill below the header
2. THE Limited Mode pill SHALL use a small rounded background with primary-tinted color
3. THE Limited Mode pill SHALL use primary text color
4. WHEN limitedMode is false, THE LandingScreen SHALL NOT display the Limited Mode pill
5. THE Limited Mode pill SHALL be subtle and not alarming in appearance

### Requirement 4

**User Story:** As a user, I want to toggle the visibility of my account balances, so that I can protect my privacy when needed.

#### Acceptance Criteria

1. THE LandingScreen SHALL display a "Show" or "Hide" toggle button above the accounts carousel
2. WHEN the toggle is in "Hide" state, THE LandingScreen SHALL display "• • • •" for all account balances
3. WHEN the toggle is in "Show" state, THE LandingScreen SHALL display formatted currency values for all account balances
4. WHEN the user taps the toggle button, THE LandingScreen SHALL switch between Show and Hide states
5. THE balance visibility state SHALL default to hidden (masked) on initial render

### Requirement 5

**User Story:** As a user, I want to see my account information in cards, so that I can quickly identify my accounts and their balances.

#### Acceptance Criteria

1. THE AccountCard SHALL display the account name (e.g., "Everyday", "Savings")
2. THE AccountCard SHALL display the balance as either masked ("• • • •") or formatted currency based on showBalances state
3. THE AccountCard SHALL display the currency code (e.g., "ZAR")
4. THE AccountCard SHALL display the last 4 digits of the account number
5. THE AccountCard SHALL use colors.card for background color

### Requirement 6

**User Story:** As a user, I want to scroll through my accounts horizontally, so that I can view all my accounts easily.

#### Acceptance Criteria

1. THE accounts carousel SHALL use a horizontal ScrollView
2. THE accounts carousel SHALL display 2 to 3 AccountCard components
3. THE accounts carousel SHALL use mock data for account information
4. THE accounts carousel SHALL allow smooth horizontal scrolling
5. THE accounts carousel SHALL display cards with consistent spacing

### Requirement 7

**User Story:** As a user, I want to access quick banking actions, so that I can perform common tasks efficiently.

#### Acceptance Criteria

1. THE quick actions grid SHALL display 4 QuickAction buttons in a 2x2 grid
2. THE quick actions SHALL include: Send (paper-plane icon), Receive (arrow-down icon), Top Up (add-circle icon), Statements (document-text icon)
3. THE QuickAction component SHALL display an icon from Ionicons
4. THE QuickAction component SHALL display a label below the icon
5. THE quick actions grid SHALL use consistent spacing between buttons

### Requirement 8

**User Story:** As a user in limited mode, I want certain actions to be disabled, so that the system can protect me while maintaining a normal appearance.

#### Acceptance Criteria

1. WHEN limitedMode is true, THE "Send" QuickAction SHALL be disabled
2. WHEN limitedMode is true, THE "Top Up" QuickAction SHALL be disabled
3. WHEN a disabled QuickAction is pressed, THE LandingScreen SHALL display a toast message "Temporarily unavailable"
4. WHEN limitedMode is true, THE disabled QuickAction SHALL have reduced opacity (0.5)
5. WHEN limitedMode is false, ALL QuickActions SHALL be enabled with normal opacity

### Requirement 9

**User Story:** As a user, I want to see my recent transactions, so that I can monitor my account activity.

#### Acceptance Criteria

1. THE recent transactions list SHALL display a "Recent activity" title
2. THE recent transactions list SHALL use a FlatList component for rendering
3. THE recent transactions list SHALL display 8 to 12 TransactionItem components
4. THE recent transactions list SHALL use mock data for transaction information
5. THE recent transactions list SHALL be scrollable vertically

### Requirement 10

**User Story:** As a user, I want to see transaction details clearly, so that I can understand each transaction.

#### Acceptance Criteria

1. THE TransactionItem SHALL display a merchant icon from Ionicons
2. THE TransactionItem SHALL display the merchant name
3. THE TransactionItem SHALL display an optional transaction note
4. THE TransactionItem SHALL display the transaction date in short format (e.g., "30 Oct")
5. THE TransactionItem SHALL display the transaction amount with currency formatting

### Requirement 11

**User Story:** As a user, I want to distinguish between incoming and outgoing transactions, so that I can quickly identify transaction types.

#### Acceptance Criteria

1. WHEN the transaction amount is negative, THE TransactionItem SHALL display the amount in colors.error (red)
2. WHEN the transaction amount is positive, THE TransactionItem SHALL display the amount in colors.success (green)
3. THE TransactionItem SHALL format amounts using Intl.NumberFormat with 'en-ZA' locale and 'ZAR' currency
4. THE TransactionItem SHALL display negative amounts with a minus sign
5. THE TransactionItem SHALL display positive amounts without a plus sign

### Requirement 12

**User Story:** As a user, I want to see my session information at the bottom of the screen, so that I can verify my session and log out.

#### Acceptance Criteria

1. THE session strip SHALL display the text "Session …{last4}" where last4 is the last 4 characters of the session ID
2. THE session strip SHALL display the text "· Signed in" after the session ID
3. THE session strip SHALL display a "Log out" button
4. WHEN the user taps the "Log out" button, THE LandingScreen SHALL call clearSession()
5. THE session strip SHALL be positioned at the bottom of the screen

### Requirement 13

**User Story:** As a user, I want all interactive elements to be accessible, so that I can use the app with assistive technologies.

#### Acceptance Criteria

1. THE LandingScreen SHALL provide accessibilityLabel for all buttons
2. THE LandingScreen SHALL ensure all interactive elements have minimum 44px touch targets
3. THE QuickAction buttons SHALL have accessibilityLabel describing the action
4. THE toggle button SHALL have accessibilityLabel indicating current state
5. THE logout button SHALL have accessibilityLabel "Log out button"

### Requirement 14

**User Story:** As a developer, I want to use only Expo-compatible packages, so that the app runs in Expo Go without custom native modules.

#### Acceptance Criteria

1. THE LandingScreen SHALL use react-native-safe-area-context for SafeAreaView
2. THE LandingScreen SHALL use @expo/vector-icons/Ionicons for all icons
3. THE LandingScreen SHALL NOT use any packages requiring custom native modules
4. THE LandingScreen SHALL use React Native core components (FlatList, ScrollView, View, Text)
5. THE LandingScreen SHALL use StyleSheet for styling

### Requirement 15

**User Story:** As a developer, I want to create reusable components, so that the code is maintainable and consistent.

#### Acceptance Criteria

1. THE implementation SHALL create an AccountCard component in src/components/AccountCard.tsx
2. THE implementation SHALL create a QuickAction component in src/components/QuickAction.tsx
3. THE implementation SHALL create a TransactionItem component in src/components/TransactionItem.tsx
4. THE implementation SHALL create a toast utility function in src/lib/toast.ts
5. THE components SHALL use TypeScript interfaces for props

### Requirement 16

**User Story:** As a developer, I want to use mock data for accounts and transactions, so that the UI can be tested without a backend.

#### Acceptance Criteria

1. THE LandingScreen SHALL define mock accounts array with id, name, currency, balance, and last4 properties
2. THE LandingScreen SHALL define mock transactions array with id, merchant, note, dateISO, amount, and currency properties
3. THE mock accounts array SHALL contain 2 to 3 account objects
4. THE mock transactions array SHALL contain 8 to 12 transaction objects
5. THE mock data SHALL use realistic South African banking values (ZAR currency)

### Requirement 17

**User Story:** As a developer, I want to format currency values consistently, so that all monetary amounts are displayed correctly.

#### Acceptance Criteria

1. THE implementation SHALL create a formatMoney utility function
2. THE formatMoney function SHALL use Intl.NumberFormat with 'en-ZA' locale
3. THE formatMoney function SHALL use 'currency' style with 'ZAR' currency
4. THE formatMoney function SHALL accept a number parameter and return a formatted string
5. THE masked balance constant SHALL be defined as '• • • •'

### Requirement 18

**User Story:** As a developer, I want to ensure the theme supports the new UI elements, so that the design is consistent.

#### Acceptance Criteria

1. THE theme.ts SHALL include colors.card for card backgrounds
2. THE theme.ts SHALL include colors.success for positive transaction amounts
3. THE theme.ts SHALL include colors.warning for warning states (if needed)
4. THE theme.ts SHALL maintain existing dark theme colors
5. THE theme.ts SHALL export all color constants for use in components

### Requirement 19

**User Story:** As a user, I want the app to perform well with scrollable lists, so that the interface is smooth and responsive.

#### Acceptance Criteria

1. THE transactions FlatList SHALL use stable keys for each item
2. THE transactions FlatList SHALL use the transaction id as the key
3. THE accounts ScrollView SHALL render efficiently with 2 to 3 items
4. THE LandingScreen SHALL NOT cause performance issues on low-end devices
5. THE LandingScreen SHALL render within 500 milliseconds on initial load

### Requirement 20

**User Story:** As a user, I want the toast messages to be simple and clear, so that I understand system feedback.

#### Acceptance Criteria

1. THE toast function SHALL use Alert.alert for displaying messages
2. THE toast function SHALL accept a message string parameter
3. THE toast function SHALL display an empty title (first parameter)
4. THE toast function SHALL be exported from src/lib/toast.ts
5. THE toast function SHALL be cross-platform compatible (iOS and Android)
