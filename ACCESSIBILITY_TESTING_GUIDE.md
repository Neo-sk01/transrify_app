# Accessibility Testing Guide - LandingScreen

## Purpose
This guide provides step-by-step instructions for manually testing accessibility compliance on iOS and Android devices.

---

## Prerequisites

### iOS Testing
- iOS device or simulator running iOS 13.0+
- Expo Go app installed
- VoiceOver enabled

### Android Testing
- Android device or emulator running Android 5.0+
- Expo Go app installed
- TalkBack enabled

---

## Part 1: iOS VoiceOver Testing

### Setup VoiceOver

1. Open **Settings** on your iOS device
2. Navigate to **Accessibility** > **VoiceOver**
3. Toggle **VoiceOver** ON
4. Learn the basic gestures:
   - **Swipe right**: Move to next element
   - **Swipe left**: Move to previous element
   - **Double-tap**: Activate selected element
   - **Three-finger swipe up/down**: Scroll

### Test Procedure

#### 1. Header Section
- [ ] Swipe to greeting text
  - **Expected**: "Hi, [customerRef]"
  - **Verify**: Customer reference is announced clearly
  
- [ ] Swipe to tenant name
  - **Expected**: "Transrify"
  - **Verify**: Tenant name is announced
  
- [ ] Swipe to notification button
  - **Expected**: "Notifications, button, View notifications"
  - **Verify**: Button role and hint are announced
  - **Action**: Double-tap to verify it's activatable

#### 2. Limited Mode Pill (if visible)
- [ ] Swipe to limited mode pill
  - **Expected**: "Limited mode active"
  - **Verify**: Status is clearly announced
  - **Note**: Only visible when in duress mode

#### 3. Accounts Section
- [ ] Swipe to "Accounts" title
  - **Expected**: "Accounts"
  - **Verify**: Section title is announced
  
- [ ] Swipe to Show/Hide toggle
  - **Expected**: "Show account balances, button, Double tap to toggle balance visibility" (or "Hide account balances" if shown)
  - **Verify**: Current state and action are clear
  - **Action**: Double-tap to toggle
  - **Verify**: Label changes to opposite state
  
- [ ] Swipe through account cards
  - **Expected**: "[Account name] account, [balance or 'balance hidden'], last 4 digits [number]"
  - **Verify**: Each card announces complete information
  - **Test**: Toggle balances and verify announcement changes

#### 4. Quick Actions Section
- [ ] Swipe to "Quick Actions" title
  - **Expected**: "Quick Actions"
  - **Verify**: Section title is announced
  
- [ ] Swipe to Send button
  - **Expected**: "Send, button, Double tap to send" (or "This action is temporarily unavailable" if disabled)
  - **Verify**: Button and state are announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Receive button
  - **Expected**: "Receive, button, Double tap to receive"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Top Up button
  - **Expected**: "Top Up, button, Double tap to top up" (or "This action is temporarily unavailable" if disabled)
  - **Verify**: Button and state are announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Statements button
  - **Expected**: "Statements, button, Double tap to statements"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate

#### 5. Recent Transactions Section
- [ ] Swipe to "Recent activity" title
  - **Expected**: "Recent activity"
  - **Verify**: Section title is announced
  
- [ ] Swipe through transaction items
  - **Expected**: "[Payment/Deposit] to [merchant], [amount], [note], [date]"
  - **Verify**: Complete transaction information is announced
  - **Verify**: Multiple transactions are reachable
  - **Test**: Scroll down to reach more transactions

#### 6. Session Strip
- [ ] Swipe to session text
  - **Expected**: "Session …[last4] · Signed in"
  - **Verify**: Session information is announced
  
- [ ] Swipe to Log out button
  - **Expected**: "Log out button, button"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate (will log out)

### Navigation Order Verification
- [ ] Start from top and swipe right continuously
- [ ] Verify order follows: Header → Pill → Accounts → Actions → Transactions → Session
- [ ] Verify no elements are skipped
- [ ] Verify no elements are duplicated

### Touch Target Verification
- [ ] With VoiceOver OFF, tap all interactive elements
- [ ] Verify all buttons are easy to tap
- [ ] Verify no accidental taps on nearby elements

---

## Part 2: Android TalkBack Testing

### Setup TalkBack

