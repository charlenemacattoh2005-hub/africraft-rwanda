import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getAuthPayload } from '../services/api';

interface Props {
  children: React.ReactNode;
  /** If provided, only users with one of these roles can access the route */
  roles?: string[];
}

export default function RequireAuth({ children, roles }: Props) {
  const token   = getAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const payload = getAuthPayload();
    const userRole = payload?.role;
    if (!userRole || !roles.includes(userRole)) {
      // Redirect to appropriate dashboard if role mismatch
      const dashMap: Record<string, string> = {
        admin: '/admin',
        vendor: '/vendor',
        rider: '/rider',
        customer: '/',
      };
      const dest = dashMap[userRole] || '/';
      return <Navigate to={dest} replace />;
    }
  }

  return <>{children}</>;
}
