/**
 * components/AdminRoute.test.jsx
 * Tests for the AdminRoute guard component.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from '../../components/AdminRoute';
import useAuthStore from '../../store/useAuthStore';

jest.mock('../../store/useAuthStore');

const renderAdmin = (isAuthenticated, role = 'user') => {
  useAuthStore.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { name: 'Test', role } : null,
  });
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/"      element={<div>Home Page</div>} />
        <Route path="/admin" element={
          <AdminRoute>
            <div>Admin Panel</div>
          </AdminRoute>
        } />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminRoute', () => {
  it('renders children when authenticated and role is admin', () => {
    renderAdmin(true, 'admin');
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderAdmin(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('redirects to / when authenticated but not admin', () => {
    renderAdmin(true, 'user');
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
