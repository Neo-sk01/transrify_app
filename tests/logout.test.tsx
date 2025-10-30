import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { LandingScreen } from '../src/screens/LandingScreen';
import { useAuthStore } from '../src/state/useAuthStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Get mocked functions
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

// Create a mock navigation stack
const Stack = createNativeStackNavigator();

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Helper to render LandingScreen with navigation
const renderWithNavigation = () => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Landing" component={LandingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Logout Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset auth store to authenticated state
    useAuthStore.setState({
      user: {
        customerRef: 'TEST_USER',
        sessionId: 'mock-session-abcd1234',
      },
      sessionMode: 'NORMAL',
      isAuthenticated: true,
      isLoading: false,
    });
    
    // Mock SecureStore operations to succeed by default
    mockDeleteItemAsync.mockResolvedValue();
  });

  describe('Logout Button', () => {
    it('should display logout button in session strip', () => {
      const { getByText } = renderWithNavigation();
      
      const logoutButton = getByText('Log out');
      expect(logoutButton).toBeTruthy();
    });

    it('should have accessibility label on logout button', () => {
      const { getByLabelText } = renderWithNavigation();
      
      const logoutButton = getByLabelText('Log out button');
      expect(logoutButton).toBeTruthy();
    });

    it('should display session ID tail in session strip', () => {
      const { getByText } = renderWithNavigation();
      
      // Session ID is 'mock-session-abcd1234', last 4 chars are '1234'
      const sessionText = getByText(/Session …1234 · Signed in/);
      expect(sessionText).toBeTruthy();
    });
  });

  describe('clearSession Functionality', () => {
    it('should call clearSession when logout button is tapped', async () => {
      const clearSessionSpy = jest.spyOn(useAuthStore.getState(), 'clearSession');
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(clearSessionSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear all session data from SecureStore', async () => {
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_id');
        expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_customer_ref');
        expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_mode');
        expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_tenant_key');
        expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
      });
    });

    it('should update auth store state after clearing session', async () => {
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.sessionMode).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Navigation After Logout', () => {
    it('should navigate to Login screen after successful logout', async () => {
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Login');
      });
    });

    it('should navigate to Login screen even if clearSession fails', async () => {
      // Mock clearSession to throw an error
      mockDeleteItemAsync.mockRejectedValueOnce(new Error('SecureStore error'));
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Login');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle SecureStore deletion errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDeleteItemAsync.mockRejectedValueOnce(new Error('SecureStore deletion failed'));
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Logout failed:',
          expect.any(Error)
        );
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should not clear auth store state if SecureStore fails', async () => {
      mockDeleteItemAsync.mockRejectedValueOnce(new Error('SecureStore error'));
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      // Wait for the error to be handled and navigation to occur
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Login');
      });
      
      // State should NOT be cleared if SecureStore fails (clearSession throws)
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Session Display', () => {
    it('should display last 4 characters of session ID', () => {
      useAuthStore.setState({
        user: {
          customerRef: 'TEST_USER',
          sessionId: 'session-xyz-9876',
        },
        sessionMode: 'NORMAL',
        isAuthenticated: true,
      });
      
      const { getByText } = renderWithNavigation();
      
      const sessionText = getByText(/Session …9876 · Signed in/);
      expect(sessionText).toBeTruthy();
    });

    it('should display fallback when session ID is missing', () => {
      useAuthStore.setState({
        user: {
          customerRef: 'TEST_USER',
          sessionId: '',
        },
        sessionMode: 'NORMAL',
        isAuthenticated: true,
      });
      
      const { getByText } = renderWithNavigation();
      
      const sessionText = getByText(/Session …---- · Signed in/);
      expect(sessionText).toBeTruthy();
    });

    it('should display fallback when user is null', () => {
      useAuthStore.setState({
        user: null,
        sessionMode: null,
        isAuthenticated: false,
      });
      
      const { getByText } = renderWithNavigation();
      
      const sessionText = getByText(/Session …---- · Signed in/);
      expect(sessionText).toBeTruthy();
    });
  });

  describe('Logout in Different Session Modes', () => {
    it('should logout successfully in NORMAL mode', async () => {
      useAuthStore.setState({
        user: {
          customerRef: 'TEST_USER',
          sessionId: 'normal-session-123',
        },
        sessionMode: 'NORMAL',
        isAuthenticated: true,
      });
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
        expect(mockNavigate).toHaveBeenCalledWith('Login');
      });
    });

    it('should logout successfully in DURESS mode', async () => {
      useAuthStore.setState({
        user: {
          customerRef: 'TEST_USER',
          sessionId: 'duress-session-456',
        },
        sessionMode: 'DURESS',
        isAuthenticated: true,
      });
      
      const { getByText } = renderWithNavigation();
      const logoutButton = getByText('Log out');
      
      fireEvent.press(logoutButton);
      
      await waitFor(() => {
        expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
        expect(mockNavigate).toHaveBeenCalledWith('Login');
      });
    });
  });
});
