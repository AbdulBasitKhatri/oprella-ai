import React from 'react';

export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-5xl rounded-none border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Admin Panel</p>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Review & Moderation
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          This control center is scaffolded and ready for listing management, moderation, and eligibility review.
        </p>
      </div>
    </div>
  );
}
