import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import { toast } from 'react-toastify';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // Register
      register: async (userData) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          localStorage.setItem('token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });
          toast.success('Registration successful!');
          return data;
        } catch (error) {
          set({ loading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      // Login
      login: async (credentials) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', credentials);
          localStorage.setItem('token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });
          toast.success('Login successful!');
          return data;
        } catch (error) {
          set({ loading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.get('/auth/logout');
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          toast.success('Logged out successfully');
        } catch (error) {
          toast.error('Logout failed');
        }
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({
            user: data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('token');
        }
      },

      // Update user details
      updateUser: async (userData) => {
        try {
          const { data } = await api.put('/auth/updatedetails', userData);
          set({ user: data.user });
          toast.success('Profile updated successfully');
          return data;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Update failed');
          throw error;
        }
      },

      // Update password
      updatePassword: async (passwords) => {
        try {
          const { data } = await api.put('/auth/updatepassword', passwords);
          toast.success('Password updated successfully');
          return data;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Password update failed');
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

// Made with Bob
