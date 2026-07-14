/**
 * pages/Login.test.jsx
 * Tests for the Login page: rendering, validation, submission, error handling.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import useAuthStore from '../../store/useAuthStore';

jest.mock('../../store/useAuthStore');

// Capture the navigate mock so we can assert redirects
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = (overrides = {}) => {
  useAuthStore.mockReturnValue({
    loading: false,
    login: jest.fn().mockResolvedValue({}),
    ...overrides,
  });
  return render(<MemoryRouter><Login /></MemoryRouter>);
};

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders welcome heading', () => {
      renderLogin();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders email and password fields', () => {
      renderLogin();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderLogin();
      expect(screen.getByRole('button', { name: /sign_in/i })).toBeInTheDocument();
    });

    it('renders link to register page', () => {
      renderLogin();
      expect(screen.getByRole('link', { name: /create_one/i })).toBeInTheDocument();
    });
  });

  // ── Password visibility toggle ───────────────────────────────────────
  describe('password visibility toggle', () => {
    it('password field is hidden by default', () => {
      renderLogin();
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('toggles password to text when eye button is clicked', async () => {
      const user = userEvent.setup();
      renderLogin();
      const toggle = screen.getByRole('button', { name: /show_password/i });
      await user.click(toggle);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'text');
    });

    it('toggles password back to hidden on second click', async () => {
      const user = userEvent.setup();
      renderLogin();
      const toggle = screen.getByRole('button', { name: /show_password/i });
      await user.click(toggle);
      await user.click(screen.getByRole('button', { name: /hide_password/i }));
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
  });

  // ── Field validation ─────────────────────────────────────────────────
  describe('field validation', () => {
    it('shows email_required error when email is empty on blur', async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.click(screen.getByLabelText(/email/i));
      await user.tab(); // blur
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows email_invalid error for malformed email', async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.type(screen.getByLabelText(/email/i), 'not-an-email');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows password_required error when password is empty on blur', async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.click(screen.getByLabelText(/password/i));
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows password_min error for passwords shorter than 6 chars', async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.type(screen.getByLabelText(/password/i), 'ab');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('blocks submission when form has errors', async () => {
      const mockLogin = jest.fn();
      renderLogin({ login: mockLogin });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /sign_in/i }));
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('clears error as user corrects a touched field', async () => {
      const user = userEvent.setup();
      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();
      await screen.findByRole('alert');
      await user.type(emailInput, 'valid@email.com');
      await waitFor(() => expect(screen.queryAllByRole('alert').length).toBeLessThanOrEqual(0));
    });
  });

  // ── Submission ───────────────────────────────────────────────────────
  describe('form submission', () => {
    it('calls login with email and password on valid submit', async () => {
      const mockLogin = jest.fn().mockResolvedValue({});
      renderLogin({ login: mockLogin });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'user@test.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign_in/i }));
      await waitFor(() =>
        expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' })
      );
    });

    it('navigates to / after successful login', async () => {
      renderLogin();
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'user@test.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign_in/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    it('shows server error banner on login failure', async () => {
      const error = { response: { data: { message: 'Bad credentials' } } };
      const mockLogin = jest.fn().mockRejectedValue(error);
      renderLogin({ login: mockLogin });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'user@test.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign_in/i }));
      await screen.findByRole('alert');
      expect(screen.getByText('Bad credentials')).toBeInTheDocument();
    });

    it('shows fallback error when server returns no message', async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error('Network'));
      renderLogin({ login: mockLogin });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'user@test.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign_in/i }));
      await screen.findByRole('alert');
    });

    it('disables submit button while loading', () => {
      renderLogin({ loading: true });
      expect(screen.getByRole('button', { name: /signing_in/i })).toBeDisabled();
    });
  });
});
