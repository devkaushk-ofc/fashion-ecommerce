import { create } from 'zustand';
import api from '../utils/api';
import { toast } from 'react-toastify';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  // Get cart
  getCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: data.cart, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Get cart error:', error);
    }
  },

  // Add to cart
  addToCart: async (item) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/cart', item);
      set({ cart: data.cart, loading: false });
      toast.success('Item added to cart');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to add item');
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (itemId, quantity) => {
    set({ loading: true });
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      set({ cart: data.cart, loading: false });
      toast.success('Cart updated');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to update cart');
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    set({ loading: true });
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      set({ cart: data.cart, loading: false });
      toast.success('Item removed from cart');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to remove item');
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.delete('/cart');
      set({ cart: data.cart, loading: false });
      toast.success('Cart cleared');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to clear cart');
      throw error;
    }
  },

  // Get cart total
  getCartTotal: () => {
    const { cart } = get();
    return cart?.totalPrice || 0;
  },

  // Get cart items count
  getCartItemsCount: () => {
    const { cart } = get();
    return cart?.totalItems || 0;
  },
}));

export default useCartStore;

// Made with Bob
