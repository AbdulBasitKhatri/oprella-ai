import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BookmarkCheck, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wide text-sky-400">
          Opprella<span className="text-white">.AI</span>
        </Link>
        <div className="flex space-x-6 items-center">
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-sky-400 text-sm font-medium">
            <LayoutDashboard size={18} /> Feed
          </Link>
          <Link to="/tracker" className="flex items-center gap-1.5 hover:text-sky-400 text-sm font-medium">
            <BookmarkCheck size={18} /> Tracker
          </Link>
          <Link to="/admin" className="flex items-center gap-1.5 hover:text-sky-400 text-sm font-medium">
            <Briefcase size={18} /> Admin
          </Link>
          <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-sm">
            ST
          </div>
        </div>
      </div>
    </nav>
  );
}