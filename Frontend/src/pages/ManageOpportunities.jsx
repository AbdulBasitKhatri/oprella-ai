import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilLine, Trash2, Plus, ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

export default function ManageOpportunities() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOpportunities = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_ROUTES.opportunities.mine, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Unable to load your postings.');
      }

      const data = await response.json();
      setOpportunities(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load your postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) return;

    try {
      const response = await fetch(API_ROUTES.opportunities.byId(id), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Unable to delete opportunity.');
      }

      setOpportunities((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete opportunity.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Management</p>
            <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Manage opportunities</h1>
          </div>

          <Link
            to={FRONTEND_ROUTES.postOpportunity}
            className="inline-flex items-center gap-2 border border-zinc-300 bg-zinc-900 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            <Plus size={14} /> New posting
          </Link>
        </div>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-3 text-xs font-mono text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 animate-pulse rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
            You have no opportunities yet. Create one to start publishing.
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp._id} className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
                      <BriefcaseBusiness size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">{opp.title}</h2>
                      <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                        {opp.organization} • {opp.type} • {opp.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`${FRONTEND_ROUTES.postOpportunity}?id=${opp._id}`)}
                      className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <PencilLine size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(opp._id)}
                      className="inline-flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
