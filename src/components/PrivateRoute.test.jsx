import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import useAuthToken from '../hooks/useAuthToken';
import useUserRole from '../hooks/useUserRole';

vi.mock('../hooks/useAuthToken', () => ({ default: vi.fn() }));
vi.mock('../hooks/useUserRole', () => ({ default: vi.fn() }));

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when token is missing', () => {
    useAuthToken.mockReturnValue(null);
    useUserRole.mockReturnValue({ role: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/Authorization" element={<div>auth page</div>} />
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/private" element={<div>private page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('auth page')).toBeInTheDocument();
  });

  it('renders protected content for allowed role', () => {
    useAuthToken.mockReturnValue('jwt');
    useUserRole.mockReturnValue({ role: 'admin', loading: false });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/Authorization" element={<div>auth page</div>} />
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/private" element={<div>private page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('private page')).toBeInTheDocument();
  });

  it('redirects to login for forbidden role', () => {
    useAuthToken.mockReturnValue('jwt');
    useUserRole.mockReturnValue({ role: 'teacher', loading: false });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/Authorization" element={<div>auth page</div>} />
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/private" element={<div>private page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('auth page')).toBeInTheDocument();
  });
});
