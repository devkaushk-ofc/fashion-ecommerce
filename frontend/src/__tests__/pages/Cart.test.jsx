/**
 * pages/Cart.test.jsx
 * Tests for the Cart page: unauthenticated state, empty cart, item display,
 * quantity controls, removal, and order summary.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../pages/Cart';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

jest.mock('../../store/useCartStore');
jest.mock('../../store/useAuthStore');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const ITEM = {
  _id: 'item1',
  product: { _id: 'p1', name: 'Cool Shirt', brand: 'BrandX', images: [], price: 600, stock: 10 },
  price: 500,
  quantity: 2,
  size: 'M',
  color: 'Blue',
};

const renderCart = ({
  isAuthenticated = true,
  items = [],
  loading = false,
  getCart = jest.fn(),
  updateCartItem = jest.fn(),
  removeFromCart = jest.fn(),
} = {}) => {
  useAuthStore.mockReturnValue({ isAuthenticated });
  useCartStore.mockReturnValue({
    cart: { items },
    loading,
    getCart,
    updateCartItem,
    removeFromCart,
  });
  return render(<MemoryRouter><Cart /></MemoryRouter>);
};

describe('Cart page', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Unauthenticated ──────────────────────────────────────────────────
  describe('unauthenticated user', () => {
    it('shows login prompt when not authenticated', () => {
      renderCart({ isAuthenticated: false, items: [] });
      expect(screen.getByText(/login_required/i)).toBeInTheDocument();
    });

    it('shows login button linking to /login', () => {
      renderCart({ isAuthenticated: false, items: [] });
      expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    });
  });

  // ── Loading state ────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows spinner when loading and cart is null', () => {
      useAuthStore.mockReturnValue({ isAuthenticated: true });
      useCartStore.mockReturnValue({
        cart: null, loading: true,
        getCart: jest.fn(), updateCartItem: jest.fn(), removeFromCart: jest.fn(),
      });
      render(<MemoryRouter><Cart /></MemoryRouter>);
      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });
  });

  // ── Empty cart ───────────────────────────────────────────────────────
  describe('empty cart', () => {
    it('shows empty state message', () => {
      renderCart({ items: [] });
      expect(screen.getByText(/^empty$/i)).toBeInTheDocument();
    });

    it('shows Continue Shopping link', () => {
      renderCart({ items: [] });
      expect(screen.getByRole('link', { name: /continue_shopping/i })).toBeInTheDocument();
    });
  });

  // ── Cart with items ──────────────────────────────────────────────────
  describe('cart with items', () => {
    it('renders product name and brand', () => {
      renderCart({ items: [ITEM] });
      expect(screen.getByText('Cool Shirt')).toBeInTheDocument();
      expect(screen.getByText('BrandX')).toBeInTheDocument();
    });

    it('renders size and color meta spans', () => {
      renderCart({ items: [ITEM] });
      // i18n returns the key "size" and "color" — check spans are rendered
      expect(screen.getAllByText('size').length).toBeGreaterThan(0);
      expect(screen.getAllByText('color').length).toBeGreaterThan(0);
    });

    it('renders current quantity', () => {
      renderCart({ items: [ITEM] });
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders order summary with price details', () => {
      renderCart({ items: [ITEM] });
      expect(screen.getByText(/price_details/i)).toBeInTheDocument();
    });

    it('renders Place Order button', () => {
      renderCart({ items: [ITEM] });
      // Button aria-label is "checkout_label" (i18n key), text is "place_order"
      expect(screen.getByRole('button', { name: /checkout_label/i })).toBeInTheDocument();
    });

    it('shows discount row when item has lower price than original', () => {
      renderCart({ items: [ITEM] }); // price 500 < product.price 600
      expect(screen.getByText(/savings/i)).toBeInTheDocument();
    });
  });

  // ── Quantity controls ─────────────────────────────────────────────────
  describe('quantity stepper', () => {
    it('decrease button is disabled at quantity 1', () => {
      const singleItem = { ...ITEM, quantity: 1 };
      renderCart({ items: [singleItem] });
      expect(screen.getByRole('button', { name: /decrease_qty/i })).toBeDisabled();
    });

    it('calls updateCartItem when increase is clicked', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      renderCart({ items: [ITEM], updateCartItem: mockUpdate });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /increase_qty/i }));
      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith('item1', 3)
      );
    });

    it('calls updateCartItem when decrease is clicked', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      renderCart({ items: [ITEM], updateCartItem: mockUpdate });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /decrease_qty/i }));
      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith('item1', 1)
      );
    });
  });

  // ── Remove from cart ─────────────────────────────────────────────────
  describe('remove item', () => {
    it('calls removeFromCart when trash button is clicked', async () => {
      const mockRemove = jest.fn().mockResolvedValue({});
      renderCart({ items: [ITEM], removeFromCart: mockRemove });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /remove/i }));
      await waitFor(() =>
        expect(mockRemove).toHaveBeenCalledWith('item1')
      );
    });
  });

  // ── Checkout navigation ───────────────────────────────────────────────
  describe('checkout button', () => {
    it('navigates to /checkout when Place Order is clicked', async () => {
      renderCart({ items: [ITEM] });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /checkout_label/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/checkout'));
    });
  });
});