1. Open **Settings** on your Android device
2. Navigate to **Accessibility** > **TalkBack**
3. Toggle **TalkBack** ON
4. Learn the basic gestures:
   - **Swipe right**: Move to next element
   - **Swipe left**: Move to previous element
   - **Double-tap**: Activate selected element
   - **Swipe down then up**: Scroll down
   - **Swipe up then down**: Scroll up

### Test Procedure

#### 1. Header Section
- [ ] Swipe to greeting text
  - **Expected**: "Hi, [customerRef]"
  - **Verify**: Customer reference is announced clearly
  
- [ ] Swipe to tenant name
  - **Expected**: "Transrify"
  - **Verify**: Tenant name is announced
  
- [ ] Swipe to notification button
  - **Expected**: "Notifications, button, View notifications"
  - **Verify**: Button role and hint are announced
  - **Action**: Double-tap to verify it's activatable

#### 2. Limited Mode Pill (if visible)
- [ ] Swipe to limited mode pill
  - **Expected**: "Limited mode active"
  - **Verify**: Status is clearly announced
  - **Note**: Only visible when in duress mode

#### 3. Accounts Section
- [ ] Swipe to "Accounts" title
  - **Expected**: "Accounts"
  - **Verify**: Section title is announced
  
- [ ] Swipe to Show/Hide toggle
  - **Expected**: "Show account balances, button, Double tap to toggle balance visibility" (or "Hide account balances" if shown)
  - **Verify**: Current state and action are clear
  - **Action**: Double-tap to toggle
  - **Verify**: Label changes to opposite state
  
- [ ] Swipe through account cards
  - **Expected**: "[Account name] account, [balance or 'balance hidden'], last 4 digits [number]"
  - **Verify**: Each card announces complete information
  - **Test**: Toggle balances and verify announcement changes

#### 4. Quick Actions Section
- [ ] Swipe to "Quick Actions" title
  - **Expected**: "Quick Actions"
  - **Verify**: Section title is announced
  
- [ ] Swipe to Send button
  - **Expected**: "Send, button, This action is temporarily unavailable" (if disabled) or "Double tap to send"
  - **Verify**: Button and state are announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Receive button
  - **Expected**: "Receive, button, Double tap to receive"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Top Up button
  - **Expected**: "Top Up, button, This action is temporarily unavailable" (if disabled) or "Double tap to top up"
  - **Verify**: Button and state are announced
  - **Action**: Double-tap to activate
  
- [ ] Swipe to Statements button
  - **Expected**: "Statements, button, Double tap to statements"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate

#### 5. Recent Transactions Section
- [ ] Swipe to "Recent activity" title
  - **Expected**: "Recent activity"
  - **Verify**: Section title is announced
  
- [ ] Swipe through transaction items
  - **Expected**: "[Payment/Deposit] to [merchant], [amount], [note], [date]"
  - **Verify**: Complete transaction information is announced
  - **Verify**: Multiple transactions are reachable
  - **Test**: Scroll down to reach more transactions

#### 6. Session Strip
- [ ] Swipe to session text
  - **Expected**: "Session …[last4] · Signed in"
  - **Verify**: Session information is announced
  
- [ ] Swipe to Log out button
  - **Expected**: "Log out button, button"
  - **Verify**: Button is announced
  - **Action**: Double-tap to activate (will log out)

### Navigation Order Verification
- [ ] Start from top and swipe right continuously
- [ ] Verify order follows: Header → Pill → Accounts → Actions → Transactions → Session
- [ ] Verify no elements are skipped
- [ ] Verify no elements are duplicated

### Touch Target Verification
- [ ] With TalkBack OFF, tap all interactive elements
- [ ] Verify all buttons are easy to tap
- [ ] Verify no accidental taps on nearby elements

---

## Part 3: Touch Target Measurement

### Tools Needed
- Developer options enabled
- "Show layout bounds" or "Pointer location" enabled

### Measurement Procedure

1. Enable **Developer Options**:
   - iOS: Use Xcode's Accessibility Inspector
   - Android: Settings > Developer Options > Show layout bounds

