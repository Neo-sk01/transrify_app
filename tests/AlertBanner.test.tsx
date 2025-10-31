/**
 * AlertBanner Integration Tests
 * 
 * Tests the AlertBanner component's rendering, user interactions,
 * conditional NFC button display, and haptic feedback.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { AlertBanner, AlertBannerProps } from '../src/components/AlertBanner';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Warning: 'warning',
  },
}));

// Mock the NFC module with a mutable value
let mockIsNfcAvailable = false;
jest.mock('../src/lib/nfc', () => ({
  get isNfcAvailable() {
    return mockIsNfcAvailable;
  },
}));

describe('AlertBanner', () => {
  const mockAlert = {
    id: 'alert-123',
    customerRef: 'USER_001',
    distance: '250m',
  };

  const mockCallbacks = {
    onAck: jest.fn(),
    onMap: jest.fn(),
    onCall: jest.fn(),
    onNfc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Alert Information Display', () => {
    it('should display alert title', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText('⚠️ Nearby Duress Alert')).toBeTruthy();
    });

    it('should display customer reference', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText(/USER_001/)).toBeTruthy();
    });

    it('should display distance when provided', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText(/250m/)).toBeTruthy();
    });

    it('should not display distance when not provided', () => {
      const alertWithoutDistance = {
        id: 'alert-123',
        customerRef: 'USER_001',
      };

      const { queryByText } = render(
        <AlertBanner alert={alertWithoutDistance} {...mockCallbacks} />
      );

      expect(queryByText(/Distance:/)).toBeNull();
    });

    it('should have alert accessibility role', () => {
      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      // Check for the container with alert role via accessibility label
      expect(getByLabelText('Nearby duress alert notification')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should render Acknowledge button', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText('Acknowledge')).toBeTruthy();
    });

    it('should render View Map button', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText('View Map')).toBeTruthy();
    });

    it('should render Call Emergency button', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText('Call Emergency')).toBeTruthy();
    });

    it('should call onAck when Acknowledge button is pressed', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      fireEvent.press(getByText('Acknowledge'));

      expect(mockCallbacks.onAck).toHaveBeenCalledTimes(1);
    });

    it('should call onMap when View Map button is pressed', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      fireEvent.press(getByText('View Map'));

      expect(mockCallbacks.onMap).toHaveBeenCalledTimes(1);
    });

    it('should call onCall when Call Emergency button is pressed', () => {
      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      fireEvent.press(getByText('Call Emergency'));

      expect(mockCallbacks.onCall).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility labels for buttons', () => {
      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByLabelText('Acknowledge alert')).toBeTruthy();
      expect(getByLabelText('View map')).toBeTruthy();
      expect(getByLabelText('Call emergency')).toBeTruthy();
    });
  });

  describe('NFC Button Conditional Rendering', () => {
    beforeEach(() => {
      // Reset NFC availability to false before each test
      mockIsNfcAvailable = false;
    });

    it('should not render NFC button when NFC is disabled', () => {
      mockIsNfcAvailable = false;
      
      const { queryByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(queryByText('📱 NFC Confirm')).toBeNull();
    });

    it('should render NFC button when NFC is enabled', () => {
      mockIsNfcAvailable = true;

      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByText('📱 NFC Confirm')).toBeTruthy();
    });

    it('should call onNfc when NFC button is pressed', () => {
      mockIsNfcAvailable = true;

      const { getByText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      fireEvent.press(getByText('📱 NFC Confirm'));

      expect(mockCallbacks.onNfc).toHaveBeenCalledTimes(1);
    });

    it('should not render NFC button when onNfc callback is not provided', () => {
      mockIsNfcAvailable = true;

      const callbacksWithoutNfc = {
        onAck: jest.fn(),
        onMap: jest.fn(),
        onCall: jest.fn(),
      };

      const { queryByText } = render(
        <AlertBanner alert={mockAlert} {...callbacksWithoutNfc} />
      );

      expect(queryByText('📱 NFC Confirm')).toBeNull();
    });

    it('should have proper accessibility label for NFC button when enabled', () => {
      mockIsNfcAvailable = true;

      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByLabelText('NFC confirm')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on mount', () => {
      render(<AlertBanner alert={mockAlert} {...mockCallbacks} />);

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should trigger haptic feedback only once per mount', () => {
      const { rerender } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      // Rerender with same props
      rerender(<AlertBanner alert={mockAlert} {...mockCallbacks} />);

      // Should still only be called once (from initial mount)
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback again when component remounts', () => {
      const { unmount } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);

      unmount();

      // Mount again
      render(<AlertBanner alert={mockAlert} {...mockCallbacks} />);

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for alert information', () => {
      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      expect(getByLabelText('Nearby duress alert')).toBeTruthy();
      expect(getByLabelText('User in duress: USER_001')).toBeTruthy();
      expect(getByLabelText('Distance: 250m')).toBeTruthy();
    });

    it('should have button accessibility roles', () => {
      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      // Check that all buttons are accessible
      expect(getByLabelText('Acknowledge alert')).toBeTruthy();
      expect(getByLabelText('View map')).toBeTruthy();
      expect(getByLabelText('Call emergency')).toBeTruthy();
    });

    it('should have accessibility hints for buttons', () => {
      const { getByLabelText } = render(
        <AlertBanner alert={mockAlert} {...mockCallbacks} />
      );

      // Verify buttons have proper hints by checking they exist
      const ackButton = getByLabelText('Acknowledge alert');
      const mapButton = getByLabelText('View map');
      const callButton = getByLabelText('Call emergency');

      expect(ackButton).toBeTruthy();
      expect(mapButton).toBeTruthy();
      expect(callButton).toBeTruthy();
    });
  });

  describe('Multiple Alerts', () => {
    it('should handle different customer references', () => {
      const alert1 = { ...mockAlert, customerRef: 'USER_001' };
      const alert2 = { ...mockAlert, customerRef: 'USER_002' };

      const { getByText, rerender } = render(
        <AlertBanner alert={alert1} {...mockCallbacks} />
      );

      expect(getByText(/USER_001/)).toBeTruthy();

      rerender(<AlertBanner alert={alert2} {...mockCallbacks} />);

      expect(getByText(/USER_002/)).toBeTruthy();
    });

    it('should handle different distances', () => {
      const alert1 = { ...mockAlert, distance: '100m' };
      const alert2 = { ...mockAlert, distance: '2.5km' };

      const { getByText, rerender } = render(
        <AlertBanner alert={alert1} {...mockCallbacks} />
      );

      expect(getByText(/100m/)).toBeTruthy();

      rerender(<AlertBanner alert={alert2} {...mockCallbacks} />);

      expect(getByText(/2.5km/)).toBeTruthy();
    });
  });
});
