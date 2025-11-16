// lib/api/httpClient.ts
// Combined: Retry handling + CSRF protection + secure token management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://scentia-api.onrender.com/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// --- CSRF Token Management (CRITICAL ADDITION) ---
const CSRF_TOKEN_KEY = 'csrfToken';

export function getCsrfToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(CSRF_TOKEN_KEY);
  }
  return null;
}

export function setCsrfToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
}

export function removeCsrfToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
}
// --- END CSRF Token Management ---

// --- Token Management ---
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
    removeCsrfToken(); // Clear CSRF token on logout
  }
}
// --- END Token Management ---

// --- Network Error Detection ---
function isNetworkError(error: any): boolean {
  return (
    !navigator.onLine ||
    error.message === 'Failed to fetch' ||
    error.message === 'Network request failed'
  );
}
// --- END Network Error Detection ---

// --- Retry with Exponential Backoff ---
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
// --- END Retry ---

// --- Custom API Error Class ---
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
// --- END Custom API Error ---

// --- Main Fetch Function ---
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();
  const csrfToken = getCsrfToken(); // Get CSRF token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach Authorization header if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // --- Add CSRF Header for Mutating Methods ---
  const method = options.method?.toUpperCase() || 'GET';
  const requiresCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (requiresCsrf && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  // --- END CSRF Header Logic ---

  const fetchFn = async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {};
    }

    const data = await response.json().catch(() => ({ message: 'Server error' }));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        removeToken();

        // Redirect to login if on a protected page
        if (
          typeof window !== 'undefined' &&
          (window.location.pathname.startsWith('/account') ||
            window.location.pathname.startsWith('/admin'))
        ) {
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

  return retryWithBackoff(fetchFn);
}
// --- END Main Fetch ---

// --- Helper for File Uploads ---
export async function apiUpload(
  endpoint: string,
  formData: FormData
): Promise<any> {
  const token = getToken();
  const csrfToken = getCsrfToken(); // Include CSRF for uploads too

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
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
// --- END Upload Helper ---
