import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FRONTEND_ROUTES, isRecruiterRole, isStudentRole } from '../../config/appConfig';

export const ProtectedRoute = ({ requireOnboarding = true }) => {
  const { isAuthenticated, isOnboarded, loading, user } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">Loading application...</div>;

  if (!isAuthenticated) {
    return <Navigate to={FRONTEND_ROUTES.login} replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    return <Navigate to={isRecruiterRole(user?.role) ? FRONTEND_ROUTES.recruiterOnboarding : FRONTEND_ROUTES.onboarding} replace />;
  }

  return <Outlet />;
};

export const StudentRoute = () => {
  const { isAuthenticated, isOnboarded, loading, user } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">Loading application...</div>;
  if (!isAuthenticated) return <Navigate to={FRONTEND_ROUTES.login} replace />;
  if (!isOnboarded) return <Navigate to={FRONTEND_ROUTES.onboarding} replace />;
  if (isRecruiterRole(user?.role)) return <Navigate to={FRONTEND_ROUTES.rDashboard} replace />;

  return <Outlet />;
};

export const RecruiterRoute = () => {
  const { isAuthenticated, isOnboarded, loading, user } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">Loading application...</div>;
  if (!isAuthenticated) return <Navigate to={FRONTEND_ROUTES.login} replace />;
  if (!isOnboarded) return <Navigate to={FRONTEND_ROUTES.recruiterOnboarding} replace />;
  if (!isRecruiterRole(user?.role)) return <Navigate to={FRONTEND_ROUTES.dashboard} replace />;

  return <Outlet />;
};

export const PublicRoute = () => {
  const { user, isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const dashboardPath = isOnboarded
      ? isRecruiterRole(user?.role)
        ? FRONTEND_ROUTES.rDashboard
        : FRONTEND_ROUTES.dashboard
      : isRecruiterRole(user?.role)
        ? FRONTEND_ROUTES.recruiterOnboarding
        : FRONTEND_ROUTES.onboarding;

    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};