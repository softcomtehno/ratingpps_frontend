import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function PrivateRoute() {
  const token = localStorage.getItem("token");
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (!token) {
        if (mounted) {
          setOk(false);
          setChecking(false);
        }
        return;
      }

      try {
        // простой проверочный запрос (любой защищенный endpoint)
        await api.get("/api/get/role", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setOk(true);
      } catch (e) {
        // токен битый/просрочен/невалидный
        localStorage.removeItem("token");
        if (mounted) setOk(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    check();
    return () => { mounted = false; };
  }, [token]);

  if (checking) {
    return <div style={{ padding: 20, textAlign: "center" }}>Проверка входа...</div>;
  }

  return ok ? <Outlet /> : <Navigate to="/Authorization" replace />;
}
