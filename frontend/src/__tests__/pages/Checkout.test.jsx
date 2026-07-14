/**
 * pages/Checkout.test.jsx
 * Tests for the Checkout page: unauthenticated, empty cart, form validation,
 * payment method selection, and order placement.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Checkout from '../../pages/Checkout';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

jest.mock('../../store/useCartStore');
jest.mock('../../store/useAuthStore');

// Mock api for the POST /orders call
jest.mock('../../utils/api');
import api from '../../utils/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const ITEMS = [
  {
    _id: 'item1',
    product: { _id: 'p1', name: 'Shirt', images: [] },
    price: 800,
    quantity: 1,
    size: 'M',
    color: 'Red',
  },
];

const renderCheckout = ({
  isAuthenticated = true,
  items = ITEMS,
  cartLoading = false,
  getCart = jest.fn(),
} = {}) => {
  useAuthStore.mockReturnValue({ isAuthenticated, user: { name: 'Test User' } });
  useCartStore.mockReturnValue({
    cart: { items },
    loading: cartLoading,
    getCart,
  });
  return render(<MemoryRouter><Checkout /></MemoryRouter>);
};

// Helper: fill all required address fields
const fillAddress = async (user) => {
  const [fullName, phone, street, city, state, zip, country] = [
    'full_name', 'phone', 'street', 'city', 'state', 'zip', 'country',
  ].map((n) => screen.getByLabelText(new RegExp(n, 'i')));

  await user.type(fullName, 'Priya Sharma');
  await user.type(phone,    '9876543210');
  await user.type(street,   '12 Baker Street');
  await user.type(city,     'Mumbai');
  await user.type(state,    'Maharashtra');
  await user.type(zip,      '400001');
  await user.clear(country);
  await user.type(country,  'India');
};

describe('Checkout page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockResolvedValue({ data: { order: { _id: 'order123' } } });
  });

  // ── Unauthenticated ──────────────────────────────────────────────────
  describe('unauthenticated', () => {
    it('shows login prompt when not authenticated', () => {
      renderCheckout({ isAuthenticated: false });
      expect(screen.getByText(/login_required/i)).toBeInTheDocument();
    });
  });

  // ── Empty cart ───────────────────────────────────────────────────────
  describe('empty cart', () => {
    it('shows empty cart message when no items', () => {
      renderCheckout({ items: [] });
      expect(screen.getByText(/cart_empty$/i)).toBeInTheDocument();
    });

    it('shows Shop Now link', () => {
      renderCheckout({ items: [] });
      expect(screen.getByRole('link', { name: /shop_now/i })).toBeInTheDocument();
    });
  });

  // ── Rendering ────────────────────────────────────────────────────────
  describe('rendering with items', () => {
    it('renders checkout heading', () => {
      renderCheckout();
      expect(screen.getByRole('heading', { name: /^title$/i })).toBeInTheDocument();
    });

    it('renders delivery address section', () => {
      renderCheckout();
      expect(screen.getByText(/delivery_address/i)).toBeInTheDocument();
    });

    it('renders payment method section', () => {
      renderCheckout();
      expect(screen.getByText(/payment_method/i)).toBeInTheDocument();
    });

    it('renders four payment options', () => {
      renderCheckout();
      expect(screen.getAllByRole('radio').length).toBe(4);
    });

    it('COD is selected by default', () => {
      renderCheckout();
      expect(screen.getByDisplayValue('COD')).toBeChecked();
    });

    it('renders order summary section', () => {
      renderCheckout();
      expect(screen.getByText(/order_summary/i)).toBeInTheDocument();
    });

    it('renders Place Order button', () => {
      renderCheckout();
      expect(screen.getByRole('button', { name: /place_label/i })).toBeInTheDocument();
    });

    it('renders secure checkout note', () => {
      renderCheckout();
      expect(screen.getByText(/secure/i)).toBeInTheDocument();
    });
  });

  // ── Payment method selection ──────────────────────────────────────────
  describe('payment method', () => {
    it('allows selecting Card payment', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await user.click(screen.getByDisplayValue('Card'));
      expect(screen.getByDisplayValue('Card')).toBeChecked();
    });

    it('allows selecting UPI payment', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await user.click(screen.getByDisplayValue('UPI'));
      expect(screen.getByDisplayValue('UPI')).toBeChecked();
    });
  });

  // ── Form validation ──────────────────────────────────────────────────
  describe('validation on submit', () => {
    it('shows validation errors when form is empty and submitted', async () => {
      const user = userEvent.setup();
      renderCheckout();
      // Clear the pre-filled country value first
      await user.clear(screen.getByLabelText(/country/i));
      await user.click(screen.getByRole('button', { name: /place_label/i }));
      await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });

    it('shows phone error for non-10-digit phone number', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await user.type(screen.getByLabelText(/full_name/i), 'Priya Sharma');
      await user.type(screen.getByLabelText(/phone/i), '123'); // invalid
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('clears individual field error when user types a valid value', async () => {
      const user = userEvent.setup();
      renderCheckout();
      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '123');
      await user.tab();
      await screen.findByRole('alert');
      await user.clear(phoneInput);
      await user.type(phoneInput, '9876543210');
      await waitFor(() =>
        expect(screen.queryAllByRole('alert').filter((el) => el.textContent.match(/phone/i))).toHaveLength(0)
      );
    });
  });

  // ── Order placement ──────────────────────────────────────────────────
  describe('order placement', () => {
    it('calls POST /orders with correct payload on valid submit', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await fillAddress(user);
      await user.click(screen.getByRole('button', { name: /place_label/i }));
      await waitFor(() =>
        expect(api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
          paymentMethod: 'COD',
          totalPrice: expect.any(Number),
        }))
      );
    });

    it('navigates to the order detail page after success', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await fillAddress(user);
      await user.click(screen.getByRole('button', { name: /place_label/i }));
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/orders/order123')
      );
    });

    it('shows toast success on order success', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await fillAddress(user);
      await user.click(screen.getByRole('button', { name: /place_label/i }));
      await waitFor(() => expect(toast.success).toHaveBeenCalled());
    });

    it('shows toast error when POST /orders fails', async () => {
      api.post.mockRejectedValueOnce({ response: { data: { message: 'Payment failed' } } });
      const user = userEvent.setup();
      renderCheckout();
      await fillAddress(user);
      await user.click(screen.getByRole('button', { name: /place_label/i }));
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Payment failed'));
    });

    it('disables Place Order button while placing', () => {
      renderCheckout({ cartLoading: true });
      expect(screen.getByRole('button', { name: /place_label/i })).toBeDisabled();
    });
  });
});
