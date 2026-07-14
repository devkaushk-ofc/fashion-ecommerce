/**
 * pages/Register.test.jsx
 * Tests for the Register page: rendering, validation, submission, error handling.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../pages/Register';
import useAuthStore from '../../store/useAuthStore';

jest.mock('../../store/useAuthStore');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderRegister = (overrides = {}) => {
  useAuthStore.mockReturnValue({
    loading: false,
    register: jest.fn().mockResolvedValue({}),
    ...overrides,
  });
  return render(<MemoryRouter><Register /></MemoryRouter>);
};

// Helper: fill and submit the registration form with valid data
const fillAndSubmit = async (user, overrides = {}) => {
  const data = {
    name: 'Jane Doe',
    email: 'jane@test.com',
    password: 'password123',
    confirm: 'password123',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/full_name/i), data.name);
  await user.type(screen.getByLabelText(/^email/i),    data.email);
  const pwInputs = screen.getAllByLabelText(/password/i);
  await user.type(pwInputs[0], data.password); // password
  await user.type(pwInputs[1], data.confirm);  // confirm password
  await user.click(screen.getByRole('button', { name: /create_account/i }));
};

describe('Register page', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders create_account heading', () => {
      renderRegister();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders all four input fields', () => {
      renderRegister();
      expect(screen.getByLabelText(/full_name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      // Two password fields (password + confirm)
      expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThanOrEqual(2);
    });

    it('renders link back to login', () => {
      renderRegister();
      expect(screen.getByRole('link', { name: /sign_in_here/i })).toBeInTheDocument();
    });
  });

  // ── Validation ───────────────────────────────────────────────────────
  describe('field validation', () => {
    it('shows name_required when name is left empty', async () => {
      const user = userEvent.setup();
      renderRegister();
      await user.click(screen.getByLabelText(/full_name/i));
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows name_min error for name less than 2 characters', async () => {
      const user = userEvent.setup();
      renderRegister();
      await user.type(screen.getByLabelText(/full_name/i), 'A');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows email_required when email is empty', async () => {
      const user = userEvent.setup();
      renderRegister();
      await user.click(screen.getByLabelText(/^email/i));
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows email_invalid for bad email format', async () => {
      const user = userEvent.setup();
      renderRegister();
      await user.type(screen.getByLabelText(/^email/i), 'badformat');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows passwords_no_match when passwords differ', async () => {
      const user = userEvent.setup();
      renderRegister();
      const pwInputs = screen.getAllByLabelText(/password/i);
      await user.type(pwInputs[0], 'password123');
      await user.tab();
      await user.type(pwInputs[1], 'different99');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('shows password_min when password is too short', async () => {
      const user = userEvent.setup();
      renderRegister();
      const pwInputs = screen.getAllByLabelText(/password/i);
      await user.type(pwInputs[0], 'abc');
      await user.tab();
      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });

    it('blocks submission when any field is invalid', async () => {
      const mockRegister = jest.fn();
      renderRegister({ register: mockRegister });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /create_account/i }));
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  // ── Submission ───────────────────────────────────────────────────────
  describe('form submission', () => {
    it('calls register with name, email and password on valid submit', async () => {
      const mockRegister = jest.fn().mockResolvedValue({});
      renderRegister({ register: mockRegister });
      const user = userEvent.setup();
      await fillAndSubmit(user);
      await waitFor(() =>
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Jane Doe',
          email: 'jane@test.com',
          password: 'password123',
        })
      );
    });

    it('navigates to / after successful registration', async () => {
      renderRegister();
      const user = userEvent.setup();
      await fillAndSubmit(user);
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    it('shows server error banner on registration failure', async () => {
      const error = { response: { data: { message: 'Email already exists' } } };
      renderRegister({ register: jest.fn().mockRejectedValue(error) });
      const user = userEvent.setup();
      await fillAndSubmit(user);
      await screen.findByRole('alert');
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    it('shows fallback server error message', async () => {
      renderRegister({ register: jest.fn().mockRejectedValue(new Error('Network')) });
      const user = userEvent.setup();
      await fillAndSubmit(user);
      await screen.findByRole('alert');
    });

    it('disables submit button while loading', () => {
      renderRegister({ loading: true });
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });
  });

  // ── Password visibility toggles ───────────────────────────────────────
  describe('password visibility toggles', () => {
    it('both password fields are hidden by default', () => {
      renderRegister();
      const pwInputs = screen.getAllByLabelText(/password/i);
      pwInputs.forEach((input) => expect(input).toHaveAttribute('type', 'password'));
    });

    it('toggles first password field to text', async () => {
      const user = userEvent.setup();
      renderRegister();
      const toggles = screen.getAllByRole('button', { name: /show_password/i });
      await user.click(toggles[0]);
      expect(screen.getAllByLabelText(/password/i)[0]).toHaveAttribute('type', 'text');
    });
  });
});
