# Design Document

## Overview

This design document describes the upgrade of the Transrify LandingScreen from a minimal authenticated view to a modern banking-style dashboard. The enhanced UI provides a comprehensive view of account information, quick actions, and recent transactions while maintaining the existing duress detection functionality. The design ensures that users in limited mode (duress) see a normal-looking interface with subtle restrictions that don't alert potential attackers.

### Key Design Principles

1. **Modern Banking Aesthetic**: Clean, card-based layout with clear visual hierarchy
2. **Duress Mode Compatibility**: Limited mode appears normal with subtle action restrictions
3. **Expo Go Compatible**: Use only managed Expo packages without custom native modules
4. **Performance First**: Efficient rendering with FlatList and optimized components
5. **Accessibility**: Minimum 44px touch targets, clear labels, good contrast
6. **Dark Theme Consistency**: Maintain existing dark theme design system

## Architecture

### Component Hierarchy

```
LandingScreen
├── SafeAreaView (react-native-safe-area-context)
│   ├── ScrollView (main content)
│   │   ├── Header
│   │   │   ├── Greeting Text ("Hi, {customerRef}")
│   │   │   ├── Tenant Name Text
│   │   │   └── Bell Icon (Ionicons)
│   │   ├── Limited Mode Pill (conditional)
│   │   ├── Accounts Section
│   │   │   ├── Section Title + Show/Hide Toggle
│   │   │   └── Horizontal ScrollView
│   │   │       ├── AccountCard
│   │   │       ├── AccountCard
│   │   │       └── AccountCard
│   │   ├── Quick Actions Section
│   │   │   ├── Section Title
│   │   │   └── Grid (2x2)
│   │   │       ├── QuickAction (Send)
│   │   │       ├── QuickAction (Receive)
│   │   │       ├── QuickAction (Top Up)
│   │   │       └── QuickAction (Statements)
│   │   └── Recent Transactions Section
│   │       ├── Section Title
│   │       └── FlatList
│   │           ├── TransactionItem
│   │           ├── TransactionItem
│   │           └── ...
│   └── Session Strip (fixed bottom)
│       ├── Session Text
│       └── Log Out Button
```

### State Management

```typescript
// Local UI State (useState)
const [showBalances, setShowBalances] = useState(false);

// Global Auth State (Zustand)
const { user, limitedMode, clearSession } = useAuthStore();

// Mock Data (constants)
const accounts = [...];
const transactions = [...];
```

### Data Flow

```mermaid
graph TD
    A[LandingScreen] --> B[useAuthStore]
    B --> C[user: User | null]
    B --> D[limitedMode: boolean]
    B --> E[clearSession: function]
    
    A --> F[Local State]
    F --> G[showBalances: boolean]
    
    A --> H[Mock Data]
    H --> I[accounts array]
    H --> J[transactions array]
    
    A --> K[AccountCard]
    I --> K
    G --> K
    
    A --> L[QuickAction]
    D --> L
    
    A --> M[TransactionItem]
    J --> M
```

## Components and Interfaces

### LandingScreen Component

**Purpose**: Main dashboard screen displaying accounts, actions, and transactions

**Props**: None (uses navigation and auth store)

**State**:
```typescript
const [showBalances, setShowBalances] = useState(false);
```

**Layout Structure**:
1. SafeAreaView wrapper (full screen)
2. ScrollView (main content area)
3. Fixed Session Strip at bottom

**Sections**:
- Header (greeting, tenant, notifications)
- Limited Mode Pill (conditional)
- Accounts Carousel
- Quick Actions Grid
- Recent Transactions List
- Session Strip

### AccountCard Component

**Purpose**: Display individual account information with balance masking

**Props**:
```typescript
interface AccountCardProps {
  name: string;           // e.g., "Everyday", "Savings"
  maskedBalance: string;  // "• • • •"
  rawBalance: number;     // 12345.67
  currency: string;       // "ZAR"
  last4: string;          // "1023"
  showBalances: boolean;  // Toggle state
}
```

