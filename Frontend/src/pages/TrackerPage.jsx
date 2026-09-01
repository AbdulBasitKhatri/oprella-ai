import React, { useEffect, useState } from 'react';
import { API_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

export default function TrackerPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  useEffect(() => { if (token) fetch(API_ROUTES.applications.mine, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setApplications).catch(() => setApplications([])); }, [token]);
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-5xl rounded-none border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Tracker</p>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Application Tracker
        </h1>
        <div className="mt-8 space-y-3">{applications.length === 0 ? <p className="text-sm text-zinc-500">No applications submitted yet.</p> : applications.map((application) => <div key={application._id} className="flex flex-col gap-2 border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold uppercase">{application.opportunitySnapshot?.title}</h2><p className="text-xs font-mono text-zinc-500">Applied {new Date(application.appliedAt).toLocaleDateString()} / fit {application.analysis?.score}%</p></div><span className="text-xs font-bold uppercase text-zinc-500">{application.status}</span></div>)}</div>
      </div>
    </div>
  );
}
