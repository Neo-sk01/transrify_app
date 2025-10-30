# Manual Test: Balance Masking Toggle Functionality

## Test Overview
This document provides step-by-step instructions to manually test the balance masking toggle functionality in the LandingScreen.

**Requirements Being Tested:** 4.1, 4.2, 4.3, 4.4, 4.5

## Prerequisites
- Expo Go app installed on iOS or Android device
- Development server running (npm start)
- Logged into the app with valid credentials

## Test Cases

### Test Case 1: Verify Initial State Shows Masked Balances
**Expected Result:** All account balances should display as "• • • •"

**Steps:**
1. Open the app in Expo Go
2. Log in with valid credentials (use normal PIN, not duress PIN)
3. Observe the LandingScreen after successful login
4. Look at the "Accounts" section

**Verification Checklist:**
- [ ] All account cards display "• • • •" instead of actual balance amounts
- [ ] The toggle button displays "Show" text
- [ ] Account names are visible (e.g., "Everyday", "Savings", "Credit Card")
- [ ] Currency codes are visible (e.g., "ZAR")
- [ ] Last 4 digits of account numbers are visible (e.g., "···· 1023")

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

### Test Case 2: Tap Show Button and Verify Formatted Currency Display
**Expected Result:** All balances should display as formatted currency (e.g., "R 12,345.67")

**Steps:**
1. From the initial state (balances masked)
2. Tap the "Show" button in the Accounts section header
3. Observe all account cards

**Verification Checklist:**
- [ ] First account (Everyday) displays "R 12,345.67"
- [ ] Second account (Savings) displays "R 98,765.43"
- [ ] Third account (Credit Card) displays "-R 2,150.00" (negative balance)
- [ ] All balances use proper currency formatting with commas and 2 decimal places
- [ ] The toggle button text changes from "Show" to "Hide"
- [ ] Currency codes remain visible
- [ ] Account names and last 4 digits remain visible

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

### Test Case 3: Tap Hide Button and Verify Return to Masked State
**Expected Result:** All balances should return to "• • • •"

**Steps:**
1. From the state where balances are visible
2. Tap the "Hide" button in the Accounts section header
3. Observe all account cards

**Verification Checklist:**
- [ ] All account cards display "• • • •" again
- [ ] No actual balance amounts are visible
- [ ] The toggle button text changes from "Hide" to "Show"
- [ ] Account names remain visible
- [ ] Currency codes remain visible
- [ ] Last 4 digits remain visible

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

### Test Case 4: Verify Button Label Changes
**Expected Result:** Button label toggles between "Show" and "Hide"

**Steps:**
1. Start with balances masked (button shows "Show")
2. Tap the button
3. Observe button label changes to "Hide"
4. Tap the button again
5. Observe button label changes back to "Show"
6. Repeat 2-3 times to ensure consistency

**Verification Checklist:**
- [ ] Button label is "Show" when balances are masked
- [ ] Button label is "Hide" when balances are visible
- [ ] Label changes immediately upon tap
- [ ] Toggle works consistently across multiple taps
- [ ] No delay or lag in label update

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

### Test Case 5: Test with Screen Reader (iOS VoiceOver)
**Expected Result:** Screen reader announces balance visibility state changes

**Steps:**
1. Enable VoiceOver on iOS device (Settings > Accessibility > VoiceOver)
2. Navigate to the LandingScreen
3. Swipe to the toggle button
4. Listen to the accessibility label
5. Double-tap to activate the button
6. Listen to the new accessibility label

**Verification Checklist:**
- [ ] When balances are hidden, VoiceOver announces "Show account balances"
- [ ] When balances are visible, VoiceOver announces "Hide account balances"
- [ ] Accessibility hint announces "Double tap to toggle balance visibility"
- [ ] Account cards announce balance state (e.g., "Everyday account, balance hidden" or "Everyday account, R 12,345.67")
- [ ] Toggle button has minimum 44px touch target (easy to tap)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

### Test Case 6: Test with Screen Reader (Android TalkBack)
**Expected Result:** Screen reader announces balance visibility state changes

**Steps:**
1. Enable TalkBack on Android device (Settings > Accessibility > TalkBack)
2. Navigate to the LandingScreen
3. Swipe to the toggle button
4. Listen to the accessibility label
5. Double-tap to activate the button
6. Listen to the new accessibility label

**Verification Checklist:**
- [ ] When balances are hidden, TalkBack announces "Show account balances"
- [ ] When balances are visible, TalkBack announces "Hide account balances"
- [ ] Accessibility hint announces "Double tap to toggle balance visibility"
- [ ] Account cards announce balance state appropriately
- [ ] Toggle button has minimum 44px touch target (easy to tap)

**Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________________________________________

---

## Additional Verification Tests

### Test Case 7: Horizontal Scroll with Different Balance States
**Steps:**
1. With balances masked, scroll horizontally through account cards
2. Verify all cards show masked balances
3. Tap "Show" button
4. Scroll horizontally through account cards again
5. Verify all cards show formatted balances

**Verification Checklist:**
- [ ] Scrolling works smoothly in both states
- [ ] All cards update simultaneously when toggling
- [ ] No cards are "stuck" in the wrong state

**Result:** ☐ PASS ☐ FAIL

---

### Test Case 8: Toggle During Limited Mode
**Steps:**
1. Log out and log back in with duress PIN (if configured)
2. Verify "Limited Mode (Monitoring)" pill is displayed
3. Test balance toggle functionality

**Verification Checklist:**
- [ ] Balance toggle works the same in limited mode
- [ ] Show/Hide button functions normally
- [ ] Balances mask and unmask correctly
- [ ] No interference with limited mode restrictions

**Result:** ☐ PASS ☐ FAIL

---

## Test Summary

**Total Test Cases:** 8
**Passed:** _____
**Failed:** _____
**Pass Rate:** _____%

**Overall Result:** ☐ PASS ☐ FAIL

**Tester Name:** _______________________
**Date:** _______________________
**Device:** _______________________
**OS Version:** _______________________

## Issues Found
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

## Recommendations
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
