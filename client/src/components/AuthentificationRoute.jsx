import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AuthentificationRoute = () => {
  const { currentUser } = useSelector((state) => state.user);

  if (currentUser) {
    // User is logged in - redirect to appropriate dashboard
    switch (currentUser.role) {
      case "seller":
        return <Navigate to="/seller-dashboard" replace />;
      case "delivery":
        return <Navigate to="/delivery-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Not logged in - allow access to auth pages
  return <Outlet />;
};

export default AuthentificationRoute;
