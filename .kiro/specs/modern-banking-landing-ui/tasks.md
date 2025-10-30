# Implementation Plan

- [x] 1. Create utility functions and helpers

  - Create src/lib/toast.ts with toast function using Alert.alert
  - Add formatMoney utility function in LandingScreen for currency formatting using Intl.NumberFormat
  - Add formatDate utility function in LandingScreen for date formatting (ISO to "DD MMM")
  - Define MASKED_BALANCE constant as '• • • •'
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 2. Update theme with card color support

  - Update src/lib/theme.ts to add colors.card property (use colors.surface value)
  - Verify colors.success and colors.warning are present
  - Export updated theme constants
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 3. Create AccountCard component

  - Create src/components/AccountCard.tsx with TypeScript interface for props
  - Define AccountCardProps interface with name, maskedBalance, rawBalance, currency, last4, showBalances
  - Implement component to display account name, balance (masked or formatted), currency, and last 4 digits
  - Use colors.card (or colors.surface) for background, borderRadius.lg for corners
  - Apply conditional rendering: show rawBalance formatted when showBalances is true, maskedBalance when false
  - Style with padding spacing.xl, width 280px
  - Add accessibilityLabel for account information
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 15.1, 15.5_

- [x] 4. Create QuickAction component

  - Create src/components/QuickAction.tsx with TypeScript interface for props
  - Define QuickActionProps interface with label, icon, disabled, onPress
  - Import Ionicons from @expo/vector-icons/Ionicons
  - Implement component to display icon (24px) and label below
  - Use colors.surface for background, borderRadius.md for corners
  - Apply disabled state: opacity 0.5 when disabled is true
  - When disabled and pressed, call toast('Temporarily unavailable')
  - Ensure minimum 44px touch target
  - Add accessibilityLabel and accessibilityHint for actions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.3, 8.4, 8.5, 13.3, 13.5, 15.2, 15.5_

- [x] 5. Create TransactionItem component

  - Create src/components/TransactionItem.tsx with TypeScript interface for props
  - Define TransactionItemProps interface with id, merchant, note, dateISO, amount, currency
  - Import Ionicons from @expo/vector-icons/Ionicons
  - Implement component to display merchant icon, merchant name, note, date, and amount
  - Format date using formatDate utility (convert ISO to "DD MMM")
  - Format amount using formatMoney utility (Intl.NumberFormat)
  - Apply color logic: colors.error for negative amounts, colors.success for positive amounts
  - Use colors.textPrimary for merchant, colors.textSecondary for note and date
  - Add border bottom with colors.border
  - Style with padding spacing.lg vertical
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 15.3, 15.5_

- [x] 6. Define mock data in LandingScreen

  - Create accounts array with 2-3 Account objects (id, name, currency, balance, last4)
  - Create transactions array with 8-12 Transaction objects (id, merchant, note, dateISO, amount, currency)
  - Use realistic South African banking values (ZAR currency)
  - Include mix of positive and negative transaction amounts
  - Use descriptive merchant names (Checkers, SnapScan, Interest, etc.)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 7. Implement LandingScreen header section

  - Update src/screens/LandingScreen.tsx to use SafeAreaView from react-native-safe-area-context
  - Import Ionicons from @expo/vector-icons/Ionicons
  - Create header section with greeting "Hi, {customerRef}" using user.customerRef from auth store
  - Add tenant name subtitle "Transrify" below greeting
  - Add bell icon (notifications-outline) on the right side of header
  - Style header with flexDirection row, justifyContent space-between
  - Use typography.h2 for greeting, typography.caption for tenant name
  - Add accessibilityLabel for greeting and notifications icon
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 14.1, 14.2_

- [x] 8. Implement Limited Mode pill indicator

  - Add conditional rendering for Limited Mode pill when limitedMode is true
  - Display text "Limited Mode (Monitoring)" in pill
  - Style pill with small rounded background (borderRadius.xl), primary-tinted background (primary with 20% opacity)
  - Use colors.primary for text color
  - Position pill below header with spacing.md margin
  - Add accessibilityLabel "Limited mode active"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. Implement accounts carousel section

  - Add section title "Accounts" with Show/Hide toggle button on the same row
  - Create local state: const [showBalances, setShowBalances] = useState(false)
  - Implement toggleBalances function to toggle showBalances state
  - Create horizontal ScrollView for account cards
  - Map over accounts array to render AccountCard components
  - Pass showBalances state to each AccountCard
  - Style ScrollView with horizontal prop, showsHorizontalScrollIndicator false
  - Add spacing.md margin between cards
  - Add accessibilityLabel for toggle button indicating current state
  - _Requirements: 1.2, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5, 13.4_

