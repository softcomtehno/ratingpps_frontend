import { describe, it, expect } from 'vitest';
import { ALL_AUTH_ROLES, protectedRoutes } from './routes/protectedRoutes';

describe('protected route config', () => {
  it('keeps common private office route available for all authenticated roles', () => {
    const route = protectedRoutes.find(item => item.path === '/private_office');
    expect(route).toBeDefined();
    expect(route.roles).toEqual(ALL_AUTH_ROLES);
  });

  it('restricts admin dashboard route to admin role only', () => {
    const route = protectedRoutes.find(item => item.path === '/admin');
    expect(route).toBeDefined();
    expect(route.roles).toEqual(['admin']);
  });

  it('restricts expert dashboard route to expert role only', () => {
    const route = protectedRoutes.find(item => item.path === '/expert/dashboard');
    expect(route).toBeDefined();
    expect(route.roles).toEqual(['expert']);
  });
});
