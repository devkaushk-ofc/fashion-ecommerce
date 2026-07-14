import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // ids stored locally for instant UI feedback; synced with backend when logged in
      wishlistIds: [],
      loading: false,

      // Load wishlist from backend (call after login)
      fetchWishlist: async () => {
        try {
          const { data } = await api.get('/users/wishlist');
          const ids = (data.wishlist || []).map((p) =>
            typeof p === 'object' ? p._id : p
          );
          set({ wishlistIds: ids });
        } catch {
          // silently ignore — offline or unauthenticated
        }
      },

      isWishlisted: (productId) => get().wishlistIds.includes(productId),

      toggle: async (productId, isAuthenticated) => {
        const already = get().wishlistIds.includes(productId);

        // Optimistic update
        set((state) => ({
          wishlistIds: already
            ? state.wishlistIds.filter((id) => id !== productId)
            : [...state.wishlistIds, productId],
        }));

        if (!isAuthenticated) return; // guest: local-only

        try {
          if (already) {
            await api.delete(`/users/wishlist/${productId}`);
          } else {
            await api.post(`/users/wishlist/${productId}`);
          }
        } catch {
          // rollback on failure
          set((state) => ({
            wishlistIds: already
              ? [...state.wishlistIds, productId]
              : state.wishlistIds.filter((id) => id !== productId),
          }));
        }
      },

      clear: () => set({ wishlistIds: [] }),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ wishlistIds: state.wishlistIds }),
    }
  )
);

export default useWishlistStore;

// Made with Bob
