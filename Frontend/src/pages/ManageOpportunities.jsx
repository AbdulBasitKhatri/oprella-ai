import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilLine, Trash2, Plus, ArrowRight, BriefcaseBusiness, Users, X, Send, UserRound } from 'lucide-react';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

export default function ManageOpportunities() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [message, setMessage] = useState({ subject: 'Interview invitation', body: '' });
  const templates = {
    interview: { subject: 'Interview invitation', body: 'Hello, we reviewed your application and would like to invite you for an interview. Please reply with your availability.' },
    update: { subject: 'Application update', body: 'Hello, thank you for applying. We are still reviewing applications and will be in touch with the next update.' },
  };

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

  const viewApplicants = async (id) => {
    try {
      const response = await fetch(API_ROUTES.applications.forOpportunity(id), { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load applicants.');
      setApplicants(data); setSelectedApplicant(data[0] || null);
    } catch (err) { setError(err.message); }
  };

  const updateStatus = async (status) => {
    if (!selectedApplicant) return;
    const response = await fetch(API_ROUTES.applications.status(selectedApplicant._id), { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) setSelectedApplicant((current) => ({ ...current, status }));
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const response = await fetch(API_ROUTES.applications.message(selectedApplicant._id), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    if (response.ok) setMessage({ subject: 'Interview invitation', body: '' });
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
                    <button type="button" onClick={() => viewApplicants(opp._id)} className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"><Users size={14} /> Applicants</button>
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
      {selectedApplicant && <div className="fixed inset-0 z-[55] flex items-center justify-center bg-zinc-950/70 p-4"><div className="grid max-h-[90vh] w-full max-w-5xl gap-6 overflow-y-auto border border-zinc-700 bg-white p-6 dark:bg-zinc-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Applicant review / {applicants.length} total</p><h2 className="text-xl font-black uppercase">{selectedApplicant.candidateSnapshot?.fullName || selectedApplicant.candidateSnapshot?.email}</h2></div><button type="button" onClick={() => setSelectedApplicant(null)} aria-label="Close applicant review"><X /></button></div><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="space-y-4"><div className="border border-zinc-200 p-4 dark:border-zinc-800"><h3 className="mb-2 text-xs font-bold uppercase tracking-widest">Candidate profile snapshot</h3><p className="text-sm">{selectedApplicant.candidateSnapshot?.email}</p><p className="mt-1 text-sm text-zinc-500">{selectedApplicant.candidateSnapshot?.education} / {selectedApplicant.candidateSnapshot?.degreeField} / {selectedApplicant.candidateSnapshot?.semester}</p><p className="mt-2 text-sm">Skills: {(selectedApplicant.candidateSnapshot?.skills || []).join(', ') || 'None listed'}</p><p className="mt-2 text-xs text-zinc-500">Experience: {selectedApplicant.candidateSnapshot?.experience || 'Not provided'}</p><p className="mt-2 text-xs text-zinc-500">CV: {selectedApplicant.candidateSnapshot?.cvFileName || 'Not uploaded'}</p></div><div className="border border-zinc-200 p-4 dark:border-zinc-800"><h3 className="mb-2 text-xs font-bold uppercase tracking-widest">Application evidence</h3><p className="text-sm">Applied {new Date(selectedApplicant.appliedAt).toLocaleString()}</p><p className="mt-2 text-sm">{selectedApplicant.analysis?.summary}</p><p className="mt-2 text-xs text-emerald-600">Matched: {(selectedApplicant.analysis?.matchedSkills || []).join(', ') || 'None'}</p><p className="mt-1 text-xs text-amber-600">Gaps: {(selectedApplicant.analysis?.skillGaps || []).join(', ') || 'None'}</p></div></div><div className="space-y-4"><div className="border border-zinc-200 p-4 dark:border-zinc-800"><p className="text-[10px] font-mono uppercase text-zinc-500">Fit score</p><strong className="text-4xl font-black">{selectedApplicant.analysis?.score}%</strong><p className="mt-2 text-xs font-bold uppercase text-zinc-500">Status: {selectedApplicant.status}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => updateStatus('interview')} className="bg-emerald-600 px-3 py-2 text-xs font-bold uppercase text-white">Call for interview</button><button type="button" onClick={() => updateStatus('rejected')} className="border border-zinc-300 px-3 py-2 text-xs font-bold uppercase">Reject</button></div></div><form onSubmit={sendMessage} className="border border-zinc-200 p-4 dark:border-zinc-800"><h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Send size={14} /> Send in-app message</h3><input value={message.subject} onChange={(event) => setMessage({ ...message, subject: event.target.value })} className="mb-2 w-full border border-zinc-300 bg-transparent p-2 text-xs dark:border-zinc-700" placeholder="Subject" /><textarea required value={message.body} onChange={(event) => setMessage({ ...message, body: event.target.value })} className="mb-2 h-24 w-full border border-zinc-300 bg-transparent p-2 text-xs dark:border-zinc-700" placeholder="Write a custom message or paste a template..." /><button className="w-full bg-zinc-900 px-3 py-2 text-xs font-bold uppercase text-white dark:bg-zinc-100 dark:text-zinc-950">Send message</button></form></div></div></div></div>}
    </div>
  );
}
