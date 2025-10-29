/**
 * Error handling utilities for the Transrify app
 * Maps API and network error codes to user-friendly messages
 */

/**
 * Error message mapping for all API and network error codes
 * Based on Requirements 5.1, 5.2, 5.3, 5.4
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // API Errors (Requirement 5.1, 5.2, 5.3)
  INVALID_TENANT_KEY: 'Configuration error. Please contact support.',
  TENANT_SUSPENDED: 'Service unavailable. Please contact support.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a minute.',
  MISSING_REQUIRED_FIELDS: 'Invalid request. Please try again.',
  AUTHENTICATION_FAILED: 'Invalid credentials. Please try again.',
  
  // Network Errors (Requirement 5.4)
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Storage Errors
  STORAGE_ERROR: 'Storage error. Please restart the app.',
  
  // Default fallback (Requirement 5.5, 5.6)
  UNKNOWN_ERROR: 'An error occurred. Please try again.',
};

/**
 * Maps error objects to user-friendly error messages
 * Handles Error instances, string error codes, and unknown error types
 * 
 * @param error - The error to map (can be Error, string, or unknown)
 * @returns User-friendly error message string
 * 
 * @example
 * ```typescript
 * try {
 *   await authAdapter.signIn(customerRef, pin);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   setError(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    // Check if the error message is a known error code
    if (error.message in ERROR_MESSAGES) {
      return ERROR_MESSAGES[error.message];
    }
    
    // Check for network-related errors
    if (error.message.toLowerCase().includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (error.message.toLowerCase().includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    
    // Check for fetch/HTTP errors
    if (error.message.toLowerCase().includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }
  
  // Handle string error codes directly
  if (typeof error === 'string' && error in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error];
  }
  
  // Default fallback for unknown errors
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Type guard to check if an error is a known API error code
 * 
 * @param error - The error to check
 * @returns True if the error is a known API error code
 */
export function isKnownApiError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message in ERROR_MESSAGES;
  }
  if (typeof error === 'string') {
    return error in ERROR_MESSAGES;
  }
  return false;
}

/**
 * Type guard to check if an error is a network-related error
 * 
 * @param error - The error to check
 * @returns True if the error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('connection');
  }
  if (typeof error === 'string') {
    return error === 'NETWORK_ERROR' || error === 'TIMEOUT_ERROR';
  }
  return false;
}