- [x] 10. Implement quick actions grid section

  - Add section title "Quick Actions"
  - Create 2x2 grid layout using View with flexDirection row and flexWrap wrap
  - Render 4 QuickAction components: Send, Receive, Top Up, Statements
  - Use Ionicons: paper-plane-outline, arrow-down-outline, add-circle-outline, document-text-outline
  - Pass disabled prop to Send and Top Up actions when limitedMode is true
  - Implement onPress handlers for each action (placeholder toast messages)
  - Style grid with spacing.md gap between items
  - Ensure each QuickAction has minimum 44px touch target
  - Add accessibilityLabel for each action button
  - _Requirements: 1.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 13.1, 13.2, 13.3_

- [x] 11. Implement recent transactions list section

  - Add section title "Recent activity"
  - Create FlatList component for transactions
  - Set data prop to transactions array
  - Implement renderItem to render TransactionItem component
  - Use keyExtractor with transaction.id for stable keys
  - Style FlatList with no extra styling (transparent background)
  - Ensure FlatList is scrollable within main ScrollView (set scrollEnabled false or use nested scroll)
  - _Requirements: 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 19.1, 19.2_

- [x] 12. Implement session strip at bottom

  - Create session strip View at bottom of screen (outside main ScrollView)
  - Display text "Session …{last4} · Signed in" where last4 is last 4 chars of sessionId
  - Add "Log out" button using existing Button component
  - Implement handleLogout function to call clearSession from auth store
  - Style session strip with colors.surface background, height 60px, padding spacing.lg
  - Position session strip at bottom using absolute positioning or flex layout
  - Add accessibilityLabel "Log out button" to logout button
  - _Requirements: 1.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.5_

- [x] 13. Integrate all sections in LandingScreen layout

  - Wrap entire screen in SafeAreaView from react-native-safe-area-context
  - Create main ScrollView for header, pill, accounts, actions, and transactions
  - Apply colors.background for screen background
  - Add padding spacing.lg to main content area
  - Add spacing.xl between major sections
  - Ensure session strip is fixed at bottom (outside ScrollView)
  - Test scrolling behavior on both iOS and Android
  - Verify layout on different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 14.4, 14.5_

- [x] 14. Test balance masking toggle functionality

  - Verify initial state shows masked balances (• • • •)
  - Tap Show button and verify all balances display formatted currency
  - Tap Hide button and verify all balances return to masked state
  - Verify button label changes between "Show" and "Hide"
  - Test with screen reader to ensure state is announced
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 15. Test limited mode behavior

  - Set limitedMode to true in auth store
  - Verify Limited Mode pill is displayed
  - Verify Send and Top Up actions have reduced opacity
  - Tap Send action and verify toast "Temporarily unavailable" appears
  - Tap Top Up action and verify toast "Temporarily unavailable" appears
  - Verify Receive and Statements actions remain enabled
  - Set limitedMode to false and verify pill is hidden and all actions are enabled
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 16. Test logout functionality

  - Tap Log out button in session strip
  - Verify clearSession is called
  - Verify navigation returns to Login screen
  - Verify session data is cleared from SecureStore
  - Test error handling if clearSession fails
  - _Requirements: 12.3, 12.4, 12.5_

- [x] 17. Verify accessibility compliance

  - Test with iOS VoiceOver: verify all elements are reachable and labeled
  - Test with Android TalkBack: verify all elements are reachable and labeled
  - Verify all interactive elements have minimum 44px touch targets
  - Verify accessibilityLabel is present on all buttons and icons
  - Verify screen reader announces balance visibility changes
  - Test navigation order is logical (top to bottom, left to right)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 18. Test performance and scrolling

  - Test initial render time (target < 500ms)
  - Test horizontal scrolling of accounts carousel (smooth 60 FPS)
  - Test vertical scrolling of transactions list (smooth 60 FPS)
  - Test main ScrollView scrolling with all content
  - Verify no lag or jank on mid-range devices
  - Test on both iOS and Android in Expo Go
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 19. Manual testing in Expo Go

  - Test on iOS device in Expo Go
  - Test on Android device in Expo Go
  - Verify all sections render correctly
  - Verify all interactions work as expected
  - Verify dark theme colors are consistent
  - Verify SafeAreaView respects device notches and safe areas
  - Test with different screen sizes (small, medium, large)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]\* 20. Write unit tests for new components

  - Write tests for AccountCard: masked vs unmasked balance rendering
  - Write tests for QuickAction: disabled state and toast on press
  - Write tests for TransactionItem: amount color logic and formatting
  - Write tests for toast utility: Alert.alert is called with correct params
  - Write tests for formatMoney utility: currency formatting is correct
  - Write tests for formatDate utility: ISO to short format conversion
  - _Requirements: 15.5, 17.1, 17.2, 17.3, 17.4, 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ]\* 21. Write integration tests for LandingScreen

  - Test that all sections render correctly
  - Test that balance toggle changes visibility
  - Test that limited mode disables correct actions
  - Test that logout calls clearSession
  - Test that mock data is displayed correctly
  - Mock useAuthStore for testing different states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 8.1, 12.4_
