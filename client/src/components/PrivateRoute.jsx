import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    // Not logged in - redirect to home
    return <Navigate to="/" replace />;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Logged in but not authorized - redirect to appropriate dashboard or home
    switch(currentUser.role) {
      case 'seller':
        return <Navigate to="/seller-dashboard" replace />;
      case 'delivery':
        return <Navigate to="/delivery-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Authorized - render the child routes
  return <Outlet />;
};

export default PrivateRoute;