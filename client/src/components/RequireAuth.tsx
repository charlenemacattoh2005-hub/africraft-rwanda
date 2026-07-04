import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../services/api';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

