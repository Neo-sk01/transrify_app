import { API_BASE_URL } from '../config';

/**
 * Generic API client with automatic retry logic for rate limiting
 * @param path - API endpoint path (e.g., '/v1/sessions/login')
 * @param init - Fetch options with optional retry flag
 * @returns Typed JSON response
 * @throws Error for non-2xx responses
 */
export async function api<T>(
  path: string,
  init?: RequestInit & { retry?: boolean }
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  console.log('🌐 [api] Making request...');
  console.log('🌐 [api] URL:', url);
  console.log('🌐 [api] Method:', init?.method || 'GET');
  console.log('🌐 [api] Headers:', JSON.stringify({
    'Content-Type': 'application/json',
    ...init?.headers,
  }, null, 2));
  
  if (init?.body) {
    console.log('🌐 [api] Request body:', init.body);
  }
  
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  
  console.log('📡 [api] Response status:', response.status, response.statusText);
  console.log('📡 [api] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
  
  // Handle rate limiting with exponential backoff
  if (response.status === 429 && init?.retry !== false) {
    const jitter = Math.random() * 400; // 0-400ms jitter
    const delay = 800 + jitter; // 800-1200ms total
    console.log('⏳ [api] Rate limited (429), retrying after', Math.round(delay), 'ms');
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry once with retry flag set to false
    return api<T>(path, { ...init, retry: false });
  }
  
  // Throw errors for non-2xx responses
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [api] Request failed:', response.status, errorText);
    throw new Error(`HTTP ${response.status}`);
  }
  
  // Return typed JSON response
  const jsonResponse = await response.json() as T;
  console.log('✅ [api] Response data:', JSON.stringify(jsonResponse, null, 2));
  
  return jsonResponse;
}
