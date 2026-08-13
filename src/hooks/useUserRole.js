import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useUserRole(token) {
  const [role, setRole] = useState(null);
  // Which organization the account acts for, and whether it is confined to it.
  // The admin screens read this to stop offering what the backend answers 403
  // to — creating and deleting organizations, or editing someone else's.
  const [organization, setOrganization] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    function reset() {
      setRole(null);
      setOrganization(null);
      setIsSuperAdmin(false);
    }

    async function fetchRole() {
      if (!token) {
        if (active) {
          reset();
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
          setOrganization(response.data?.organization ?? null);
          setIsSuperAdmin(Boolean(response.data?.isSuperAdmin));
        }
      } catch {
        if (active) {
          reset();
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

  return { role, organization, isSuperAdmin, loading };
}
