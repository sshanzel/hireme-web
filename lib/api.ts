import {API_URL} from './config';

/**
 * API endpoints
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  profile: '/profile',
  publicProfile: (identifier: string) => `/profile/public/${identifier}`,
  coachings: '/coachings',
  coaching: (id: string) => `/coachings/${id}`,
  experiences: '/experiences',
  experience: (id: string) => `/experiences/${id}`,
  storyExperience: (storyId: string) => `/stories/${storyId}/experience`,
};

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Fetch wrapper that prefixes API_URL and handles common options
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const {body, headers, ...rest} = options || {};

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: body
      ? {'Content-Type': 'application/json', ...headers}
      : headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    throw new Error(
      (data.error as string) || (data.message as string) || 'Request failed',
    );
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Fetch that returns null on error instead of throwing (useful for auth checks)
 */
export async function apiFetchSafe<T>(
  endpoint: string,
  options?: ApiFetchOptions,
): Promise<T | null> {
  try {
    return await apiFetch<T>(endpoint, options);
  } catch {
    return null;
  }
}
