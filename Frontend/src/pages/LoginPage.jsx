import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Mail, ArrowRight, Sparkles, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES, isRecruiterRole } from '../config/appConfig';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, isAuthenticated, isOnboarded, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      const targetRoute = isOnboarded
        ? FRONTEND_ROUTES.home
        : isRecruiterRole(user?.role)
          ? FRONTEND_ROUTES.recruiterOnboarding
          : FRONTEND_ROUTES.onboarding;

      navigate(targetRoute, { replace: true });
    }
  }, [authLoading, isAuthenticated, isOnboarded, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(API_ROUTES.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
      }

      // Update global AuthContext state (syncs storage + triggers immediate Navbar re-render)
      login(data, formData.rememberMe);

      // Route dynamically based on onboarding status
      if (!data.user?.is_onboarded) {
        const targetRoute = isRecruiterRole(data.user?.role)
          ? FRONTEND_ROUTES.recruiterOnboarding
          : FRONTEND_ROUTES.onboarding;

        navigate(targetRoute, { replace: true });
      } else {
        navigate(FRONTEND_ROUTES.home, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Login Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl dark:shadow-[0_4px_30px_rgba(255,255,255,0.02)] backdrop-blur-xl relative rounded-none transition-colors duration-200">
        
        {/* Subtle Accent Glow Header Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

        {/* Card Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-xs rounded-none">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Oprella Authentication
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Access Account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Enter your credentials to enter the platform.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-mono rounded-none">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
              <input
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="developer@oprella.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <a href="#forgot" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors uppercase">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
              <input
                type="password"
                required
                disabled={loading}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                disabled={loading}
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 rounded-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                Remember session
              </span>
            </label>
            
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <ShieldCheck size={12} /> SSL 256-bit
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <LogIn size={15} /> Authenticate <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            New to Oprella?{' '}
            <Link
              to={FRONTEND_ROUTES.signup}
              className="font-bold text-zinc-900 dark:text-zinc-100 uppercase underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}