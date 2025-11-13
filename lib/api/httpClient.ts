// lib/api/httpClient.ts - Enhanced with retry and better error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Token management
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// Network error detection
function isNetworkError(error: any): boolean {
  return (
    !navigator.onLine ||
    error.message === 'Failed to fetch' ||
    error.message === 'Network request failed'
  );
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !isNetworkError(error)) {
      throw error;
    }
    
    await new Promise(resolve => 
      setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))
    );
    
    return retryWithBackoff(fn, retries - 1);
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Main fetch function
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchFn = async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle no content responses
    if (response.status === 204) {
      return {};
    }

    // Parse response
    const data = await response.json().catch(() => ({ message: 'Server error' }));

    // Handle errors
    if (!response.ok) {
      // Auto-logout on auth failures
      if (response.status === 401 || response.status === 403) {
        removeToken();
        
        // Redirect to login if on a protected page
        if (typeof window !== 'undefined' && 
            (window.location.pathname.startsWith('/account') ||
             window.location.pathname.startsWith('/admin'))) {
          window.location.href = '/account/auth/login';
        }
      }

      throw new ApiError(
        data.message || `API Error: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data;
  };

  // Retry on network errors
  return retryWithBackoff(fetchFn);
}

// Helper for file uploads
export async function apiUpload(
  endpoint: string,
  formData: FormData
): Promise<any> {
  const token = getToken();
  
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new ApiError(error.message, response.status, error);
  }

  return response.json();
}