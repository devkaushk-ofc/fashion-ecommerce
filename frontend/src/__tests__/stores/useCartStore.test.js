/**
 * stores/useCartStore.test.js
 * Tests for the cart Zustand store.
 */
import { act } from '@testing-library/react';
import { toast } from 'react-toastify';

jest.mock('../../utils/api');
import api from '../../utils/api';
import useCartStore from '../../store/useCartStore';

const resetStore = () => useCartStore.setState({ cart: null, loading: false });

const mockCart = {
  items: [
    { _id: 'item1', product: { _id: 'p1', name: 'Shirt', price: 500 }, price: 400, quantity: 2, size: 'M' },
  ],
  totalPrice: 800,
  totalItems: 2,
};

describe('useCartStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  // ── getCart ──────────────────────────────────────────────────────────
  describe('getCart', () => {
    it('sets cart state on success', async () => {
      api.get.mockResolvedValueOnce({ data: { cart: mockCart } });
      await act(async () => { await useCartStore.getState().getCart(); });
      expect(useCartStore.getState().cart).toEqual(mockCart);
      expect(useCartStore.getState().loading).toBe(false);
    });

    it('sets loading false on failure', async () => {
      api.get.mockRejectedValueOnce(new Error('Network'));
      await act(async () => { await useCartStore.getState().getCart(); });
      expect(useCartStore.getState().loading).toBe(false);
    });
  });

  // ── addToCart ────────────────────────────────────────────────────────
  describe('addToCart', () => {
    it('updates cart and toasts success on add', async () => {
      api.post.mockResolvedValueOnce({ data: { cart: mockCart } });
      await act(async () => {
        await useCartStore.getState().addToCart({ productId: 'p1', quantity: 1, size: 'M' });
      });
      expect(useCartStore.getState().cart).toEqual(mockCart);
      expect(toast.success).toHaveBeenCalledWith('Item added to cart');
    });

    it('toasts error and throws on failure', async () => {
      const error = { response: { data: { message: 'Out of stock' } } };
      api.post.mockRejectedValueOnce(error);
      await expect(act(async () => {
        await useCartStore.getState().addToCart({ productId: 'p1', quantity: 1 });
      })).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith('Out of stock');
    });

    it('shows fallback error message when response has no message', async () => {
      api.post.mockRejectedValueOnce(new Error('Network'));
      await expect(act(async () => {
        await useCartStore.getState().addToCart({ productId: 'p1', quantity: 1 });
      })).rejects.toThrow();
      expect(toast.error).toHaveBeenCalledWith('Failed to add item');
    });
  });

  // ── updateCartItem ───────────────────────────────────────────────────
  describe('updateCartItem', () => {
    it('updates cart quantity and toasts', async () => {
      api.put.mockResolvedValueOnce({ data: { cart: mockCart } });
      await act(async () => {
        await useCartStore.getState().updateCartItem('item1', 3);
      });
      expect(toast.success).toHaveBeenCalledWith('Cart updated');
    });

    it('toasts error and throws on failure', async () => {
      api.put.mockRejectedValueOnce({ response: { data: { message: 'Error' } } });
      await expect(act(async () => {
        await useCartStore.getState().updateCartItem('item1', 3);
      })).rejects.toBeTruthy();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── removeFromCart ───────────────────────────────────────────────────
  describe('removeFromCart', () => {
    it('removes item and toasts success', async () => {
      const emptyCart = { items: [], totalPrice: 0, totalItems: 0 };
      api.delete.mockResolvedValueOnce({ data: { cart: emptyCart } });
      await act(async () => { await useCartStore.getState().removeFromCart('item1'); });
      expect(useCartStore.getState().cart).toEqual(emptyCart);
      expect(toast.success).toHaveBeenCalledWith('Item removed from cart');
    });

    it('toasts error and throws on failure', async () => {
      api.delete.mockRejectedValueOnce({ response: { data: { message: 'Not found' } } });
      await expect(act(async () => {
        await useCartStore.getState().removeFromCart('item1');
      })).rejects.toBeTruthy();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ── clearCart ────────────────────────────────────────────────────────
  describe('clearCart', () => {
    it('clears cart and toasts', async () => {
      api.delete.mockResolvedValueOnce({ data: { cart: { items: [] } } });
      await act(async () => { await useCartStore.getState().clearCart(); });
      expect(toast.success).toHaveBeenCalledWith('Cart cleared');
    });
  });

  // ── derived selectors ────────────────────────────────────────────────
  describe('getCartTotal / getCartItemsCount', () => {
    it('returns 0 when cart is null', () => {
      expect(useCartStore.getState().getCartTotal()).toBe(0);
      expect(useCartStore.getState().getCartItemsCount()).toBe(0);
    });

    it('returns totalPrice from cart', () => {
      useCartStore.setState({ cart: { totalPrice: 1500, totalItems: 3 } });
      expect(useCartStore.getState().getCartTotal()).toBe(1500);
      expect(useCartStore.getState().getCartItemsCount()).toBe(3);
    });
  });
});
