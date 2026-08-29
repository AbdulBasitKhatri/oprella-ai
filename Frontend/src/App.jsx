import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
// import StudentDashboard from './pages/StudentDashboard';
// import ApplicationTracker from './pages/ApplicationTracker';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 transition-colors duration-200">
          {/* Fixed Top Navbar */}
          <Navbar />

          {/* Global Page Wrapper with top padding matching Navbar height */}
          <main className="pt-16 min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/tracker" element={<ApplicationTracker />} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}