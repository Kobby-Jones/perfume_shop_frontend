// lib/api/httpClient.ts

// const API_BASE_URL = 'https://scentia-api.onrender.com/api';
const API_BASE_URL = 'http://localhost:4000/api';

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

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  // Use Record<string, string> since we're dealing with plain key-value pairs
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Server error' }));

    if (response.status === 401 || response.status === 403) {
      removeToken();
    }

    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}
