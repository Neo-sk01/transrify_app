# Manual Test: Limited Mode Behavior

## Test Objective
Verify that Limited Mode (duress mode) displays correctly and disables the appropriate actions while maintaining a normal appearance.

## Prerequisites
- App running in Expo Go
- Logged in with a valid session

## Test Procedure

### Part 1: Enable Limited Mode

1. **Set limitedMode to true**
   - Modify `src/state/useAuthStore.ts` temporarily OR
   - Log in with duress PIN (if implemented) OR
   - Use React DevTools to set `sessionMode` to 'DURESS'

2. **Verify Limited Mode pill is displayed**
   - [ ] Limited Mode pill appears below the header
   - [ ] Pill displays text "Limited Mode (Monitoring)"
   - [ ] Pill has primary-tinted background (purple with transparency)
   - [ ] Pill text is primary color (purple)
   - [ ] Pill is subtle and not alarming in appearance

### Part 2: Verify Disabled Actions

3. **Verify Send action has reduced opacity**
   - [ ] Send button (paper plane icon) has opacity 0.5
   - [ ] Send button appears visually dimmed compared to enabled actions
   - [ ] Send button is still visible and touchable

4. **Tap Send action and verify toast**
   - [ ] Tap the Send button
   - [ ] Toast message "Temporarily unavailable" appears
   - [ ] No navigation occurs
   - [ ] Toast can be dismissed

5. **Verify Top Up action has reduced opacity**
   - [ ] Top Up button (add circle icon) has opacity 0.5
   - [ ] Top Up button appears visually dimmed
   - [ ] Top Up button is still visible and touchable

6. **Tap Top Up action and verify toast**
   - [ ] Tap the Top Up button
   - [ ] Toast message "Temporarily unavailable" appears
   - [ ] No navigation occurs
   - [ ] Toast can be dismissed

### Part 3: Verify Enabled Actions

7. **Verify Receive action remains enabled**
   - [ ] Receive button (arrow down icon) has normal opacity (1.0)
   - [ ] Receive button appears fully visible
   - [ ] Tap Receive button shows "Receive money" toast (not "Temporarily unavailable")

8. **Verify Statements action remains enabled**
   - [ ] Statements button (document icon) has normal opacity (1.0)
   - [ ] Statements button appears fully visible
   - [ ] Tap Statements button shows "View statements" toast (not "Temporarily unavailable")

### Part 4: Disable Limited Mode

9. **Set limitedMode to false**
   - Modify `src/state/useAuthStore.ts` to set `sessionMode` to 'NORMAL' OR
   - Log out and log back in with normal PIN OR
   - Use React DevTools to set `sessionMode` to 'NORMAL'

10. **Verify pill is hidden**
    - [ ] Limited Mode pill is NOT displayed
    - [ ] No visual indication of limited mode

11. **Verify all actions are enabled**
    - [ ] Send button has normal opacity (1.0)
    - [ ] Top Up button has normal opacity (1.0)
    - [ ] Receive button has normal opacity (1.0)
    - [ ] Statements button has normal opacity (1.0)
    - [ ] Tap Send button shows "Send money" toast (not "Temporarily unavailable")
    - [ ] Tap Top Up button shows "Top up account" toast (not "Temporarily unavailable")

## Test Results

### Part 1: Enable Limited Mode
- [ ] PASS
- [ ] FAIL - Details: _______________

### Part 2: Verify Disabled Actions
- [ ] PASS
- [ ] FAIL - Details: _______________

### Part 3: Verify Enabled Actions
- [ ] PASS
- [ ] FAIL - Details: _______________

### Part 4: Disable Limited Mode
- [ ] PASS
- [ ] FAIL - Details: _______________

## Overall Result
- [ ] ALL TESTS PASSED
- [ ] SOME TESTS FAILED

## Notes
_Add any observations or issues here_

---

## Quick Test Script

For quick testing, you can temporarily modify the LandingScreen to force limited mode:

```typescript
// In LandingScreen.tsx, replace this line:
const limitedMode = sessionMode === 'DURESS';

// With this for testing:
const limitedMode = true; // Force limited mode for testing
```

Then reload the app and verify all behaviors. Remember to revert this change after testing.
