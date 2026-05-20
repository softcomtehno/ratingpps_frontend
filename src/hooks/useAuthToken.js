import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT, getToken } from '../services/auth';

export default function useAuthToken() {
  const [token, setToken] = useState(() => getToken());

  useEffect(() => {
    const updateToken = () => setToken(getToken());

    window.addEventListener(AUTH_CHANGED_EVENT, updateToken);
    window.addEventListener('storage', updateToken);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, updateToken);
      window.removeEventListener('storage', updateToken);
    };
  }, []);

  return token;
}
