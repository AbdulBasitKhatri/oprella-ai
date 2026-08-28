import React from 'react';

const STAGES = ['Saved', 'Applied', 'Interview', 'Accepted'];

export default function ApplicationTracker() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Application Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h2 className="font-semibold text-slate-700 mb-3">{stage}</h2>
            
            {/* Example Card */}
            {stage === 'Saved' && (
              <div className="bg-white p-3 rounded-lg border shadow-sm mb-3">
                <p className="font-bold text-sm text-slate-800">Marketing Internship</p>
                <p className="text-xs text-slate-500">GrowthX Media</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}