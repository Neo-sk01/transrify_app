# Manual Performance Testing Guide

This guide provides instructions for manually testing the performance and scrolling behavior of the LandingScreen on iOS and Android devices using Expo Go.

## Prerequisites

- Expo Go app installed on iOS and/or Android device
- Development server running (`npm start`)
- Device connected to same network as development machine

## Test Scenarios

### 1. Initial Render Performance

**Target**: < 500ms render time

**Steps**:
1. Close the app completely
2. Open Expo Go and connect to the development server
3. Navigate to Login screen
4. Log in with valid credentials
5. Observe the time it takes for LandingScreen to fully render

**Expected Result**:
- Screen should render smoothly without noticeable delay
- All sections (header, accounts, actions, transactions) should appear quickly
- No blank screens or loading states

**Pass Criteria**:
- ✅ Screen renders within 500ms (feels instant)
- ✅ No visible lag or stuttering during initial render
- ✅ All content appears without flashing or jumping

---

### 2. Horizontal Scrolling (Accounts Carousel)

**Target**: Smooth 60 FPS scrolling

**Steps**:
1. Navigate to LandingScreen
2. Locate the Accounts section with horizontal cards
3. Swipe left and right through the account cards
4. Perform quick swipes and slow swipes
5. Test momentum scrolling (flick gesture)

**Expected Result**:
- Smooth scrolling with no stuttering or frame drops
- Cards should move fluidly with finger movement
- Momentum scrolling should feel natural

**Pass Criteria**:
- ✅ No visible lag or jank during scrolling
- ✅ Smooth 60 FPS animation
- ✅ Cards respond immediately to touch
- ✅ Momentum scrolling works correctly

---

### 3. Vertical Scrolling (Transactions List)

**Target**: Smooth 60 FPS scrolling

**Steps**:
1. Navigate to LandingScreen
2. Locate the Recent activity section
3. Scroll up and down through the transaction list
4. Perform quick scrolls and slow scrolls
5. Test momentum scrolling (flick gesture)
6. Scroll to the bottom and back to the top

**Expected Result**:
- Smooth scrolling with no stuttering or frame drops
- Transaction items should render smoothly
- No blank spaces or loading indicators

**Pass Criteria**:
- ✅ No visible lag or jank during scrolling
- ✅ Smooth 60 FPS animation
- ✅ All transaction items render correctly
- ✅ Momentum scrolling works correctly

---

### 4. Main ScrollView Scrolling

**Target**: Smooth 60 FPS scrolling

**Steps**:
1. Navigate to LandingScreen
2. Scroll from top to bottom of the entire screen
3. Test scrolling through all sections:
   - Header
   - Limited Mode pill (if in duress mode)
   - Accounts carousel
   - Quick Actions grid
   - Recent activity list
4. Perform quick scrolls and slow scrolls
5. Test overscroll behavior (bounce on iOS, glow on Android)

**Expected Result**:
- Smooth scrolling through all sections
- No stuttering when scrolling past different section types
- Overscroll effects work correctly

**Pass Criteria**:
- ✅ No visible lag or jank during scrolling
- ✅ Smooth 60 FPS animation
- ✅ All sections scroll together smoothly
- ✅ Overscroll effects work correctly

---

### 5. Balance Toggle Performance

**Target**: Instant toggle with no lag

**Steps**:
1. Navigate to LandingScreen
2. Tap the "Show" button above the accounts carousel
3. Observe the balance change animation
4. Tap the "Hide" button
5. Repeat the toggle 5-10 times rapidly

**Expected Result**:
- Balances should toggle instantly
- No lag or delay when tapping the button
- All account cards update simultaneously

**Pass Criteria**:
- ✅ Toggle responds immediately to tap
- ✅ No visible lag or stuttering
- ✅ All cards update at the same time
- ✅ Rapid toggles work without issues

---

### 6. Limited Mode Performance

**Target**: No performance impact in limited mode

**Steps**:
1. Log out from LandingScreen
2. Log in with duress PIN (if configured)
3. Observe the LandingScreen render time
4. Test all scrolling behaviors (horizontal, vertical, main)
5. Verify Limited Mode pill is displayed
6. Test disabled actions (Send, Top Up)

**Expected Result**:
- No performance difference compared to normal mode
- Limited Mode pill renders without delay
- Disabled actions respond immediately with toast

**Pass Criteria**:
- ✅ Render time is same as normal mode (< 500ms)
- ✅ All scrolling is smooth (60 FPS)
- ✅ Limited Mode pill appears instantly
- ✅ Disabled actions show toast immediately

---

### 7. Mid-Range Device Testing

**Target**: No lag or jank on mid-range devices

