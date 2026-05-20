import PrivateRoute from "./PrivateRoute";

const PrivateRouteAdmin = () => {
  return <PrivateRoute allowedRoles={["admin"]} />;
};

export default PrivateRouteAdmin;
