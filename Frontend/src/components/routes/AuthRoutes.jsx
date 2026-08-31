import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FRONTEND_ROUTES } from '../../config/appConfig';

// 1. Prevents unauthenticated users from seeing internal pages
// 2. Redirects onboarded/non-onboarded users to their correct homes
export const ProtectedRoute = ({ requireOnboarding = true }) => {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">Loading application...</div>;

  if (!isAuthenticated) {
    return <Navigate to={FRONTEND_ROUTES.login} replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    return <Navigate to={FRONTEND_ROUTES.onboarding} replace />;
  }

  return <Outlet />;
};

// Prevents already logged-in users from viewing Login / Signup pages
export const PublicRoute = () => {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={isOnboarded ? FRONTEND_ROUTES.home : FRONTEND_ROUTES.onboarding} replace />;
  }

  return <Outlet />;
};