import { isAxiosError } from 'axios';

// Extracts the human-readable message the API puts in error responses
// (`message` as a string or a list of validation messages), falling back to a
// caller-supplied French sentence.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message) && message.length > 0) return message.join('\n');
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
