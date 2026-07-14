/**
 * stores/useWishlistStore.test.js
 * Tests for the wishlist Zustand store.
 */
import { act } from '@testing-library/react';

jest.mock('../../utils/api');
import api from '../../utils/api';
import useWishlistStore from '../../store/useWishlistStore';

const resetStore = () => useWishlistStore.setState({ wishlistIds: [], loading: false });

describe('useWishlistStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  // ── fetchWishlist ─────────────────────────────────────────────────────
  describe('fetchWishlist', () => {
    it('sets wishlistIds from backend (object format)', async () => {
      api.get.mockResolvedValueOnce({
        data: { wishlist: [{ _id: 'p1' }, { _id: 'p2' }] },
      });
      await act(async () => { await useWishlistStore.getState().fetchWishlist(); });
      expect(useWishlistStore.getState().wishlistIds).toEqual(['p1', 'p2']);
    });

    it('sets wishlistIds from backend (string format)', async () => {
      api.get.mockResolvedValueOnce({
        data: { wishlist: ['p1', 'p2'] },
      });
      await act(async () => { await useWishlistStore.getState().fetchWishlist(); });
      expect(useWishlistStore.getState().wishlistIds).toEqual(['p1', 'p2']);
    });

    it('silently ignores errors', async () => {
      api.get.mockRejectedValueOnce(new Error('Unauthorized'));
      await act(async () => { await useWishlistStore.getState().fetchWishlist(); });
      expect(useWishlistStore.getState().wishlistIds).toEqual([]);
    });
  });

  // ── isWishlisted ──────────────────────────────────────────────────────
  describe('isWishlisted', () => {
    it('returns true when productId is in wishlistIds', () => {
      useWishlistStore.setState({ wishlistIds: ['p1', 'p2'] });
      expect(useWishlistStore.getState().isWishlisted('p1')).toBe(true);
    });

    it('returns false when productId is not in wishlistIds', () => {
      useWishlistStore.setState({ wishlistIds: ['p1'] });
      expect(useWishlistStore.getState().isWishlisted('p99')).toBe(false);
    });
  });

  // ── toggle ────────────────────────────────────────────────────────────
  describe('toggle', () => {
    it('adds productId optimistically when not yet wishlisted', async () => {
      api.post.mockResolvedValueOnce({});
      await act(async () => {
        await useWishlistStore.getState().toggle('p1', true);
      });
      expect(useWishlistStore.getState().wishlistIds).toContain('p1');
      expect(api.post).toHaveBeenCalledWith('/users/wishlist/p1');
    });

    it('removes productId optimistically when already wishlisted', async () => {
      useWishlistStore.setState({ wishlistIds: ['p1', 'p2'] });
      api.delete.mockResolvedValueOnce({});
      await act(async () => {
        await useWishlistStore.getState().toggle('p1', true);
      });
      expect(useWishlistStore.getState().wishlistIds).not.toContain('p1');
      expect(api.delete).toHaveBeenCalledWith('/users/wishlist/p1');
    });

    it('only updates local state when not authenticated (guest)', async () => {
      await act(async () => {
        await useWishlistStore.getState().toggle('p1', false);
      });
      expect(useWishlistStore.getState().wishlistIds).toContain('p1');
      expect(api.post).not.toHaveBeenCalled();
    });

    it('rolls back on API failure when adding', async () => {
      api.post.mockRejectedValueOnce(new Error('Server error'));
      await act(async () => {
        await useWishlistStore.getState().toggle('p1', true);
      });
      // Optimistic add then rollback removes it
      expect(useWishlistStore.getState().wishlistIds).not.toContain('p1');
    });

    it('rolls back on API failure when removing', async () => {
      useWishlistStore.setState({ wishlistIds: ['p1'] });
      api.delete.mockRejectedValueOnce(new Error('Server error'));
      await act(async () => {
        await useWishlistStore.getState().toggle('p1', true);
      });
      // Optimistic remove then rollback re-adds it
      expect(useWishlistStore.getState().wishlistIds).toContain('p1');
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────
  describe('clear', () => {
    it('empties wishlistIds', () => {
      useWishlistStore.setState({ wishlistIds: ['p1', 'p2'] });
      act(() => { useWishlistStore.getState().clear(); });
      expect(useWishlistStore.getState().wishlistIds).toEqual([]);
    });
  });
});
