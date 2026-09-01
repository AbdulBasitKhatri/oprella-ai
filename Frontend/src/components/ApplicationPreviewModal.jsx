import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react';
import { API_ROUTES } from '../config/appConfig';

export default function ApplicationPreviewModal({ opportunity, token, onClose, onApplied }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.applications.preview(opportunity.id), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail || 'Unable to prepare application preview.');
        setData(payload);
      })
      .catch((err) => setError(err.message));
  }, [opportunity.id, token]);

  const apply = async () => {
    setSaving(true); setError('');
    try {
      const response = await fetch(API_ROUTES.applications.apply(opportunity.id), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || 'Unable to submit application.');
      onApplied(payload);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const analysis = data?.analysis;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/70 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-zinc-700 bg-white p-6 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Application review</p><h2 className="mt-1 text-xl font-black uppercase">{opportunity.title}</h2><p className="text-xs font-mono text-zinc-500">{opportunity.organization} / {opportunity.location}</p></div>
          <button type="button" onClick={onClose} aria-label="Close application preview" className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={18} /></button>
        </div>
        {!data && !error && <div className="flex items-center gap-2 py-12 text-xs font-mono text-zinc-500"><LoaderCircle className="animate-spin" size={16} /> Preparing your fit analysis...</div>}
        {error && <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-xs text-red-700"><AlertCircle size={15} /> {error}</div>}
        {data && <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2"><div className="border border-zinc-200 p-4 dark:border-zinc-800"><span className="text-[10px] font-mono uppercase text-zinc-500">Fit score</span><strong className="mt-1 block text-3xl font-black">{analysis.score}%</strong></div><div className="border border-zinc-200 p-4 dark:border-zinc-800"><span className="text-[10px] font-mono uppercase text-zinc-500">Eligibility</span><strong className={`mt-2 block text-sm uppercase ${analysis.eligible ? 'text-emerald-600' : 'text-amber-600'}`}>{analysis.eligible ? 'Meets requirements' : 'Review skill gaps'}</strong></div></div>
          <div><h3 className="mb-2 text-xs font-bold uppercase tracking-widest">Role details</h3><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{data.opportunity.description}</p><p className="mt-2 text-xs font-mono text-zinc-500">Required: {(data.opportunity.requiredSkills || []).join(', ') || 'Role-specific assessment'}</p></div>
          <div className="grid gap-5 md:grid-cols-2"><div><h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">Matched skills</h3><div className="flex flex-wrap gap-2">{(analysis.matchedSkills || []).map((skill) => <span key={skill} className="border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{skill}</span>)}</div></div><div><h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">Skill gap analysis</h3><div className="flex flex-wrap gap-2">{(analysis.skillGaps || []).map((skill) => <span key={skill} className="border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-700">{skill}</span>)}</div>{analysis.recommendations?.length > 0 && <p className="mt-3 text-xs text-zinc-500">{analysis.recommendations.join(' ')}</p>}</div></div>
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800"><h3 className="mb-2 text-xs font-bold uppercase tracking-widest">Your submitted profile</h3><p className="text-sm">{data.profile.fullName} / {data.profile.email}</p><p className="mt-1 text-xs text-zinc-500">{data.profile.education} {data.profile.degreeField} / CV: {data.profile.cvFileName || 'Not uploaded'}</p></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="border border-zinc-300 px-4 py-2 text-xs font-bold uppercase">Cancel</button><button type="button" disabled={saving || data.alreadyApplied} onClick={apply} className="inline-flex items-center gap-2 bg-zinc-900 px-5 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">{data.alreadyApplied ? <><CheckCircle2 size={14} /> Already applied</> : saving ? 'Submitting...' : 'Confirm and apply'}</button></div>
        </div>}
      </div>
    </div>
  );
}