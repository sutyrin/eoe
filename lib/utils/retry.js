import { backOff } from 'exponential-backoff';

/**
 * Execute a function with exponential backoff retry logic.
 * Retries on network/server errors only -- NOT on auth failures (401/403).
 *
 * @param {function} fn - Async function to execute
 * @param {object} options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.startingDelay - Initial delay in ms (default: 500)
 * @param {function} options.onRetry - Callback on retry (error, attemptNumber)
 * @returns {Promise<any>} Result of fn()
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    startingDelay = 500,
    onRetry
  } = options;

  return backOff(fn, {
    numOfAttempts: maxRetries,
    startingDelay,
    timeMultiple: 2,
    maxDelay: 8000,
    retry: (error, attemptNumber) => {
      // Never retry auth errors
      const status = error.response?.status || error.code;
      if (status === 401 || status === 403) {
        return false;
      }

      // Retry on network errors and server errors
      const retryable =
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ECONNREFUSED' ||
        (error.response && error.response.status >= 500);

      if (retryable && onRetry) {
        onRetry(error, attemptNumber);
      }

      return retryable;
    }
  });
}

/**
 * Check if an error is an authentication error (not retryable).
 * @param {Error} error
 * @returns {boolean}
 */
export function isAuthError(error) {
  const status = error.response?.status || error.code;
  return status === 401 || status === 403;
}
