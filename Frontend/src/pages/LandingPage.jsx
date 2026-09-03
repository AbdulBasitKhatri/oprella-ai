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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        {/* Top Subtle Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono uppercase tracking-widest mb-6 rounded-none">
            <Sparkles size={14} className="text-zinc-900 dark:text-zinc-100" /> Every opportunity under on umbrella.
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 leading-tight uppercase">
            Stop searching across dozens of tabs. <br />
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-zinc-100 dark:via-zinc-400 dark:to-zinc-600 bg-clip-text text-transparent">
              Oprella AI guides your next move.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
            The intelligent opportunity ecosystem for students and organizations. Find internships, hackathons, scholarships, and jobs with instant AI matching, eligibility analysis, and skill-gap readiness tracking.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-md"
            >
              Explore Opportunities <ArrowRight size={15} />
            </Link>
            <Link
              to="/admin"
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 rounded-none"
            >
              Post an Opportunity
            </Link>
          </div>

          {/* Core Journey Flow Blueprint */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 py-3.5 px-6 rounded-none w-fit mx-auto shadow-sm">
            <span>DISCOVER</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span>MATCH</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span>UNDERSTAND</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span>IMPROVE</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span>APPLY</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold underline underline-offset-4">TRACK</span>
          </div>
        </div>
      </section>

      {/* Interactive AI Preview Demo Box */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl dark:shadow-[0_4px_30px_rgba(255,255,255,0.02)] backdrop-blur-xl relative rounded-none">
          <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 rounded-none">
                AI Match Analysis
              </span>
              <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-zinc-100 mt-3 tracking-wide">
                Marketing Internship
              </h3>
              <p className="text-xs text-zinc-500 font-mono">GrowthX Media • Remote</p>
            </div>
            
            <div className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-800 dark:border-zinc-200 px-4 py-2 rounded-none text-center shadow-sm">
              <span className="text-xl font-black block leading-none font-mono">89%</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-80">Match Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Matched Qualifications
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-zinc-900 dark:text-zinc-100 shrink-0" /> BBA Student Profile Fit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-zinc-900 dark:text-zinc-100 shrink-0" /> Marketing Interest & Strategy
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-zinc-900 dark:text-zinc-100 shrink-0" /> Digital Marketing Skill Alignment
                </li>
              </ul>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-4 border border-zinc-200 dark:border-zinc-800 rounded-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Readiness Score
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">78%</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Next Step:</strong> Improve Excel data analysis skills and add a relevant marketing campaign project before applying.
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-none overflow-hidden">
                <div className="bg-zinc-900 dark:bg-zinc-100 h-full w-[78%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Built for Every Ecosystem Partner
          </h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-wide">
            Empowering students, organizations, and verifiers on a unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 rounded-none hover:border-zinc-400 dark:hover:border-zinc-700 transition duration-200 shadow-sm">
            <div className="w-10 h-10 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center mb-5 rounded-none">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-2">
              For Students
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Build your profile once. Access personalized opportunity feeds, understand eligibility gaps, chat with an AI mentor, and track applications from saved to accepted.
            </p>
          </div>

          {/* Organisations */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 rounded-none hover:border-zinc-400 dark:hover:border-zinc-700 transition duration-200 shadow-sm">
            <div className="w-10 h-10 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center mb-5 rounded-none">
              <Briefcase size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-2">
              For Organisations
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Post internships, hackathons, and jobs effortlessly. Connect directly with verified, high-match candidates while monitoring view and click metrics.
            </p>
          </div>

          {/* Admins */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 rounded-none hover:border-zinc-400 dark:hover:border-zinc-700 transition duration-200 shadow-sm">
            <div className="w-10 h-10 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center mb-5 rounded-none">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-2">
              Verified & Trusted
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our admin review process ensures all opportunity listings have valid sources, active deadlines, and official application links to avoid spam.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 text-center border-t border-zinc-200 dark:border-zinc-900 bg-zinc-100/60 dark:bg-zinc-900/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wide">
            Ready to find opportunities tailored to your profile?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-xs sm:text-sm font-mono">
            Join Oprella AI to match with top internships, hackathons, and scholarships today.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-white transition duration-200 rounded-none shadow-md"
          >
            Get Started Now <Zap size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}