import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, KeyRound, Code, ArrowRight, Sparkles, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Student / Researcher',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ROUTES.auth.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed. Please try again.');
      }

      // Update global AuthContext state (syncs storage + triggers immediate Navbar re-render)
      login(data, true);

      // Navigate to onboarding with state preserved
      navigate(FRONTEND_ROUTES.onboarding, {
        state: { fromSignupSuccess: true },
        replace: true,
      });

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Signup Card Container */}
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl dark:shadow-[0_4px_30px_rgba(255,255,255,0.02)] backdrop-blur-xl relative rounded-none transition-colors duration-200">
        
        {/* Subtle Accent Glow Header Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

        {/* Card Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-xs rounded-none">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Oprella Onboarding
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Create Account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Join the platform to access curated opportunities and fellowships.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Abdul Basit"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Role / Profession */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Primary Profile
              </label>
              <div className="relative">
                <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <select
                  disabled={loading}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none appearance-none disabled:opacity-50"
                >
                  <option value="Student / Researcher">Student / Researcher</option>
                  <option value="Recruiter / Organization">Recruiter / Organization</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Address */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                required
                disabled={loading}
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 rounded-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                I accept the <a href="#terms" className="underline">Terms of Service</a>
              </span>
            </label>

            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <ShieldCheck size={12} /> Secure Registration
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
                <Loader2 size={15} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={15} /> Create Account <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Already registered?{' '}
            <Link
              to={FRONTEND_ROUTES.login}
              className="font-bold text-zinc-900 dark:text-zinc-100 uppercase underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}