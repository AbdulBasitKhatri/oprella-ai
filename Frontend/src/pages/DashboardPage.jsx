import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Bookmark, 
  ExternalLink, 
  Clock, 
  Building2, 
  GraduationCap, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import { OPPORTUNITY_CATEGORIES, getCategoryLabel } from '../constants/categories';
import ApplicationPreviewModal from '../components/ApplicationPreviewModal';

export default function StudentDashboard({ personalized = true }) {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [opportunities, setOpportunities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const feedCache = useRef(new Map());

  useEffect(() => {
    const opportunityId = searchParams.get('opportunity');
    if (personalized || !opportunityId) return undefined;

    fetch(API_ROUTES.opportunities.publicById(opportunityId))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Opportunity not found');
        setSelectedOpportunity({
          ...data,
          id: data._id || data.id,
          title: data.title || 'Untitled opportunity',
          organization: data.organization || 'Organization',
          location: data.location || 'Remote',
        });
      })
      .catch((err) => console.error('Failed to open notification opportunity:', err));

    return undefined;
  }, [personalized, searchParams]);

  useEffect(() => {
    const fetchSavedOpportunities = async () => {
      if (!token) {
        setSavedIds([]);
        return;
      }

      try {
        const response = await fetch(API_ROUTES.saved.list, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSavedIds(Array.isArray(data.savedOpportunityIds) ? data.savedOpportunityIds : []);
        }
      } catch (err) {
        console.error('Failed to load saved opportunities:', err);
      }
    };

    fetchSavedOpportunities();
    if (token) {
      fetch(API_ROUTES.applications.mine, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.ok ? response.json() : [])
        .then((data) => setApplications(Array.isArray(data) ? data : []))
        .catch(() => setApplications([]));
    } else {
      setApplications([]);
    }
  }, [token]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      const cacheKey = `${personalized ? 'for-you' : 'feed'}:${token || 'public'}:${page}:${searchQuery.trim().toLowerCase()}:${selectedType}`;
      const cached = feedCache.current.get(cacheKey);
      if (cached) {
        setOpportunities(cached.opportunities);
        setTotalOpportunities(cached.total);
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ page: String(page), page_size: '10' });
        if (!personalized && searchQuery.trim()) params.set('q', searchQuery.trim());
        if (selectedType !== 'ALL') params.set('category', selectedType);

        const endpoint = personalized ? API_ROUTES.opportunities.forYou : API_ROUTES.opportunities.feed;
        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || 'Failed to load opportunities');
        }

        const data = await response.json();
        const normalized = (Array.isArray(data.items) ? data.items : []).map((opp) => ({
          ...opp,
          id: opp._id || opp.id,
          title: opp.title || 'Untitled opportunity',
          organization: opp.organization || 'Organization',
          type: opp.category || opp.type || 'INTERNSHIP',
          location: opp.location || 'Remote',
          deadline: opp.applicationDeadline || opp.deadline || 'TBD',
          match_score: opp.matchScore || 0,
          apply_url: opp.applicationUrl || opp.apply_url || '#',
        }));

          const total = Number(data.total) || 0;
          feedCache.current.set(cacheKey, { opportunities: normalized, total });
          setOpportunities(normalized);
          setTotalOpportunities(total);
      } catch (err) {
        setOpportunities([]);
        console.error('Failed to load real opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    const searchTimer = setTimeout(() => {
      fetchOpportunities();
    }, 250);

    return () => clearTimeout(searchTimer);
  }, [token, page, searchQuery, selectedType, personalized]);

  const toggleSave = async (id) => {
    if (!token) return;

    const isSaved = savedIds.includes(String(id));

    try {
      const endpoint = API_ROUTES.saved.remove(id);

      const response = await fetch(endpoint, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Unable to save opportunity.');
      }

      const data = await response.json();
      setSavedIds(Array.isArray(data.savedOpportunityIds) ? data.savedOpportunityIds : []);
    } catch (err) {
      console.error('Toggle save failed:', err);
    }
  };

  const totalPages = Math.ceil(totalOpportunities / 10);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                Student Workspace
              </span>
              <span className="text-xs font-mono text-zinc-400">• Active Session</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              Welcome back, {user?.name || user?.full_name || 'Student'}
            </h1>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
              {user?.email || 'Authenticated User'}
            </p>
          </div>

          <Link
            to={FRONTEND_ROUTES.studentProfile}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-bold text-xs uppercase tracking-widest transition rounded-none flex items-center gap-2"
          >
            <GraduationCap size={15} /> Edit Profile
          </Link>
        </div>

        {/* Main Content Layout */}
        <section className="space-y-5">
          <div className="flex flex-col gap-1 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Discover</span>
            <h2 className="text-xl font-black uppercase tracking-wide">{personalized ? 'For You' : 'Opportunity Feed'} ({totalOpportunities})</h2>
            <p className="text-xs text-zinc-500">{personalized ? 'Opportunities matched to your profile skills.' : 'Search and filter active opportunities across the full database.'}</p>
          </div>
            
            {/* Search and Category Filter Strip */}
            <div className="space-y-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  disabled={personalized}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={personalized ? 'Personalized by your profile skills' : 'Search by title, organization, or key topic...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 rounded-none"
                />
              </div>

              {/* Horizontal Scrollable Category Filter */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
                  {OPPORTUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedType(cat.id);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap border transition rounded-none ${
                        selectedType === cat.id
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                          : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-500'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities Feed */}
            {loading ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
                Loading opportunity feed...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
                No opportunities found matching category "{getCategoryLabel(selectedType)}".
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {opportunities.map((opp) => {
                  const isSaved = savedIds.includes(opp.id);
                  const application = applications.find((item) => item.opportunityId === String(opp.id));
                  return (
                    <article
                      key={opp.id}
                      className="border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-none">
                              {getCategoryLabel(opp.type)}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              {opp.location}
                            </span>
                          </div>
                          <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wide">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                            <Building2 size={13} /> {opp.organization}
                          </p>
                        </div>

                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                          <Clock size={13} /> Deadline: {opp.deadline}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSave(opp.id)}
                            aria-label={isSaved ? 'Remove from saved opportunities' : 'Save opportunity'}
                            className={`p-2 border transition rounded-none ${
                              isSaved
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                                : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-500'
                            }`}
                          >
                            <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOpportunity(opp)}
                            className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-[11px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-white transition rounded-none"
                          >{application ? 'Already applied, see details' : 'Apply Now'} <ExternalLink size={13} /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:flex-row">
                <span className="border border-zinc-900 bg-zinc-900 px-3 py-2 text-xs font-black uppercase tracking-widest text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
                  Page <strong>{page}</strong> <span className="mx-1 text-zinc-400 dark:text-zinc-500">/</span> {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1.5 border border-zinc-900 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-900 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950 dark:disabled:border-zinc-700 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600"
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1.5 border border-zinc-900 bg-zinc-900 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:disabled:border-zinc-700 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
        </section>
      </main>
      {selectedOpportunity && <ApplicationPreviewModal opportunity={selectedOpportunity} token={token} onClose={() => setSelectedOpportunity(null)} onApplied={(application) => { setApplications((current) => [...current, application]); setSelectedOpportunity(null); }} />}
    </div>
  );
}