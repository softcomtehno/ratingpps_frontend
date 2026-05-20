import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useUserRole(token) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function fetchRole() {
      if (!token) {
        if (active) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setLoading(true);
      }

      try {
        const response = await api.get('/api/get/role');
        if (active) {
          setRole(response.data?.role ?? null);
        }
      } catch {
        if (active) {
          setRole(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchRole();

    return () => {
      active = false;
    };
  }, [token]);

  return { role, loading };
}
