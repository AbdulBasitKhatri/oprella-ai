import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, KeyRound, LockKeyhole, Trash2 } from 'lucide-react';
import { API_ROUTES } from '../config/appConfig';

export default function AccountSecurity({ token, onDeleted }) {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showDelete, setShowDelete] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(API_ROUTES.auth.changePassword, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(passwords) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to change password.');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setStatus({ type: 'success', text: 'Password changed successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setSaving(true);
    try {
      const response = await fetch(onDeleted.endpoint, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to delete account.');
      onDeleted.complete();
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
      setShowDelete(false);
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800"><div className="mb-5 flex items-center gap-2"><LockKeyhole size={16} /><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Account security</p><h2 className="text-lg font-black uppercase">Password and account controls</h2></div></div>{status.text && <div className={`mb-4 flex items-center gap-2 border p-3 text-xs ${status.type === 'success' ? 'border-emerald-400/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'}`}>{status.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{status.text}</div>}<form onSubmit={changePassword} className="grid gap-4 md:grid-cols-3"><label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Current password<input required type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="mt-2 w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">New password<input required minLength={6} type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="mt-2 w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Confirm new password<input required minLength={6} type="password" value={passwords.confirmNewPassword} onChange={(event) => setPasswords({ ...passwords, confirmNewPassword: event.target.value })} className="mt-2 w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" /></label><button disabled={saving} className="inline-flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 md:col-span-3 md:justify-self-start"><KeyRound size={14} /> {saving ? 'Updating...' : 'Change password'}</button></form><div className="mt-7 border-t border-red-200 pt-5 dark:border-red-950"><p className="text-xs font-bold uppercase text-red-700 dark:text-red-300">Danger zone</p><p className="mt-1 text-xs text-zinc-500">Deleting your account permanently removes your account and associated data.</p><button type="button" onClick={() => setShowDelete(true)} className="mt-3 inline-flex items-center gap-2 border border-red-300 bg-red-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"><Trash2 size={14} /> Delete account</button></div>{showDelete && <div className="mt-4 border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"><p className="text-sm font-bold text-red-800 dark:text-red-200">Delete this account permanently?</p><p className="mt-1 text-xs text-red-700 dark:text-red-300">This action cannot be undone.</p><div className="mt-3 flex gap-2"><button type="button" disabled={saving} onClick={deleteAccount} className="bg-red-600 px-3 py-2 text-[10px] font-bold uppercase text-white">Yes, delete account</button><button type="button" onClick={() => setShowDelete(false)} className="border border-zinc-300 bg-white px-3 py-2 text-[10px] font-bold uppercase dark:border-zinc-700 dark:bg-zinc-900">Cancel</button></div></div>}</section>;
}
