const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  if (!SAFE_METHODS.has(method)) {
    headers.set('X-CSRF-Protection', '1');
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return result;
}