2. Measure each interactive element:
   - [ ] Notification button: Should be ≥ 44px × 44px
   - [ ] Show/Hide toggle: Should be ≥ 44px × 44px
   - [ ] Send button: Should be ≥ 44px × 44px
   - [ ] Receive button: Should be ≥ 44px × 44px
   - [ ] Top Up button: Should be ≥ 44px × 44px
   - [ ] Statements button: Should be ≥ 44px × 44px
   - [ ] Log out button: Should be ≥ 44px × 44px

---

## Part 4: Dynamic State Testing

### Balance Visibility Toggle
1. Start with balances hidden
2. Enable screen reader (VoiceOver or TalkBack)
3. Navigate to toggle button
4. **Verify**: Announces "Show account balances"
5. Double-tap to toggle
6. **Verify**: Announces "Hide account balances"
7. Navigate to account cards
8. **Verify**: Announces actual balance amounts
9. Double-tap toggle again
10. Navigate to account cards
11. **Verify**: Announces "balance hidden"

### Limited Mode State
1. Log in with duress PIN to enable limited mode
2. Enable screen reader
3. Navigate to limited mode pill
4. **Verify**: Announces "Limited mode active"
5. Navigate to Send button
6. **Verify**: Announces "This action is temporarily unavailable"
7. Double-tap Send button
8. **Verify**: Toast appears with "Temporarily unavailable"
9. Navigate to Top Up button
10. **Verify**: Announces "This action is temporarily unavailable"
11. Navigate to Receive button
12. **Verify**: Does NOT announce unavailable (should be enabled)

---

## Part 5: Color Contrast Testing

### Tools
- Use a color contrast checker (e.g., WebAIM Contrast Checker)
- Test against WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

### Colors to Test
- [ ] Primary text (#EDEDED) on background (#0B0B10)
  - **Expected**: High contrast ratio (>15:1)
  
- [ ] Secondary text (#A0A0AE) on background (#0B0B10)
  - **Expected**: Sufficient contrast ratio (>7:1)
  
- [ ] Error text (#FF5252) on background (#0B0B10)
  - **Expected**: Sufficient contrast ratio (>4.5:1)
  
- [ ] Success text (#4CAF50) on background (#0B0B10)
  - **Expected**: Sufficient contrast ratio (>4.5:1)
  
- [ ] Primary button text (#EDEDED) on primary background (#7C4DFF)
  - **Expected**: Sufficient contrast ratio (>4.5:1)

---

## Part 6: Screen Size Testing

### Test on Multiple Devices
- [ ] Small phone (iPhone SE, small Android)
- [ ] Medium phone (iPhone 13, Pixel 5)
- [ ] Large phone (iPhone 13 Pro Max, Galaxy S21 Ultra)
- [ ] Tablet (iPad, Android tablet)

### Verify for Each Size
- [ ] All touch targets remain ≥ 44px
- [ ] Text remains readable
- [ ] No content is cut off
- [ ] Scrolling works smoothly
- [ ] Layout adapts appropriately

---

## Part 7: Orientation Testing

### Portrait Mode
- [ ] All elements are reachable
- [ ] Navigation order is logical
- [ ] Touch targets are adequate

### Landscape Mode
- [ ] All elements are reachable
- [ ] Navigation order is logical
- [ ] Touch targets are adequate
- [ ] Content adapts to wider screen

---

## Test Results Template

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Device**: _______________
- **OS Version**: _______________
- **App Version**: _______________

### Overall Results
- [ ] All touch targets meet 44px minimum
- [ ] All elements have proper accessibility labels
- [ ] All interactive elements are reachable with screen reader
- [ ] Navigation order is logical
- [ ] Dynamic states are properly announced
- [ ] Color contrast meets WCAG AA standards

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Quick Reference: Common Issues

### Issue: Element not reachable with screen reader
**Solution**: Ensure element has `accessibilityLabel` prop

### Issue: Button not activatable
**Solution**: Ensure element has `accessibilityRole="button"` and is a TouchableOpacity

### Issue: Touch target too small
**Solution**: Add `minWidth: 44, minHeight: 44` to styles

### Issue: State change not announced
**Solution**: Update `accessibilityLabel` dynamically based on state

### Issue: Confusing navigation order
**Solution**: Restructure component hierarchy to match visual layout

---

## Conclusion

Complete all sections of this testing guide to ensure full accessibility compliance. Document any issues found and verify fixes with retesting.
