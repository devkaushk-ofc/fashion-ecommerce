/**
 * components/ProtectedRoute.test.jsx
 * Tests for the ProtectedRoute guard component.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthStore from '../../store/useAuthStore';

// Mock the auth store so tests control authentication state
jest.mock('../../store/useAuthStore');

const renderProtected = (isAuthenticated = false) => {
  useAuthStore.mockReturnValue({ isAuthenticated });
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderProtected(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderProtected(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
