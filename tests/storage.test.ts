import * as SecureStore from 'expo-secure-store';
import * as storage from '../src/lib/storage';

// Get mocked functions
const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

describe('Storage utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('setSessionId and getSessionId', () => {
    it('should store and retrieve session ID', async () => {
      const testSessionId = 'test-session-123';
      
      // Mock setItemAsync to resolve successfully
      mockSetItemAsync.mockResolvedValueOnce();
      
      // Store session ID
      await storage.setSessionId(testSessionId);
      
      // Verify setItemAsync was called with correct parameters
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_id', testSessionId);
      
      // Mock getItemAsync to return the stored value
      mockGetItemAsync.mockResolvedValueOnce(testSessionId);
      
      // Retrieve session ID
      const retrievedSessionId = await storage.getSessionId();
      
      // Verify getItemAsync was called with correct key
      expect(mockGetItemAsync).toHaveBeenCalledWith('transrify_session_id');
      
      // Verify retrieved value matches stored value
      expect(retrievedSessionId).toBe(testSessionId);
    });

    it('should return null when session ID does not exist', async () => {
      mockGetItemAsync.mockResolvedValueOnce(null);
      
      const sessionId = await storage.getSessionId();
      
      expect(sessionId).toBeNull();
    });

    it('should throw error when setSessionId fails', async () => {
      mockSetItemAsync.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(storage.setSessionId('test-session')).rejects.toThrow('STORAGE_ERROR');
    });
  });

  describe('setCustomerRef and getCustomerRef', () => {
    it('should store and retrieve customer reference', async () => {
      const testCustomerRef = 'TEST_USER_123';
      
      // Mock setItemAsync to resolve successfully
      mockSetItemAsync.mockResolvedValueOnce();
      
      // Store customer reference
      await storage.setCustomerRef(testCustomerRef);
      
      // Verify setItemAsync was called with correct parameters
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_customer_ref', testCustomerRef);
      
      // Mock getItemAsync to return the stored value
      mockGetItemAsync.mockResolvedValueOnce(testCustomerRef);
      
      // Retrieve customer reference
      const retrievedCustomerRef = await storage.getCustomerRef();
      
      // Verify getItemAsync was called with correct key
      expect(mockGetItemAsync).toHaveBeenCalledWith('transrify_customer_ref');
      
      // Verify retrieved value matches stored value
      expect(retrievedCustomerRef).toBe(testCustomerRef);
    });

    it('should return null when customer reference does not exist', async () => {
      mockGetItemAsync.mockResolvedValueOnce(null);
      
      const customerRef = await storage.getCustomerRef();
      
      expect(customerRef).toBeNull();
    });

    it('should throw error when setCustomerRef fails', async () => {
      mockSetItemAsync.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(storage.setCustomerRef('TEST_USER')).rejects.toThrow('STORAGE_ERROR');
    });
  });

  describe('setSessionMode and getSessionMode', () => {
    it('should store and retrieve NORMAL session mode', async () => {
      const testMode = 'NORMAL';
      
      // Mock setItemAsync to resolve successfully
      mockSetItemAsync.mockResolvedValueOnce();
      
      // Store session mode
      await storage.setSessionMode(testMode);
      
      // Verify setItemAsync was called with correct parameters
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', testMode);
      
      // Mock getItemAsync to return the stored value
      mockGetItemAsync.mockResolvedValueOnce(testMode);
      
      // Retrieve session mode
      const retrievedMode = await storage.getSessionMode();
      
      // Verify getItemAsync was called with correct key
      expect(mockGetItemAsync).toHaveBeenCalledWith('transrify_session_mode');
      
      // Verify retrieved value matches stored value
      expect(retrievedMode).toBe(testMode);
    });

    it('should store and retrieve DURESS session mode', async () => {
      const testMode = 'DURESS';
      
      mockSetItemAsync.mockResolvedValueOnce();
      await storage.setSessionMode(testMode);
      
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', testMode);
      
      mockGetItemAsync.mockResolvedValueOnce(testMode);
      const retrievedMode = await storage.getSessionMode();
      
      expect(retrievedMode).toBe(testMode);
    });

    it('should return null when session mode does not exist', async () => {
      mockGetItemAsync.mockResolvedValueOnce(null);
      
      const mode = await storage.getSessionMode();
      
      expect(mode).toBeNull();
    });

    it('should throw error when setSessionMode fails', async () => {
      mockSetItemAsync.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(storage.setSessionMode('NORMAL')).rejects.toThrow('STORAGE_ERROR');
    });
  });

  describe('clearAll', () => {
    it('should remove all storage keys', async () => {
      // Mock deleteItemAsync to resolve successfully for all keys
      mockDeleteItemAsync.mockResolvedValue();
      
      // Call clearAll
      await storage.clearAll();
      
      // Verify deleteItemAsync was called for all keys
      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_id');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_customer_ref');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_mode');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_tenant_key');
    });

    it('should throw error when clearAll fails', async () => {
      mockDeleteItemAsync.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(storage.clearAll()).rejects.toThrow('STORAGE_ERROR');
    });
  });

  describe('integration scenario', () => {
    it('should handle complete authentication flow', async () => {
      // Mock successful storage operations
      mockSetItemAsync.mockResolvedValue();
      mockGetItemAsync.mockResolvedValue(null);
      
      // Store authentication data
      await storage.setSessionId('session-abc123');
      await storage.setCustomerRef('USER_001');
      await storage.setSessionMode('NORMAL');
      
      // Verify all data was stored
      expect(mockSetItemAsync).toHaveBeenCalledTimes(3);
      
      // Mock retrieval of stored data
      mockGetItemAsync
        .mockResolvedValueOnce('session-abc123')
        .mockResolvedValueOnce('USER_001')
        .mockResolvedValueOnce('NORMAL');
      
      // Retrieve all data
      const sessionId = await storage.getSessionId();
      const customerRef = await storage.getCustomerRef();
      const mode = await storage.getSessionMode();
      
      expect(sessionId).toBe('session-abc123');
      expect(customerRef).toBe('USER_001');
      expect(mode).toBe('NORMAL');
      
      // Clear all data
      mockDeleteItemAsync.mockResolvedValue();
      await storage.clearAll();
      
      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
      
      // Verify data is cleared
      mockGetItemAsync.mockResolvedValue(null);
      
      const clearedSessionId = await storage.getSessionId();
      const clearedCustomerRef = await storage.getCustomerRef();
      const clearedMode = await storage.getSessionMode();
      
      expect(clearedSessionId).toBeNull();
      expect(clearedCustomerRef).toBeNull();
      expect(clearedMode).toBeNull();
    });
  });
});
