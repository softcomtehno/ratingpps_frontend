/* eslint-disable react/prop-types */
import { Navigate, Outlet } from "react-router-dom";
import useAuthToken from "../hooks/useAuthToken";
import useUserRole from "../hooks/useUserRole";

export default function PrivateRoute({ allowedRoles = [], children }) {
  const token = useAuthToken();
  const { role, loading } = useUserRole(token);

  if (!token) {
    return <Navigate to="/Authorization" replace />;
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Проверка входа...</div>;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/Authorization" replace />;
  }

  return children || <Outlet />;
}
