import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { FRONTEND_ROUTES } from '../config/appConfig';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-900 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link to={FRONTEND_ROUTES.home} className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
              <Sparkles size={16} />
            </span>
            <span className="text-lg font-black uppercase tracking-widest">Oprella<span className="font-light text-zinc-500">.AI</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Find the next opportunity that fits your direction.
          </p>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Explore</h2>
          <nav className="mt-3 flex flex-col items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.home}>Home</Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.feed}>Opportunities</Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.signup}>Create account</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Account</h2>
          <nav className="mt-3 flex flex-col items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Link className="inline-flex items-center gap-1 transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.login}>Sign in <ArrowUpRight size={14} /></Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.studentProfile}>Student profile</Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" to={FRONTEND_ROUTES.organizationProfile}>Organization profile</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 Oprella AI</span>
          <span>Every opportunity under on umbrella.</span>
        </div>
      </div>
    </footer>
  );
}
