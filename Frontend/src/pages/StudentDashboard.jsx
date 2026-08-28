import React, { useState } from 'react';
import { mockOpportunities } from '../services/api';
import { Search, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filteredData = mockOpportunities.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.organisation.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || item.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Discover Opportunities</h1>
        <p className="text-slate-600 mt-1">AI-curated recommendations based on your profile.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search internships, hackathons, roles..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Internship', 'Hackathon', 'Scholarship'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map((opp) => (
          <div key={opp.id} className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full">
                  {opp.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{opp.title}</h3>
                <p className="text-sm text-slate-500">{opp.organisation} • {opp.location}</p>
              </div>
              {/* AI Match Score Badge */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-center">
                <div className="flex items-center gap-1 font-bold text-sm">
                  <Sparkles size={14} /> {opp.matchScore}%
                </div>
                <span className="text-[10px] uppercase tracking-wider block font-semibold">Match</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm mt-3 line-clamp-2">{opp.description}</p>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-xs text-slate-400">Deadline: {opp.deadline}</span>
              <Link
                to={`/opportunity/${opp.id}`}
                className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                View & Analyze AI
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}