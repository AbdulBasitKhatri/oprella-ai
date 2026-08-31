import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, PublicRoute } from './components/routes/AuthRoutes';
import { FRONTEND_ROUTES } from './config/appConfig';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import StudentOnboarding from './pages/StudentOnboarding';
import DashboardPage from './pages/DashboardPage';
import TrackerPage from './pages/TrackerPage';
import AdminPage from './pages/AdminPage';

function OnboardingRoute({ children }) {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">Loading application...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={FRONTEND_ROUTES.login} replace />;
  }

  if (isOnboarded) {
    return <Navigate to={FRONTEND_ROUTES.home} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 transition-colors duration-200">
            <Navbar />

            <main className="pt-16 min-h-[calc(100vh-4rem)]">
              <Routes>
                <Route path={FRONTEND_ROUTES.home} element={<LandingPage />} />

                <Route element={<PublicRoute />}>
                  <Route path={FRONTEND_ROUTES.signup} element={<SignupPage />} />
                  <Route path={FRONTEND_ROUTES.login} element={<LoginPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path={FRONTEND_ROUTES.dashboard} element={<DashboardPage />} />
                  <Route path={FRONTEND_ROUTES.tracker} element={<TrackerPage />} />
                  <Route path={FRONTEND_ROUTES.admin} element={<AdminPage />} />
                </Route>

                <Route
                  path={FRONTEND_ROUTES.onboarding}
                  element={
                    <OnboardingRoute>
                      <StudentOnboarding />
                    </OnboardingRoute>
                  }
                />

                <Route path="*" element={<Navigate to={FRONTEND_ROUTES.home} replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}