**Visual Design**:
- Background: `colors.card` (#15151E)
- Border radius: `borderRadius.lg` (16px)
- Padding: `spacing.xl` (24px)
- Width: 280px (fixed for horizontal scroll)
- Height: Auto (content-based)

**Layout**:
```
┌─────────────────────────────┐
│ Everyday                    │  <- Account name (textPrimary)
│                             │
│ R 12,345.67  or  • • • •   │  <- Balance (h2 size)
│ ZAR                         │  <- Currency (textSecondary)
│                             │
│ ···· 1023                   │  <- Last 4 digits (caption)
└─────────────────────────────┘
```

**Behavior**:
- Display `rawBalance` formatted when `showBalances` is true
- Display `maskedBalance` when `showBalances` is false
- Use `formatMoney()` utility for currency formatting

### QuickAction Component

**Purpose**: Display action button with icon and label

**Props**:
```typescript
interface QuickActionProps {
  label: string;              // "Send", "Receive", etc.
  icon: keyof typeof Ionicons.glyphMap;  // "paper-plane", "arrow-down", etc.
  disabled?: boolean;         // For duress mode
  onPress: () => void;        // Action handler
}
```

**Visual Design**:
- Background: `colors.surface` (#15151E)
- Border radius: `borderRadius.md` (12px)
- Padding: `spacing.lg` (16px)
- Size: Flex (fills grid cell)
- Min touch target: 44px x 44px

**Layout**:
```
┌──────────────┐
│              │
│   📄 Icon    │  <- Ionicon (24px, primary color)
│              │
│    Send      │  <- Label (caption, textPrimary)
│              │
└──────────────┘
```

**States**:
- Normal: Opacity 1.0, primary icon color
- Disabled: Opacity 0.5, reduced interaction
- Pressed: Background slightly lighter

**Behavior**:
- When disabled and pressed, call `toast('Temporarily unavailable')`
- When enabled and pressed, call `onPress()` handler
- Apply `accessibilityLabel` for screen readers

### TransactionItem Component

**Purpose**: Display individual transaction in list

**Props**:
```typescript
interface TransactionItemProps {
  id: string;           // Unique identifier
  merchant: string;     // "Checkers Sandton"
  note?: string;        // "Groceries" (optional)
  dateISO: string;      // "2025-10-28"
  amount: number;       // -432.10 or 21.98
  currency: string;     // "ZAR"
}
```

**Visual Design**:
- Background: Transparent
- Border bottom: 1px `colors.border`
- Padding: `spacing.lg` vertical, `spacing.md` horizontal
- Height: Auto (content-based)

**Layout**:
```
┌────────────────────────────────────────────┐
│ 🏪  Checkers Sandton        -R 432.10     │
│     Groceries · 28 Oct                     │
└────────────────────────────────────────────┘
```

**Color Logic**:
- Negative amounts: `colors.error` (#FF5252)
- Positive amounts: `colors.success` (#4CAF50)
- Merchant name: `colors.textPrimary`
- Note and date: `colors.textSecondary`

**Date Formatting**:
```typescript
// Convert "2025-10-28" to "28 Oct"
const formatDate = (dateISO: string): string => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
```

**Amount Formatting**:
```typescript
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};
```

### Toast Utility

**Purpose**: Display brief feedback messages

**Implementation**:
```typescript
// src/lib/toast.ts
import { Alert } from 'react-native';

export function toast(message: string): void {
  Alert.alert('', message);
}
```

**Usage**:
- Duress mode action restrictions
- Future error messages
- Simple, cross-platform compatible

## Data Models

### Mock Data Structures

**Accounts**:
```typescript
interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  last4: string;
}

const accounts: Account[] = [
  {
    id: 'acc1',
    name: 'Everyday',
    currency: 'ZAR',
    balance: 12345.67,
    last4: '1023',
  },
  {
    id: 'acc2',
    name: 'Savings',
    currency: 'ZAR',
    balance: 98765.43,
    last4: '7782',
  },
];
```

**Transactions**:
```typescript
interface Transaction {
  id: string;
  merchant: string;
  note?: string;
  dateISO: string;
  amount: number;
  currency: string;
}

const transactions: Transaction[] = [
  {
    id: 'tx1',
    merchant: 'Checkers Sandton',
    note: 'Groceries',
    dateISO: '2025-10-28',
    amount: -432.10,
    currency: 'ZAR',
  },
  {
    id: 'tx2',
    merchant: 'SnapScan',
    note: 'Coffee',
    dateISO: '2025-10-27',
    amount: -48.00,
    currency: 'ZAR',
  },
  {
    id: 'tx3',
    merchant: 'Interest',
    note: 'Monthly yield',
    dateISO: '2025-10-26',
    amount: 21.98,
    currency: 'ZAR',
  },
  // ... 5-9 more transactions
];
```

## UI Layout and Styling

### Screen Layout

```
┌─────────────────────────────────────┐
│ SafeAreaView                        │
│ ┌─────────────────────────────────┐ │
│ │ ScrollView                      │ │
│ │                                 │ │
│ │ Header                          │ │
│ │ ├─ Hi, customer123              │ │
│ │ ├─ Transrify                    │ │
│ │ └─ 🔔                           │ │
│ │                                 │ │
│ │ [Limited Mode (Monitoring)]     │ │  <- Conditional
│ │                                 │ │
│ │ Accounts          [Show/Hide]   │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐     │ │
│ │ │ Card │ │ Card │ │ Card │ →   │ │  <- Horizontal scroll
│ │ └──────┘ └──────┘ └──────┘     │ │
│ │                                 │ │
│ │ Quick Actions                   │ │
│ │ ┌──────┐ ┌──────┐              │ │
│ │ │ Send │ │Receive│              │ │
│ │ └──────┘ └──────┘              │ │
│ │ ┌──────┐ ┌──────┐              │ │
│ │ │TopUp │ │Stmts │              │ │
│ │ └──────┘ └──────┘              │ │
│ │                                 │ │
│ │ Recent activity                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Transaction Item            │ │ │
│ │ ├─────────────────────────────┤ │ │
│ │ │ Transaction Item            │ │ │
│ │ ├─────────────────────────────┤ │ │
│ │ │ ...                         │ │ │  <- Scrollable
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Session …abcd · Signed in  [⎋] │ │  <- Fixed bottom
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Spacing and Dimensions

**Screen Padding**: `spacing.lg` (16px) on all sides

**Section Spacing**: `spacing.xl` (24px) between sections

**Account Card**:
- Width: 280px
- Margin right: `spacing.md` (12px)
- Padding: `spacing.xl` (24px)

**Quick Action Grid**:
- 2 columns
- Gap: `spacing.md` (12px)
- Each cell: Flex 1

**Transaction Item**:
- Padding vertical: `spacing.lg` (16px)
- Padding horizontal: 0
- Border bottom: 1px

**Session Strip**:
- Height: 60px
- Padding: `spacing.lg` (16px)
- Background: `colors.surface`

### Typography Usage

**Header Greeting**: `typography.h2` (24px, 600 weight)
**Tenant Name**: `typography.caption` (14px, 400 weight)
**Section Titles**: `typography.body` (16px, 600 weight)
**Account Balance**: `typography.h2` (24px, 600 weight)
**Account Name**: `typography.body` (16px, 400 weight)
**Transaction Merchant**: `typography.body` (16px, 400 weight)
**Transaction Note**: `typography.caption` (14px, 400 weight)
**Button Labels**: `typography.button` (16px, 600 weight)

### Color Application

**Backgrounds**:
- Screen: `colors.background` (#0B0B10)
- Cards: `colors.surface` (#15151E)
- Limited Mode Pill: `colors.primary` with 20% opacity

**Text**:
- Primary: `colors.textPrimary` (#EDEDED)
- Secondary: `colors.textSecondary` (#A0A0AE)
- Positive amounts: `colors.success` (#4CAF50)
- Negative amounts: `colors.error` (#FF5252)

**Interactive Elements**:
- Icons: `colors.primary` (#7C4DFF)
- Disabled: Opacity 0.5
- Borders: `colors.border` (#2A2A35)

## Behavior and Interactions

### Balance Masking Toggle

**Initial State**: Hidden (showBalances = false)

**Toggle Behavior**:
1. User taps "Show" button
2. State updates: `setShowBalances(true)`
3. All AccountCard components re-render with formatted balances
4. Button label changes to "Hide"
5. User taps "Hide" button
6. State updates: `setShowBalances(false)`
7. All AccountCard components re-render with masked balances
8. Button label changes to "Show"

**Implementation**:
```typescript
const [showBalances, setShowBalances] = useState(false);

const toggleBalances = () => {
  setShowBalances(prev => !prev);
};
```

### Limited Mode Behavior

**When limitedMode is true**:

1. Display Limited Mode pill below header
2. Disable "Send" QuickAction (opacity 0.5)
3. Disable "Top Up" QuickAction (opacity 0.5)
4. When disabled action is pressed:
   - Call `toast('Temporarily unavailable')`
   - Do not navigate or perform action
5. All other UI elements remain normal

**When limitedMode is false**:

1. Hide Limited Mode pill
2. Enable all QuickActions (opacity 1.0)
3. All actions are interactive

**Visual Consistency**:
- Limited mode does NOT change layout
- Limited mode does NOT change colors dramatically
- Limited mode does NOT show alarming messages
- Disabled actions appear slightly faded but not obviously broken

### Quick Actions Behavior

**Send Action**:
- Enabled: Navigate to send flow (future implementation)
- Disabled (duress): Show toast "Temporarily unavailable"

**Receive Action**:
- Always enabled
- Navigate to receive flow (future implementation)

**Top Up Action**:
- Enabled: Navigate to top up flow (future implementation)
- Disabled (duress): Show toast "Temporarily unavailable"

**Statements Action**:
- Always enabled
- Navigate to statements view (future implementation)

**Current Implementation**:
- All actions show toast with action name (placeholder)
- Duress-restricted actions show "Temporarily unavailable"

### Logout Behavior

**Flow**:
1. User taps "Log out" button in session strip
2. Call `clearSession()` from auth store
3. Clear all SecureStore data
4. Reset auth state
5. Navigation automatically returns to Login (auth gate)

**Error Handling**:
- If clearSession fails, still navigate to Login
- Log error to console for debugging

### Scrolling Behavior

**Accounts Carousel**:
- Horizontal ScrollView
- Snap to card boundaries (optional)
- Show partial next card to indicate more content

**Transactions List**:
- Vertical FlatList
- Smooth scrolling
- Stable keys (transaction.id)
- No pull-to-refresh (future enhancement)

**Main Content**:
- Vertical ScrollView
- Bounces on iOS
- Overscroll on Android

## Accessibility

### Touch Targets

**Minimum Size**: 44px x 44px for all interactive elements

**Components**:
- QuickAction buttons: 44px minimum
- Toggle button: 44px minimum
- Logout button: 44px minimum
- AccountCard: Entire card is tappable (future)
- TransactionItem: Entire row is tappable (future)

### Labels

**accessibilityLabel Examples**:
- "Show account balances" / "Hide account balances"
- "Send money"
- "Receive money"
- "Top up account"
- "View statements"
- "Log out button"
- "Notifications"

**accessibilityHint Examples**:
- "Double tap to toggle balance visibility"
- "Double tap to send money"
- "This action is temporarily unavailable"

### Screen Reader Support

**Navigation Order**:
1. Header (greeting, tenant, notifications)
2. Limited mode pill (if visible)
3. Accounts section title
4. Show/Hide toggle
5. Account cards (left to right)
6. Quick actions title
7. Quick action buttons (row by row)
8. Recent activity title
9. Transaction items (top to bottom)
10. Session strip
11. Logout button

**Announcements**:
- When balance visibility changes: "Balances hidden" / "Balances shown"
- When action is disabled: "This action is temporarily unavailable"

## Performance Considerations

### Optimization Strategies

**FlatList for Transactions**:
- Use `keyExtractor={(item) => item.id}`
- Stable keys prevent unnecessary re-renders
- Efficient for 8-12 items (no virtualization needed)

**ScrollView for Accounts**:
- Only 2-3 items, no virtualization needed
- Simple horizontal scroll

**Memoization**:
- Not needed for current scale
- Consider if data grows significantly

**State Updates**:
- Single `showBalances` state affects all cards
- Efficient re-render with React's reconciliation

### Rendering Performance

**Initial Render**:
- Target: < 500ms on mid-range devices
- Mock data is synchronous (no loading state)
- No heavy computations

**Scroll Performance**:
- 60 FPS target
- No complex animations
- Simple layout calculations

## Theme Updates

### Required Color Additions

The existing theme already includes:
- `colors.card` - Not present, needs to be added or use `colors.surface`
- `colors.success` - Already present (#4CAF50)
- `colors.warning` - Already present (#FFC107)

**Recommendation**: Use `colors.surface` for card backgrounds (already defined as #15151E)

**No theme changes needed** - existing theme is sufficient

### Icon Library

**Package**: `@expo/vector-icons/Ionicons`

**Icons Used**:
- `notifications-outline` - Bell icon
- `paper-plane-outline` - Send action
- `arrow-down-outline` - Receive action
- `add-circle-outline` - Top Up action
- `document-text-outline` - Statements action
- `cart-outline` - Shopping transaction
- `cafe-outline` - Coffee transaction
- `cash-outline` - Cash transaction
- `trending-up-outline` - Interest transaction

**Size**: 24px for action icons, 20px for transaction icons

## Error Handling

### Toast Messages

**Duress Mode Restrictions**:
- Message: "Temporarily unavailable"
- Trigger: Disabled action pressed
- Duration: Default Alert.alert (user dismisses)

**Future Error Scenarios**:
- Network errors (future API integration)
- Data loading failures (future)
- Action failures (future)

### Graceful Degradation

**Missing Data**:
- If `user` is null: Show "Unknown" for customer ref
- If `sessionId` is null: Show "----" for session tail
- If `limitedMode` is undefined: Treat as false

**Component Failures**:
- ErrorBoundary at app level catches crashes
- Individual components fail gracefully

## Testing Strategy

### Unit Tests

**Components**:
- AccountCard: Renders correctly with masked/unmasked balance
- QuickAction: Disabled state shows toast on press
- TransactionItem: Formats amount with correct color
- Toast utility: Calls Alert.alert with correct params

**Utilities**:
- formatMoney: Formats currency correctly
- formatDate: Converts ISO to short format

### Integration Tests

**LandingScreen**:
- Renders all sections correctly
- Toggle changes balance visibility
- Limited mode disables correct actions
- Logout calls clearSession and navigates

### Manual Testing

**Scenarios**:
1. Normal mode: All actions enabled
2. Limited mode: Send and Top Up disabled
3. Balance toggle: All balances mask/unmask
4. Scrolling: Smooth horizontal and vertical
5. Accessibility: Screen reader navigation
6. Logout: Returns to login screen

## Future Enhancements

### Phase 2 Features

1. **Real Account Data**: Integrate with backend API
2. **Real Transactions**: Fetch from transaction history endpoint
3. **Pull to Refresh**: Reload data on pull down
4. **Action Navigation**: Implement actual send/receive flows
5. **Notifications**: Real notification system with badge count
6. **Account Details**: Tap card to view full account details
7. **Transaction Details**: Tap transaction to view full details
8. **Search Transactions**: Filter by merchant, date, amount
9. **Export Statements**: Download PDF statements

### Duress Mode Enhancements

1. **Transaction Limits**: Restrict transaction amounts in limited mode
2. **Evidence Collection**: Camera/audio capture in limited mode
3. **Location Tracking**: Background location updates in limited mode
4. **Silent Alerts**: Backend notifications without UI indication

## Implementation Notes

### File Structure

```
src/
├── components/
│   ├── AccountCard.tsx       (new)
│   ├── QuickAction.tsx        (new)
│   ├── TransactionItem.tsx    (new)
│   ├── Button.tsx             (existing)
│   ├── Logo.tsx               (existing)
│   └── Screen.tsx             (existing)
├── lib/
│   ├── toast.ts               (new)
│   ├── theme.ts               (existing)
│   └── ...
├── screens/
│   └── LandingScreen.tsx      (update)
└── state/
    └── useAuthStore.ts        (existing)
```

### Dependencies

**No new dependencies required**:
- `react-native-safe-area-context` (already installed)
- `@expo/vector-icons` (included with Expo)
- `react-native` core components (FlatList, ScrollView, etc.)

### Styling Approach

**Use StyleSheet.create()** for all styles:
- Better performance than inline styles
- Type checking with TypeScript
- Consistent with existing codebase

**No CSS-in-JS libraries**:
- Keep it simple and Expo-compatible
- No styled-components, emotion, etc.

### Code Organization

**Component Files**:
1. Imports
2. TypeScript interfaces
3. Component function
4. StyleSheet.create()
5. Export

**Utility Files**:
1. Imports
2. Type definitions
3. Utility functions
4. Exports

**Keep it Simple**:
- No complex abstractions
- Clear, readable code
- Minimal dependencies
