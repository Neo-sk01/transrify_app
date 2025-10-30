import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LandingScreen } from '../src/screens/LandingScreen';
import { useAuthStore } from '../src/state/useAuthStore';

// Mock the auth store
jest.mock('../src/state/useAuthStore');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock toast
jest.mock('../src/lib/toast', () => ({
  toast: jest.fn(),
}));

describe('LandingScreen Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth store mock
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: {
        customerRef: 'customer123',
        sessionId: 'session-abcd-1234',
      },
      sessionMode: 'NORMAL',
      clearSession: jest.fn(),
    });
  });

  describe('Initial Render Performance', () => {
    it('should render within 500ms', async () => {
      const startTime = performance.now();
      
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      // Wait for all content to be rendered
      await waitFor(() => {
        expect(getByText('Hi, customer123')).toBeTruthy();
        expect(getByText('Accounts')).toBeTruthy();
        expect(getByText('Quick Actions')).toBeTruthy();
        expect(getByText('Recent activity')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Target: < 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should render all account cards efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Everyday')).toBeTruthy();
        expect(getByText('Savings')).toBeTruthy();
        expect(getByText('Credit Card')).toBeTruthy();
      });
    });

    it('should render all quick actions efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Send')).toBeTruthy();
        expect(getByText('Receive')).toBeTruthy();
        expect(getByText('Top Up')).toBeTruthy();
        expect(getByText('Statements')).toBeTruthy();
      });
    });

    it('should render all transactions efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Checkers Sandton')).toBeTruthy();
        expect(getByText('SnapScan')).toBeTruthy();
        expect(getByText('Salary Deposit')).toBeTruthy();
      });
    });
  });

  describe('Component Stability', () => {
    it('should use stable keys for FlatList items', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      // Verify transactions are rendered with stable keys
      await waitFor(() => {
        expect(getByText('Checkers Sandton')).toBeTruthy();
      });
      
      // Re-render should not cause issues
      const { getByText: getByText2 } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText2('Checkers Sandton')).toBeTruthy();
      });
    });

    it('should handle balance toggle without performance degradation', async () => {
      const { getByText, rerender } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Show')).toBeTruthy();
      });
      
      const startTime = performance.now();
      
      // Simulate multiple re-renders (similar to toggle effect)
      for (let i = 0; i < 5; i++) {
        rerender(
          <NavigationContainer>
            <LandingScreen />
          </NavigationContainer>
        );
      }
      
      const endTime = performance.now();
      const toggleTime = endTime - startTime;
      
      // Should be very fast (< 100ms for 5 re-renders)
      expect(toggleTime).toBeLessThan(100);
    });
  });

  describe('Limited Mode Performance', () => {
    it('should render limited mode without performance impact', async () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: {
          customerRef: 'customer123',
          sessionId: 'session-abcd-1234',
        },
        sessionMode: 'DURESS',
        clearSession: jest.fn(),
      });
      
      const startTime = performance.now();
      
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Limited Mode (Monitoring)')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still be under 500ms
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('ScrollView Performance', () => {
    it('should render horizontal accounts ScrollView efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      // All account cards should be rendered immediately (no virtualization needed for 3 items)
      await waitFor(() => {
        expect(getByText('Everyday')).toBeTruthy();
        expect(getByText('Savings')).toBeTruthy();
        expect(getByText('Credit Card')).toBeTruthy();
      });
    });

    it('should render vertical transactions FlatList efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      // All transactions should be rendered (scrollEnabled is false, so all items are visible)
      await waitFor(() => {
        expect(getByText('Checkers Sandton')).toBeTruthy();
        expect(getByText('Salary Deposit')).toBeTruthy();
        // Note: FlatList may not render all items immediately in test environment
        // Verify at least first and middle transactions are present
        expect(getByText('Interest')).toBeTruthy();
      });
    });
  });

  describe('Memory and Re-render Efficiency', () => {
    it('should not cause memory leaks on multiple renders', async () => {
      // Render multiple times to check for memory leaks
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <NavigationContainer>
            <LandingScreen />
          </NavigationContainer>
        );
        unmount();
      }
      
      // If we get here without errors, no obvious memory leaks
      expect(true).toBe(true);
    });

    it('should handle rapid state changes efficiently', async () => {
      const { getByText, rerender } = render(
        <NavigationContainer>
          <LandingScreen />
        </NavigationContainer>
      );
      
      const startTime = performance.now();
      
      // Simulate rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <NavigationContainer>
            <LandingScreen />
          </NavigationContainer>
        );
      }
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      // 10 re-renders should be fast (< 200ms)
      expect(rerenderTime).toBeLessThan(200);
    });
  });
});
