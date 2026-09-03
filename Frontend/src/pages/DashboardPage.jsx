import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Bookmark, 
  ExternalLink, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FRONTEND_ROUTES } from '../config/appConfig';
import { OPPORTUNITY_CATEGORIES, getCategoryLabel } from '../constants/categories';
import ApplicationPreviewModal from '../components/ApplicationPreviewModal';

export default function StudentDashboard() {
  const { user, token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    const fetchSavedOpportunities = async () => {
      if (!token) {
        setSavedIds([]);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/auth/student/saved-opportunities', {
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

    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/opportunities', {
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
        const normalized = (Array.isArray(data) ? data : []).map((opp) => ({
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

        setOpportunities(normalized);
      } catch (err) {
        setOpportunities([]);
        console.error('Failed to load real opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedOpportunities();
    fetchOpportunities();
    if (token) {
      fetch('http://localhost:8000/applications/my', { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.ok ? response.json() : [])
        .then((data) => setApplications(Array.isArray(data) ? data : []))
        .catch(() => setApplications([]));
    }
  }, [token]);

  const toggleSave = async (id) => {
    if (!token) return;

    const isSaved = savedIds.includes(String(id));

    try {
      const endpoint = isSaved
        ? `http://localhost:8000/auth/student/saved-opportunities/${id}`
        : `http://localhost:8000/auth/student/saved-opportunities/${id}`;

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

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesType = selectedType === 'ALL' || opp.type === selectedType;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 rounded-none shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Available Feed</span>
              <Briefcase size={16} className="text-zinc-400" />
            </div>
            <div className="text-2xl font-black font-mono">{opportunities.length}</div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Active opportunities</span>
          </div>

          <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 rounded-none shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Saved Opportunities</span>
              <Bookmark size={16} className="text-zinc-400" />
            </div>
            <div className="text-2xl font-black font-mono">{savedIds.length}</div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Bookmarked for later</span>
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Category Filter Strip */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, organization, or key topic..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 rounded-none"
                />
              </div>

              {/* Horizontal Scrollable Category Filter */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
                  {OPPORTUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedType(cat.id)}
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
            ) : filteredOpportunities.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
                No opportunities found matching category "{getCategoryLabel(selectedType)}".
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map((opp) => {
                  const isSaved = savedIds.includes(opp.id);
                  const application = applications.find((item) => item.opportunityId === String(opp.id));
                  return (
                    <div
                      key={opp.id}
                      className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition relative rounded-none"
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 rounded-none shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-100">
                  Supported Categories
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                Oprella AI aggregates 14 primary tracks ranging from internships and scholarships to research grants and bootcamps.
              </p>
            </div>
          </div>

        </div>
      </main>
      {selectedOpportunity && <ApplicationPreviewModal opportunity={selectedOpportunity} token={token} onClose={() => setSelectedOpportunity(null)} onApplied={(application) => { setApplications((current) => [...current, application]); setSelectedOpportunity(null); }} />}
    </div>
  );
}