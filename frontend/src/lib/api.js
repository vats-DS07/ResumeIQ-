const BASE_URL = 'http://127.0.0.1:8000';

export class APIError extends Error {
  constructor(status, statusText, data) {
    super(data?.detail || statusText || 'API Request failed');
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

let refreshPromise = null;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = { ...options.headers };
  if (options.body && options.body instanceof FormData) {
    // Let browser automatically set Content-Type with boundary for FormData
  } else {
    headers['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    credentials: 'include',
    headers,
    ...options,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    defaultOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, defaultOptions);
  } catch (error) {
    throw new APIError(0, 'Network Error', { detail: error.message || 'Network connection failed' });
  }

  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  // Automatic 401 handling
  if (response.status === 401 && !options._retry && endpoint !== '/api/auth/refresh') {
    options._retry = true;
    
    if (!refreshPromise) {
      refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).then(async (res) => {
        refreshPromise = null;
        if (!res.ok) {
          throw new Error('Refresh failed');
        }
        return res.json();
      }).catch((err) => {
        refreshPromise = null;
        throw err;
      });
    }

    try {
      await refreshPromise;
      // Retry original request once
      return await request(endpoint, options);
    } catch (refreshError) {
      // If refresh fails, check if we are on a public route before redirecting to login
      if (typeof window !== 'undefined') {
        const publicPaths = ['/', '/login', '/signup'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      throw new APIError(response.status, response.statusText, { detail: 'Session expired. Please log in again.' });
    }
  }

  // Parse error details
  let errorData;
  try {
    errorData = await response.json();
  } catch (_) {
    try {
      errorData = { detail: await response.text() };
    } catch (_) {
      errorData = { detail: 'Unknown error occurred' };
    }
  }

  throw new APIError(response.status, response.statusText, errorData);
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
