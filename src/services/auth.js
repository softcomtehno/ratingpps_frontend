export const TOKEN_KEY = 'token';
export const AUTH_CHANGED_EVENT = 'auth-changed';

function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChanged();
}

export function isAuthPage(pathname) {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return (
    path === '/Authorization' ||
    path === '/teacher/email' ||
    path === '/teacher/code' ||
    path === '/teacher/step2' ||
    path === '/oauth-success'
  );
}
