import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

const AuthentificationRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  
  if (!currentUser) {
    return <Outlet />;
  }
  
  // If user is logged in, redirect based on role
  switch(currentUser.role) {
    case 'seller':
      return window.location.pathname.startsWith('/seller-') 
        ? <Outlet /> 
        : <Navigate to="/seller-dashboard" replace />;
    case 'delivery':
      return window.location.pathname.startsWith('/delivery-') 
        ? <Outlet /> 
        : <Navigate to="/delivery-dashboard" replace />;
    case 'admin':
      return window.location.pathname.startsWith('/admin-') 
        ? <Outlet /> 
        : <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default AuthentificationRoute;