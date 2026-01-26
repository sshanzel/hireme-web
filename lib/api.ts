import {API_URL} from './config';

/**
 * Zod-style field errors from the API
 */
export interface FieldErrors {
  [field: string]: string[];
}

export interface ZodErrorResponse {
  formErrors: string[];
  fieldErrors: FieldErrors;
}

/**
 * Custom API error that can hold field-level validation errors
 */
export class ApiError extends Error {
  fieldErrors?: FieldErrors;
  formErrors?: string[];

  constructor(message: string, fieldErrors?: FieldErrors, formErrors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
    this.formErrors = formErrors;
  }

  hasFieldErrors(): boolean {
    return !!this.fieldErrors && Object.keys(this.fieldErrors).length > 0;
  }
}

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
  story: (storyId: string) => `/stories/${storyId}`,
  cvUpload: '/cv/upload',
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
      throw new ApiError(text || `Request failed with status ${response.status}`);
    }

    // Handle Zod validation errors
    const error = data.error as ZodErrorResponse | string | undefined;
    if (error && typeof error === 'object' && 'fieldErrors' in error) {
      const firstFieldError = Object.values(error.fieldErrors)[0]?.[0];
      const firstFormError = error.formErrors[0];
      const message = firstFieldError || firstFormError || 'Validation failed';
      throw new ApiError(message, error.fieldErrors, error.formErrors);
    }

    throw new ApiError(
      (error as string) || (data.message as string) || 'Request failed',
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

/**
 * Upload wrapper for file uploads using FormData
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options?: Omit<RequestInit, 'body' | 'method'>,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(text || `Request failed with status ${response.status}`);
    }

    // Handle Zod validation errors
    const error = data.error as ZodErrorResponse | string | undefined;
    if (error && typeof error === 'object' && 'fieldErrors' in error) {
      const firstFieldError = Object.values(error.fieldErrors)[0]?.[0];
      const firstFormError = error.formErrors[0];
      const message = firstFieldError || firstFormError || 'Validation failed';
      throw new ApiError(message, error.fieldErrors, error.formErrors);
    }

    throw new ApiError(
      (error as string) || (data.message as string) || 'Upload failed',
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
