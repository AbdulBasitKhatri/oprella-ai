import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  Zap 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/40 via-slate-950 to-emerald-950/20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-900/40 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={14} /> Everything Under One Umbrella
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Stop searching across dozens of tabs. <br />
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Oprella AI guides your next move.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
            The intelligent opportunity ecosystem for students and organizations. Find internships, hackathons, scholarships, and jobs with instant AI matching, eligibility analysis, and skill-gap readiness tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              Explore Opportunities <ArrowRight size={18} />
            </Link>
            <Link
              to="/admin"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              Post an Opportunity
            </Link>
          </div>

          {/* Core Journey Flow Blueprint */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono bg-slate-900/80 border border-slate-800 py-3 px-6 rounded-2xl w-fit mx-auto">
            <span>Discover</span>
            <span className="text-sky-400">→</span>
            <span>Match</span>
            <span className="text-sky-400">→</span>
            <span>Understand</span>
            <span className="text-sky-400">→</span>
            <span>Improve</span>
            <span className="text-sky-400">→</span>
            <span>Apply</span>
            <span className="text-sky-400">→</span>
            <span className="text-emerald-400 font-bold">Track</span>
          </div>
        </div>
      </section>

      {/* Interactive AI Preview Demo Box */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-3 py-1 rounded-full uppercase">
                AI Match Analysis
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Marketing Internship</h3>
              <p className="text-xs text-slate-400">GrowthX Media • Remote</p>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-center">
              <span className="text-xl font-extrabold block">89%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Match Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matched Qualifications</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} /> BBA Student Profile Fit
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} /> Marketing Interest & Strategy
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} /> Digital Marketing Skill Alignment
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Readiness Score</span>
                <span className="text-sm font-bold text-teal-400">78%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                <strong className="text-sky-400">Next Step:</strong> Improve Excel data analysis skills and add a relevant marketing campaign project before applying.
              </p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full w-[78%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Built for Every Ecosystem Partner</h2>
          <p className="text-slate-400 mt-2 text-sm">Empowering students, organizations, and verifiers on a unified platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-sky-500/40 transition">
            <div className="w-12 h-12 bg-sky-950 text-sky-400 rounded-xl flex items-center justify-center mb-5">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">For Students</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build your profile once. Access personalized opportunity feeds, understand eligibility gaps, chat with an AI mentor, and track applications from saved to accepted.
            </p>
          </div>

          {/* Organisations */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-teal-500/40 transition">
            <div className="w-12 h-12 bg-teal-950 text-teal-400 rounded-xl flex items-center justify-center mb-5">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">For Organisations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post internships, hackathons, and jobs effortlessly. Connect directly with verified, high-match candidates while monitoring view and click metrics.
            </p>
          </div>

          {/* Admins */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verified & Trusted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our admin review process ensures all opportunity listings have valid sources, active deadlines, and official application links to avoid spam.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 text-center border-t border-slate-900 bg-gradient-to-b from-slate-950 to-sky-950/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to find opportunities tailored to your profile?
          </h2>
          <p className="text-slate-400 mb-8 text-sm sm:text-base">
            Join Oprella AI to match with top internships, hackathons, and scholarships today.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition shadow-lg shadow-sky-500/25"
          >
            Get Started Now <Zap size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 Oprella AI. Everything Under One Umbrella.</p>
      </footer>
    </div>
  );
}