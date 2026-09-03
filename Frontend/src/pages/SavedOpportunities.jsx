import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkX, Building2, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';
import ApplicationPreviewModal from '../components/ApplicationPreviewModal';

export default function SavedOpportunities() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    const loadSaved = async () => {
      try {
        const [savedResponse, opportunitiesResponse] = await Promise.all([
          fetch(API_ROUTES.saved.list, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(API_ROUTES.opportunities.list),
        ]);
        const saved = await savedResponse.json();
        const all = await opportunitiesResponse.json();
        if (!savedResponse.ok || !opportunitiesResponse.ok) throw new Error('Unable to load saved opportunities.');
        const savedIds = new Set((saved.savedOpportunityIds || []).map(String));
        const items = Array.isArray(all) ? all : (Array.isArray(all.items) ? all.items : []);
        setOpportunities(items.filter((item) => savedIds.has(String(item._id))));
      } catch (err) {
        setError(err.message || 'Unable to load saved opportunities.');
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
    return undefined;
  }, [token]);

  const removeSaved = async (id) => {
    const response = await fetch(API_ROUTES.saved.remove(id), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setOpportunities((current) => current.filter((item) => String(item._id) !== String(id)));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800"><p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Candidate workspace</p><h1 className="mt-2 text-3xl font-black uppercase tracking-wide">Saved opportunities</h1><p className="mt-2 text-sm text-zinc-500">Your bookmarked roles, kept together for review and application.</p></header>
        {error && <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-700">{error}</div>}
        {loading ? <div className="border border-zinc-200 bg-white p-10 text-center text-xs font-mono text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">Loading saved opportunities...</div> : opportunities.length === 0 ? <div className="border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900"><Bookmark className="mx-auto text-zinc-400" size={24} /><p className="mt-3 text-sm font-bold">No saved opportunities yet.</p><p className="mt-1 text-xs text-zinc-500">Use the bookmark action in Feed to keep a role here.</p></div> : <div className="grid gap-4 md:grid-cols-2">{opportunities.map((opportunity) => <article key={opportunity._id} className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{opportunity.category || opportunity.type}</p><h2 className="mt-2 text-lg font-black uppercase">{opportunity.title}</h2><p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><Building2 size={13} /> {opportunity.organization}</p></div><Bookmark className="fill-current text-amber-500" size={17} /></div><div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500"><span className="flex items-center gap-1"><MapPin size={13} /> {opportunity.location || 'Location not specified'}</span><span className="flex items-center gap-1"><CalendarDays size={13} /> Deadline: {opportunity.applicationDeadline || 'Open'}</span></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{opportunity.description}</p><div className="mt-5 flex items-center justify-between gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800"><button type="button" onClick={() => setSelectedOpportunity({ ...opportunity, id: opportunity._id })} className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase text-white dark:bg-zinc-100 dark:text-zinc-950">Review and apply <ExternalLink size={13} /></button><button type="button" onClick={() => removeSaved(opportunity._id)} aria-label={`Remove ${opportunity.title} from saved opportunities`} className="p-2 text-zinc-500 hover:text-red-600"><BookmarkX size={16} /></button></div></article>)}</div>}
      </main>
      {selectedOpportunity && <ApplicationPreviewModal opportunity={selectedOpportunity} token={token} onClose={() => setSelectedOpportunity(null)} onApplied={() => setSelectedOpportunity(null)} />}
    </div>
  );
}