**Recommended Test Devices**:
- iOS: iPhone 8, iPhone SE (2nd gen), iPhone XR
- Android: Samsung Galaxy A series, Google Pixel 3a, OnePlus Nord

**Steps**:
1. Install Expo Go on a mid-range device
2. Run all previous test scenarios
3. Pay special attention to:
   - Initial render time
   - Scrolling smoothness
   - Balance toggle responsiveness
   - Quick action button taps

**Expected Result**:
- Performance should be acceptable on mid-range devices
- May not be as smooth as flagship devices, but should be usable
- No crashes or freezes

**Pass Criteria**:
- ✅ Initial render < 500ms (may be slightly slower)
- ✅ Scrolling is smooth (may not be perfect 60 FPS but no major jank)
- ✅ All interactions are responsive
- ✅ No crashes or freezes

---

### 8. iOS-Specific Testing

**Steps**:
1. Test on iOS device (iPhone or iPad)
2. Verify SafeAreaView respects notch/Dynamic Island
3. Test bounce scrolling (overscroll at top/bottom)
4. Test haptic feedback (if implemented)
5. Test with VoiceOver enabled

**Expected Result**:
- Content respects safe areas
- Bounce scrolling works correctly
- No layout issues on different iOS devices

**Pass Criteria**:
- ✅ Safe areas are respected (no content under notch)
- ✅ Bounce scrolling works smoothly
- ✅ Layout looks correct on all iOS devices tested
- ✅ VoiceOver navigation is smooth

---

### 9. Android-Specific Testing

**Steps**:
1. Test on Android device (phone or tablet)
2. Verify SafeAreaView respects system bars
3. Test overscroll glow effect
4. Test with TalkBack enabled
5. Test on different Android versions (if possible)

**Expected Result**:
- Content respects system bars
- Overscroll glow works correctly
- No layout issues on different Android devices

**Pass Criteria**:
- ✅ Safe areas are respected (no content under status bar)
- ✅ Overscroll glow works correctly
- ✅ Layout looks correct on all Android devices tested
- ✅ TalkBack navigation is smooth

---

## Performance Metrics

### Automated Test Results

The automated performance tests verify:
- ✅ Initial render time < 500ms
- ✅ All account cards render efficiently
- ✅ All quick actions render efficiently
- ✅ All transactions render efficiently
- ✅ Stable keys for FlatList items
- ✅ Balance toggle without performance degradation
- ✅ Limited mode without performance impact
- ✅ Horizontal ScrollView renders efficiently
- ✅ Vertical FlatList renders efficiently
- ✅ No memory leaks on multiple renders
- ✅ Rapid state changes handled efficiently

### Manual Testing Checklist

Use this checklist to track manual testing progress:

#### iOS Testing
- [ ] Initial render performance (< 500ms)
- [ ] Horizontal scrolling (60 FPS)
- [ ] Vertical scrolling (60 FPS)
- [ ] Main ScrollView scrolling (60 FPS)
- [ ] Balance toggle performance
- [ ] Limited mode performance
- [ ] Mid-range device testing
- [ ] Safe area handling
- [ ] Bounce scrolling
- [ ] VoiceOver performance

#### Android Testing
- [ ] Initial render performance (< 500ms)
- [ ] Horizontal scrolling (60 FPS)
- [ ] Vertical scrolling (60 FPS)
- [ ] Main ScrollView scrolling (60 FPS)
- [ ] Balance toggle performance
- [ ] Limited mode performance
- [ ] Mid-range device testing
- [ ] Safe area handling
- [ ] Overscroll glow
- [ ] TalkBack performance

---

## Troubleshooting

### Issue: Slow initial render

**Possible Causes**:
- Development mode overhead
- Network latency (Expo Go)
- Device performance

**Solutions**:
- Test on production build (not Expo Go)
- Use faster device
- Check network connection

### Issue: Stuttering during scrolling

**Possible Causes**:
- Too many items rendering
- Complex component logic
- Development mode overhead

**Solutions**:
- Verify FlatList is using stable keys
- Check for unnecessary re-renders
- Test on production build

### Issue: Balance toggle lag

**Possible Causes**:
- State update overhead
- Too many components re-rendering
- Development mode overhead

**Solutions**:
- Verify only necessary components re-render
- Check React DevTools for render count
- Test on production build

---

## Notes

- All automated tests pass successfully
- Manual testing should be performed on actual devices
- Performance may vary between development and production builds
- Expo Go adds overhead compared to standalone builds
- For best performance testing, create a production build

---

## Test Results Summary

**Automated Tests**: ✅ All 11 tests passing

**Manual Tests**: To be completed on physical devices

**Overall Status**: Performance tests implemented and passing
