import * as SecureStore from 'expo-secure-store';
import { MockAuthAdapter, TransrifyAuthAdapter } from '../src/lib/auth';
import * as storage from '../src/lib/storage';

// Get mocked functions
const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

// Mock global fetch
global.fetch = jest.fn();

describe('MockAuthAdapter', () => {
  let adapter: MockAuthAdapter;

  beforeEach(() => {
    adapter = new MockAuthAdapter();
    jest.clearAllMocks();
    // Mock storage operations to succeed by default
    mockSetItemAsync.mockResolvedValue();
    mockGetItemAsync.mockResolvedValue(null);
    mockDeleteItemAsync.mockResolvedValue();
  });

  describe('signIn', () => {
    it('should successfully authenticate with valid credentials and return NORMAL verdict', async () => {
      const customerRef = 'TEST_USER';
      const pin = '1234';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('NORMAL');
      expect(response.recommendedAction).toBe('ALLOW');
      expect(response.sessionId).toMatch(/^mock-\d+-[a-z0-9]+$/);
      
      // Verify session data was stored
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_id', expect.any(String));
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_customer_ref', customerRef);
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', 'NORMAL');
    });

    it('should return DURESS verdict when PIN ends in 1', async () => {
      const customerRef = 'TEST_USER';
      const pin = '1231';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('DURESS');
      expect(response.recommendedAction).toBe('LIMIT_AND_MONITOR');
      expect(response.sessionId).toMatch(/^mock-\d+-[a-z0-9]+$/);
      
      // Verify session data was stored with DURESS mode
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', 'DURESS');
    });

    it('should return DURESS verdict for multi-digit PIN ending in 1', async () => {
      const customerRef = 'TEST_USER';
      const pin = '987651';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('DURESS');
      expect(response.recommendedAction).toBe('LIMIT_AND_MONITOR');
    });

    it('should return FAIL verdict for invalid customer reference (too short)', async () => {
      const customerRef = 'AB';
      const pin = '1234';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('FAIL');
      expect(response.recommendedAction).toBe('DENY');
      expect(response.sessionId).toBe('');
      
      // Verify no session data was stored
      expect(mockSetItemAsync).not.toHaveBeenCalled();
    });

    it('should return FAIL verdict for invalid customer reference (too long)', async () => {
      const customerRef = 'A'.repeat(51);
      const pin = '1234';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('FAIL');
      expect(response.recommendedAction).toBe('DENY');
      expect(response.sessionId).toBe('');
    });

    it('should return FAIL verdict for invalid PIN (too short)', async () => {
      const customerRef = 'TEST_USER';
      const pin = '123';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('FAIL');
      expect(response.recommendedAction).toBe('DENY');
      expect(response.sessionId).toBe('');
    });

    it('should return FAIL verdict for invalid PIN (too long)', async () => {
      const customerRef = 'TEST_USER';
      const pin = '123456789';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('FAIL');
      expect(response.recommendedAction).toBe('DENY');
      expect(response.sessionId).toBe('');
    });

    it('should return FAIL verdict for non-numeric PIN', async () => {
      const customerRef = 'TEST_USER';
      const pin = '12ab';

      const response = await adapter.signIn(customerRef, pin);

      expect(response.verdict).toBe('FAIL');
      expect(response.recommendedAction).toBe('DENY');
      expect(response.sessionId).toBe('');
    });

    it('should generate unique session IDs for multiple sign-ins', async () => {
      const customerRef = 'TEST_USER';
      const pin = '1234';

      const response1 = await adapter.signIn(customerRef, pin);
      const response2 = await adapter.signIn(customerRef, pin);

      expect(response1.sessionId).not.toBe(response2.sessionId);
    });
  });

  describe('signOut', () => {
    it('should clear all stored data', async () => {
      await adapter.signOut();

      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_id');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_customer_ref');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_mode');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_tenant_key');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when session exists', async () => {
      const sessionId = 'mock-session-123';
      const customerRef = 'TEST_USER';

      mockGetItemAsync
        .mockResolvedValueOnce(sessionId)
        .mockResolvedValueOnce(customerRef);

      const user = await adapter.getCurrentUser();

      expect(user).toEqual({
        sessionId,
        customerRef,
      });
    });

    it('should return null when no session exists', async () => {
      mockGetItemAsync.mockResolvedValue(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when only session ID exists', async () => {
      mockGetItemAsync
        .mockResolvedValueOnce('mock-session-123')
        .mockResolvedValueOnce(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when only customer reference exists', async () => {
      mockGetItemAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('TEST_USER');

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});

describe('TransrifyAuthAdapter', () => {
  let adapter: TransrifyAuthAdapter;
  const baseURL = 'https://api.test.transrify.com';
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    adapter = new TransrifyAuthAdapter(baseURL);
    jest.clearAllMocks();
    // Mock storage operations to succeed by default
    mockSetItemAsync.mockResolvedValue();
    mockGetItemAsync.mockResolvedValue(null);
    mockDeleteItemAsync.mockResolvedValue();
  });

  describe('signIn', () => {
    it('should throw INVALID_TENANT_KEY error when tenant key is not stored', async () => {
      mockGetItemAsync.mockResolvedValueOnce(null);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('INVALID_TENANT_KEY');
    });

    it('should successfully authenticate with valid credentials', async () => {
      const tenantKey = 'test-tenant-key';
      const customerRef = 'TEST_USER';
      const pin = '1234';
      const mockResponse = {
        verdict: 'NORMAL',
        recommendedAction: 'ALLOW',
        sessionId: 'session-abc123',
      };

      // Mock tenant key retrieval
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await adapter.signIn(customerRef, pin);

      expect(response).toEqual(mockResponse);
      
      // Verify API was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}/v1/sessions/login`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(tenantKey),
        })
      );

      // Verify session data was stored
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_id', 'session-abc123');
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_customer_ref', customerRef);
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', 'NORMAL');
    });

    it('should handle DURESS verdict and store session data', async () => {
      const tenantKey = 'test-tenant-key';
      const customerRef = 'TEST_USER';
      const pin = '1231';
      const mockResponse = {
        verdict: 'DURESS',
        recommendedAction: 'LIMIT_AND_MONITOR',
        sessionId: 'session-duress-123',
      };

      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await adapter.signIn(customerRef, pin);

      expect(response).toEqual(mockResponse);
      
      // Verify DURESS mode was stored
      expect(mockSetItemAsync).toHaveBeenCalledWith('transrify_session_mode', 'DURESS');
    });

    it('should handle FAIL verdict without storing session data', async () => {
      const tenantKey = 'test-tenant-key';
      const customerRef = 'TEST_USER';
      const pin = '9999';
      const mockResponse = {
        verdict: 'FAIL',
        recommendedAction: 'DENY',
        sessionId: '',
      };

      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await adapter.signIn(customerRef, pin);

      expect(response).toEqual(mockResponse);
      
      // Verify no session data was stored for FAIL verdict
      expect(mockSetItemAsync).not.toHaveBeenCalled();
    });

    it('should throw INVALID_TENANT_KEY error when API returns 401', async () => {
      const tenantKey = 'invalid-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'INVALID_TENANT_KEY' }),
      } as Response);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('INVALID_TENANT_KEY');
    });

    it('should throw TENANT_SUSPENDED error when API returns suspended status', async () => {
      const tenantKey = 'suspended-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'TENANT_SUSPENDED' }),
      } as Response);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('TENANT_SUSPENDED');
    });

    it('should throw RATE_LIMIT_EXCEEDED error when API returns rate limit status', async () => {
      const tenantKey = 'test-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'RATE_LIMIT_EXCEEDED' }),
      } as Response);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('RATE_LIMIT_EXCEEDED');
    });

    it('should throw AUTHENTICATION_FAILED for generic API errors', async () => {
      const tenantKey = 'test-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('AUTHENTICATION_FAILED');
    });

    it('should throw NETWORK_ERROR when fetch fails', async () => {
      const tenantKey = 'test-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('NETWORK_ERROR');
    });

    it('should throw AUTHENTICATION_FAILED when response is missing required fields', async () => {
      const tenantKey = 'test-key';
      
      mockGetItemAsync.mockResolvedValueOnce(tenantKey);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verdict: 'NORMAL' }), // Missing sessionId
      } as Response);

      await expect(adapter.signIn('TEST_USER', '1234')).rejects.toThrow('AUTHENTICATION_FAILED');
    });
  });

  describe('signOut', () => {
    it('should clear all stored data', async () => {
      await adapter.signOut();

      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(4);
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_id');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_customer_ref');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_session_mode');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('transrify_tenant_key');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when session exists', async () => {
      const sessionId = 'session-abc123';
      const customerRef = 'TEST_USER';

      mockGetItemAsync
        .mockResolvedValueOnce(sessionId)
        .mockResolvedValueOnce(customerRef);

      const user = await adapter.getCurrentUser();

      expect(user).toEqual({
        sessionId,
        customerRef,
      });
    });

    it('should return null when no session exists', async () => {
      mockGetItemAsync.mockResolvedValue(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});
