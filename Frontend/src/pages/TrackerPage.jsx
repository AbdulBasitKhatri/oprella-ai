import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, FileText, MapPin, Search, Sparkles, XCircle } from 'lucide-react';
import { API_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

const statusSteps = ['submitted', 'reviewing', 'accepted'];

const statusMeta = {
  submitted: { label: 'Submitted', tone: 'text-sky-700 bg-sky-50 border-sky-200', icon: Clock3 },
  reviewing: { label: 'Under review', tone: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock3 },
  accepted: { label: 'Accepted', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Not selected', tone: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
};

function formatDate(value, includeTime = false) {
  if (!value) return 'Not provided';
  return new Date(value).toLocaleString(undefined, includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
}

function getNextStep(application) {
  if (application.status === 'accepted') return 'Watch your notifications and email for interview scheduling details.';
  if (application.status === 'rejected') return 'Keep building your strengths and continue exploring opportunities that match your goals.';
  if (application.status === 'reviewing') return 'The organization is reviewing your application. Keep your contact details available.';
  return 'Your application has been received. The organization will review your profile and respond here.';
}

function StatusTimeline({ status }) {
  const isRejected = status === 'rejected';
  const currentIndex = statusSteps.indexOf(status);
  return (
    <div className="mt-5">
      <div className="flex items-center">
        {(isRejected ? ['submitted', 'rejected'] : statusSteps).map((step, index, steps) => {
          const meta = statusMeta[step];
          const Icon = meta.icon;
          const complete = isRejected ? index < 1 : index <= currentIndex;
          return (
            <React.Fragment key={step}>
              <div className={`flex shrink-0 flex-col items-center gap-1 ${complete ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                <span className={`flex h-8 w-8 items-center justify-center border ${complete ? meta.tone : 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'}`}><Icon size={15} /></span>
                <span className="text-[9px] font-bold uppercase tracking-wide">{meta.label}</span>
              </div>
              {index < steps.length - 1 && <span className={`mx-2 h-px flex-1 ${complete ? 'bg-zinc-400' : 'bg-zinc-200 dark:bg-zinc-700'}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationDetails({ application }) {
  const opportunity = application.opportunitySnapshot || {};
  const candidate = application.candidateSnapshot || {};
  const analysis = application.analysis || {};
  const message = application.decisionMessage;
  return (
    <div className="border-t border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section><div className="mb-2 flex items-center gap-2"><BriefcaseBusiness size={15} /><h3 className="text-xs font-bold uppercase tracking-widest">Opportunity snapshot</h3></div><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{opportunity.description || 'No description provided.'}</p><div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2"><span className="flex items-center gap-2"><MapPin size={13} /> {opportunity.location || 'Location not provided'}</span><span className="flex items-center gap-2"><CalendarDays size={13} /> Deadline: {formatDate(opportunity.applicationDeadline)}</span><span>Mode: {opportunity.remoteType || 'Not specified'}</span><span>Type: {opportunity.type || opportunity.category || 'Not specified'}</span></div></section>
          <section className="border-t border-zinc-200 pt-4 dark:border-zinc-800"><h3 className="mb-2 text-xs font-bold uppercase tracking-widest">Requirements</h3><div className="flex flex-wrap gap-2">{(opportunity.requiredSkills || []).length ? opportunity.requiredSkills.map((skill) => <span key={skill} className="border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700">{skill}</span>) : <span className="text-xs text-zinc-500">No specific skills listed.</span>}</div>{opportunity.eligibility && <p className="mt-3 text-xs text-zinc-500">Eligibility: {opportunity.eligibility}</p>}</section>
          <section className="border-t border-zinc-200 pt-4 dark:border-zinc-800"><div className="mb-2 flex items-center gap-2"><FileText size={15} /><h3 className="text-xs font-bold uppercase tracking-widest">Profile submitted</h3></div><div className="grid gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2"><span>Name: {candidate.fullName || 'Not provided'}</span><span>Email: {candidate.email || 'Not provided'}</span><span>Education: {candidate.education || 'Not provided'}</span><span>Field: {candidate.degreeField || 'Not provided'}</span><span>Semester: {candidate.semester || 'Not provided'}</span><span>Location: {candidate.location || 'Not provided'}</span></div><p className="mt-3 text-xs text-zinc-500">Experience: {candidate.experience || 'Not provided'}</p><p className="mt-1 text-xs text-zinc-500">Career goals: {candidate.careerGoals || 'Not provided'}</p></section>
        </div>
        <div className="space-y-5">
          <section className="border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Fit assessment</p><p className="mt-1 text-3xl font-black">{analysis.score ?? 'N/A'}%</p></div><Sparkles size={17} className="text-zinc-400" /></div><p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{analysis.summary || 'Your submitted profile has been recorded for review.'}</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div><p className="mb-1 text-[10px] font-bold uppercase text-emerald-600">Matched strengths</p><ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">{(analysis.matchedSkills || []).length ? analysis.matchedSkills.map((skill) => <li key={skill}>{skill}</li>) : <li>No direct matches recorded</li>}</ul></div><div><p className="mb-1 text-[10px] font-bold uppercase text-amber-600">Areas to develop</p><ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">{(analysis.skillGaps || []).length ? analysis.skillGaps.map((skill) => <li key={skill}>Missing: {skill}</li>) : <li>No listed gaps</li>}</ul></div></div></section>
          <section className="border border-zinc-200 p-4 dark:border-zinc-800"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">What happens next</p><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{getNextStep(application)}</p>{message?.body && <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Message from the organization</p><p className="mt-2 whitespace-pre-line text-xs leading-5 text-zinc-600 dark:text-zinc-400">{message.body}</p></div>}</section>
        </div>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return undefined; }
    setLoading(true);
    fetch(API_ROUTES.applications.mine, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.detail || 'Unable to load applications.'); return payload; })
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Unable to load applications.'))
      .finally(() => setLoading(false));
  }, [token]);

  const counts = useMemo(() => ({ all: applications.length, active: applications.filter((item) => ['submitted', 'reviewing'].includes(item.status)).length, accepted: applications.filter((item) => item.status === 'accepted').length, rejected: applications.filter((item) => item.status === 'rejected').length }), [applications]);
  const visibleApplications = applications.filter((application) => { const title = application.opportunitySnapshot?.title || ''; const organization = application.opportunitySnapshot?.organization || ''; const matchesQuery = `${title} ${organization}`.toLowerCase().includes(query.toLowerCase()); const matchesFilter = filter === 'all' || filter === 'active' && ['submitted', 'reviewing'].includes(application.status) || application.status === filter; return matchesQuery && matchesFilter; });

  return <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8"><main className="mx-auto max-w-6xl space-y-6"><header><p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Candidate workspace</p><h1 className="mt-2 text-3xl font-black uppercase tracking-wide">Application tracker</h1><p className="mt-2 max-w-2xl text-sm text-zinc-500">A complete record of your applications, progress, fit evidence, and messages from organizations.</p></header>
    <div className="grid gap-3 sm:grid-cols-4">{[['all', 'Total applications'], ['active', 'In progress'], ['accepted', 'Accepted'], ['rejected', 'Not selected']].map(([key, label]) => <button type="button" key={key} onClick={() => setFilter(key)} className={`border p-4 text-left transition ${filter === key ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}><span className="block text-[10px] font-mono uppercase tracking-widest opacity-70">{label}</span><strong className="mt-1 block text-2xl font-black">{counts[key]}</strong></button>)}</div>
    <div className="flex flex-col gap-3 border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" className="w-full border border-zinc-300 bg-zinc-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950" /></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"><option value="all">All applications</option><option value="active">In progress</option><option value="accepted">Accepted</option><option value="rejected">Not selected</option></select></div>
    {loading && <div className="border border-zinc-200 bg-white p-10 text-center text-xs font-mono text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">Loading your applications...</div>}{error && <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-4 text-xs text-red-700"><AlertCircle size={15} /> {error}</div>}{!loading && !error && visibleApplications.length === 0 && <div className="border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900"><p className="text-sm font-bold">{applications.length ? 'No applications match your filters.' : 'No applications submitted yet.'}</p><p className="mt-2 text-xs text-zinc-500">Applications you submit will appear here with their complete history.</p></div>}
    <div className="space-y-3">{visibleApplications.map((application) => { const meta = statusMeta[application.status] || statusMeta.submitted; const Icon = meta.icon; const expanded = expandedId === application._id; return <article key={application._id} className="overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><button type="button" onClick={() => setExpandedId(expanded ? null : application._id)} className="w-full p-5 text-left"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-bold uppercase ${meta.tone}`}><Icon size={12} /> {meta.label}</span><span className="text-[10px] font-mono text-zinc-400">Applied {formatDate(application.appliedAt)}</span></div><h2 className="mt-3 truncate text-lg font-black uppercase tracking-wide">{application.opportunitySnapshot?.title || 'Opportunity'}</h2><p className="mt-1 text-xs text-zinc-500">{application.opportunitySnapshot?.organization || 'Organization'} {application.opportunitySnapshot?.location ? ` / ${application.opportunitySnapshot.location}` : ''}</p></div><div className="flex items-center justify-between gap-6 lg:justify-end"><div><span className="block text-[10px] font-mono uppercase text-zinc-500">Fit score</span><strong className="text-2xl font-black">{application.analysis?.score ?? 'N/A'}%</strong></div><ChevronDown className={`text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`} size={18} /></div></div><StatusTimeline status={application.status} /></button>{expanded && <ApplicationDetails application={application} />}</article>; })}</div>
  </main></div>;
}
