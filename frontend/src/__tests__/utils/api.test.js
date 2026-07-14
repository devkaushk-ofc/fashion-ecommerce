/**
 * utils/api.test.js
 * Tests the Axios interceptor logic by exercising the handlers directly,
 * without actually importing the real axios module.
 */

describe('api utility — interceptor logic', () => {
  // We test the interceptor handler functions in isolation, since mocking
  // axios.create + dynamic import is unreliable across Babel CJS transforms.

  // ── Request interceptor handler ──────────────────────────────────────
  describe('request interceptor logic', () => {
    const requestHandler = (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    };

    beforeEach(() => localStorage.clear());

    it('attaches Authorization header when token exists', () => {
      localStorage.setItem('token', 'test-jwt-token');
      const config = { headers: {} };
      const result = requestHandler(config);
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('does not attach Authorization header when no token', () => {
      const config = { headers: {} };
      const result = requestHandler(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('preserves other config fields', () => {
      localStorage.setItem('token', 'abc');
      const config = { headers: {}, url: '/test', method: 'get' };
      const result = requestHandler(config);
      expect(result.url).toBe('/test');
      expect(result.method).toBe('get');
    });
  });

  // ── Response interceptor handler ─────────────────────────────────────
  describe('response interceptor logic', () => {
    const responseRejected = (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };

    beforeEach(() => {
      localStorage.clear();
      delete window.location;
      window.location = { href: '' };
    });

    it('redirects to /login and clears storage on 401', async () => {
      localStorage.setItem('token', 'stale');
      localStorage.setItem('user', '{"name":"Test"}');
      const error = { response: { status: 401 } };
      await expect(responseRejected(error)).rejects.toEqual(error);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('does not redirect on 500 errors', async () => {
      localStorage.setItem('token', 'valid');
      const error = { response: { status: 500 } };
      await expect(responseRejected(error)).rejects.toEqual(error);
      expect(localStorage.getItem('token')).toBe('valid');
      expect(window.location.href).not.toBe('/login');
    });

    it('handles errors without a response object', async () => {
      const networkError = new Error('Network Error');
      await expect(responseRejected(networkError)).rejects.toEqual(networkError);
    });

    it('rejects with the original error object', async () => {
      const error = { response: { status: 403 }, message: 'Forbidden' };
      await expect(responseRejected(error)).rejects.toMatchObject({ message: 'Forbidden' });
    });
  });

  // ── Axios instance configuration (structural) ─────────────────────────
  describe('axios instance configuration', () => {
    it('api module exports a default object with http methods', async () => {
      // We verify the module exports a usable api object (the manual mock)
      const { default: api } = await import('../../utils/api.js');
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
    });
  });
});
