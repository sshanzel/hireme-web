import type {UseFormSetError, FieldValues, Path} from 'react-hook-form';
import {ApiError} from './api';

/**
 * Apply API field errors to a react-hook-form instance
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiError) || !error.hasFieldErrors()) {
    return false;
  }

  for (const [field, messages] of Object.entries(error.fieldErrors!)) {
    if (messages.length > 0) {
      setError(field as Path<T>, {
        type: 'server',
        message: messages[0],
      });
    }
  }

  return true;
}
