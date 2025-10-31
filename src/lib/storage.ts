import * as SecureStore from 'expo-secure-store';

/**
 * Storage keys for SecureStore
 */
const STORAGE_KEYS = {
  SESSION_ID: 'transrify_session_id',
  CUSTOMER_REF: 'transrify_customer_ref',
  SESSION_MODE: 'transrify_session_mode',
  TENANT_KEY: 'transrify_tenant_key',
} as const;

/**
 * Session ID storage functions
 */
export async function setSessionId(sessionId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_ID, sessionId);
  } catch (error) {
    console.error('Failed to store session ID:', error);
    throw new Error('STORAGE_ERROR');
  }
}

export async function getSessionId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    console.error('Failed to retrieve session ID:', error);
    return null;
  }
}

export async function deleteSessionId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    console.error('Failed to delete session ID:', error);
    throw new Error('STORAGE_ERROR');
  }
}

/**
 * Customer reference storage functions
 */
export async function setCustomerRef(customerRef: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.CUSTOMER_REF, customerRef);
  } catch (error) {
    console.error('Failed to store customer reference:', error);
    throw new Error('STORAGE_ERROR');
  }
}

export async function getCustomerRef(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.CUSTOMER_REF);
  } catch (error) {
    console.error('Failed to retrieve customer reference:', error);
    return null;
  }
}

export async function deleteCustomerRef(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.CUSTOMER_REF);
  } catch (error) {
    console.error('Failed to delete customer reference:', error);
    throw new Error('STORAGE_ERROR');
  }
}

/**
 * Session mode storage functions
 */
export async function setSessionMode(mode: 'NORMAL' | 'DURESS'): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_MODE, mode);
  } catch (error) {
    console.error('Failed to store session mode:', error);
    throw new Error('STORAGE_ERROR');
  }
}

export async function getSessionMode(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.SESSION_MODE);
  } catch (error) {
    console.error('Failed to retrieve session mode:', error);
    return null;
  }
}

export async function deleteSessionMode(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_MODE);
  } catch (error) {
    console.error('Failed to delete session mode:', error);
    throw new Error('STORAGE_ERROR');
  }
}

/**
 * Tenant key storage functions
 */
export async function setTenantKey(tenantKey: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.TENANT_KEY, tenantKey);
  } catch (error) {
    console.error('Failed to store tenant key:', error);
    throw new Error('STORAGE_ERROR');
  }
}

export async function getTenantKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.TENANT_KEY);
  } catch (error) {
    console.error('Failed to retrieve tenant key:', error);
    return null;
  }
}

export async function deleteTenantKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_KEY);
  } catch (error) {
    console.error('Failed to delete tenant key:', error);
    throw new Error('STORAGE_ERROR');
  }
}

/**
 * Generic storage functions for any key-value pair
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to store item with key ${key}:`, error);
    throw new Error('STORAGE_ERROR');
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve item with key ${key}:`, error);
    return null;
  }
}

export async function deleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to delete item with key ${key}:`, error);
    throw new Error('STORAGE_ERROR');
  }
}

/**
 * Clear all stored data
 */
export async function clearAll(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_ID),
      SecureStore.deleteItemAsync(STORAGE_KEYS.CUSTOMER_REF),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_MODE),
      SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_KEY),
    ]);
  } catch (error) {
    console.error('Failed to clear all storage:', error);
    throw new Error('STORAGE_ERROR');
  }
}
