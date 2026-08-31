import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BriefcaseBusiness,
  Plus,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bell,
  CalendarClock,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FRONTEND_ROUTES, API_ROUTES } from '../config/appConfig';

export default function RDashboard() {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_ROUTES.auth.recruiterDashboard, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || 'Unable to load recruiter dashboard.');
        }

        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const organizationName =
    dashboard?.organizationName || user?.companyName || user?.fullName || user?.organization || 'Your organization';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-none border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                Organization Dashboard
              </span>
              <span className="text-xs font-mono text-zinc-400">• Live overview</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              Welcome, {organizationName}
            </h1>
            <p className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              {dashboard?.email || user?.email || 'Authenticated recruiter'}
            </p>
          </div>

          <Link
            to={FRONTEND_ROUTES.postOpportunity}
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-zinc-900 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            <Plus size={14} /> Post Opportunity
          </Link>
        </div>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-3 text-xs font-mono text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))
          ) : (
            [
              { label: 'Live listings', value: dashboard?.liveListings ?? 0, icon: BriefcaseBusiness },
              { label: 'Applicants', value: dashboard?.applicants ?? 0, icon: Users },
              { label: 'Shortlist rate', value: dashboard?.shortlistRate ?? '0%', icon: TrendingUp },
              { label: 'Open tasks', value: dashboard?.openTasks ?? 0, icon: Bell },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">{label}</span>
                  <Icon size={16} className="text-zinc-400" />
                </div>
                <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">{value}</div>
              </div>
            ))
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-6">
            <div className="border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300">Recent postings</h2>
                </div>
                <Link to={FRONTEND_ROUTES.manageOpportunities} className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Manage all <ArrowRight size={12} />
                </Link>
              </div>

              <div className="space-y-4">
                {(dashboard?.recentPostings || []).length === 0 ? (
                  <div className="border border-zinc-200 bg-zinc-50 p-4 text-xs font-mono text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                    No active opportunities yet.
                  </div>
                ) : (
                  dashboard?.recentPostings?.map((opp) => (
                    <div key={`${opp.title}-${opp.type}`} className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">{opp.title}</h3>
                          <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">{opp.type}</p>
                        </div>
                        <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                          {opp.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Users size={13} /> {opp.applicants} applicants
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> Verified listing
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center gap-2">
                <Building2 size={15} className="text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300">Organization summary</h3>
              </div>

              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <span>Profile complete</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{dashboard?.profileComplete ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <span>Industry</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{dashboard?.industry || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{dashboard?.location || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock size={15} className="text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300">Quick actions</h3>
              </div>

              <div className="space-y-2">
                <Link to={FRONTEND_ROUTES.postOpportunity} className="flex w-full items-center justify-between border border-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700">
                  <span>Post new role</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to={FRONTEND_ROUTES.organizationProfile} className="flex w-full items-center justify-between border border-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700">
                  <span>Organization profile</span>
                  <UserCircle2 size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
