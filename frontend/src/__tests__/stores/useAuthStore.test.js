/**
 * stores/useAuthStore.test.js
 * Tests for the authentication Zustand store.
 */
import { act } from '@testing-library/react';
import { toast } from 'react-toastify';

// Mock the api module
jest.mock('../../utils/api');
import api from '../../utils/api';

// Import store AFTER mock so it picks up the mocked api
import useAuthStore from '../../store/useAuthStore';

// Helper: reset zustand store state between tests
const resetStore = () =>
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  });

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetStore();
  });

  // ── login ──────────────────────────────────────────────────────────────
  describe('login', () => {
    it('sets user, token and isAuthenticated on success', async () => {
      const mockData = { user: { name: 'Alice', role: 'user' }, token: 'tok123' };
      api.post.mockResolvedValueOnce({ data: mockData });

      await act(async () => {
        await useAuthStore.getState().login({ email: 'a@a.com', password: 'pass123' });
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockData.user);
      expect(state.token).toBe('tok123');
      expect(localStorage.getItem('token')).toBe('tok123');
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });

    it('sets loading to false and throws on failure', async () => {
      const error = { response: { data: { message: 'Invalid credentials' } } };
      api.post.mockRejectedValueOnce(error);

      await expect(
        act(async () => { await useAuthStore.getState().login({ email: 'a@a.com', password: 'wrong' }); })
      ).rejects.toEqual(error);

      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('shows fallback error when response has no message', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'));
      await expect(act(async () => {
        await useAuthStore.getState().login({ email: 'a@a.com', password: 'pass' });
      })).rejects.toThrow();
      expect(toast.error).toHaveBeenCalledWith('Login failed');
    });
  });

  // ── register ───────────────────────────────────────────────────────────
  describe('register', () => {
    it('sets user and token on successful registration', async () => {
      const mockData = { user: { name: 'Bob', role: 'user' }, token: 'newTok' };
      api.post.mockResolvedValueOnce({ data: mockData });

      await act(async () => {
        await useAuthStore.getState().register({ name: 'Bob', email: 'b@b.com', password: 'pass123' });
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('newTok');
      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
    });

    it('rejects and toasts on registration failure', async () => {
      const error = { response: { data: { message: 'Email taken' } } };
      api.post.mockRejectedValueOnce(error);

      await expect(act(async () => {
        await useAuthStore.getState().register({ name: 'Bob', email: 'b@b.com', password: 'pass123' });
      })).rejects.toEqual(error);

      expect(toast.error).toHaveBeenCalledWith('Email taken');
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears user state and token from localStorage on success', async () => {
      useAuthStore.setState({ user: { name: 'Alice' }, token: 'tok', isAuthenticated: true });
      localStorage.setItem('token', 'tok');
      api.get.mockResolvedValueOnce({ data: {} });

      await act(async () => { await useAuthStore.getState().logout(); });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    });

    it('toasts error when logout API call fails', async () => {
      api.get.mockRejectedValueOnce(new Error('Network'));
      await act(async () => { await useAuthStore.getState().logout(); });
      expect(toast.error).toHaveBeenCalledWith('Logout failed');
    });
  });

  // ── getCurrentUser ─────────────────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('populates user state on success', async () => {
      api.get.mockResolvedValueOnce({ data: { user: { name: 'Alice' } } });

      await act(async () => { await useAuthStore.getState().getCurrentUser(); });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual({ name: 'Alice' });
    });

    it('clears auth state when request fails', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { name: 'Alice' }, token: 'tok' });
      localStorage.setItem('token', 'tok');
      api.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await act(async () => { await useAuthStore.getState().getCurrentUser(); });

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────
  describe('updateUser', () => {
    it('updates user in state on success', async () => {
      const updated = { name: 'Alice Updated', email: 'a@a.com' };
      api.put.mockResolvedValueOnce({ data: { user: updated } });

      await act(async () => { await useAuthStore.getState().updateUser(updated); });

      expect(useAuthStore.getState().user).toEqual(updated);
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    });

    it('toasts error on update failure', async () => {
      const error = { response: { data: { message: 'Forbidden' } } };
      api.put.mockRejectedValueOnce(error);

      await expect(act(async () => {
        await useAuthStore.getState().updateUser({});
      })).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith('Forbidden');
    });
  });

  // ── updatePassword ─────────────────────────────────────────────────────
  describe('updatePassword', () => {
    it('toasts success on password update', async () => {
      api.put.mockResolvedValueOnce({ data: {} });
      await act(async () => {
        await useAuthStore.getState().updatePassword({ currentPassword: 'old', newPassword: 'new123' });
      });
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully');
    });

    it('toasts error and throws on failure', async () => {
      const error = { response: { data: { message: 'Wrong password' } } };
      api.put.mockRejectedValueOnce(error);
      await expect(act(async () => {
        await useAuthStore.getState().updatePassword({ currentPassword: 'wrong', newPassword: 'new' });
      })).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith('Wrong password');
    });
  });
});
