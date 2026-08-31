import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, MapPin, PencilLine, Save, UserRound, BriefcaseBusiness, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../config/appConfig';

const emptyProfile = {
  companyName: '',
  industry: '',
  companySize: '',
  companyWebsite: '',
  location: '',
  contactName: '',
  contactEmail: '',
  hiringNeeds: '',
  companyDescription: '',
  useCase: '',
  additionalDetails: '',
};

const normalizeAdditionalNotes = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.notes === 'string') return value.notes;
    return JSON.stringify(value);
  }
  return String(value);
};

export default function OrganizationProfile() {
  const { user, token, updateUser } = useAuth();
  const [formData, setFormData] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_ROUTES.auth.recruiterProfile, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || 'Unable to load organization profile.');
        }

        const profile = await response.json();
        const details = profile || {};

        setFormData({
          companyName: details.companyName || user?.companyName || '',
          industry: details.industry || '',
          companySize: details.companySize || '',
          companyWebsite: details.companyWebsite || '',
          location: details.location || '',
          contactName: details.contactName || '',
          contactEmail: details.contactEmail || user?.email || '',
          hiringNeeds: details.hiringNeeds || '',
          companyDescription: details.companyDescription || '',
          useCase: details.useCase || '',
          additionalDetails: normalizeAdditionalNotes(details.additionalDetails),
        });
      } catch (err) {
        setError(err.message || 'Unable to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token) {
      setError('You must be signed in to save this profile.');
      return;
    }

    try {
      setError('');
      setSaved(false);

      const payload = {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        companyWebsite: formData.companyWebsite,
        location: formData.location,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        hiringNeeds: formData.hiringNeeds,
        companyDescription: formData.companyDescription,
        useCase: formData.useCase,
        additionalDetails: { notes: formData.additionalDetails },
      };

      const response = await fetch(API_ROUTES.auth.recruiterProfile, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError.detail || 'Unable to save organization profile.');
      }

      const savedProfile = await response.json();
      updateUser({
        companyName: savedProfile.companyName,
        recruiter_onboarding_details: savedProfile,
      });

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.message || 'Unable to save profile changes.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
              <Building2 size={16} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Management</p>
              <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Organization Profile</h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={loading}
          >
            <Save size={14} /> Save changes
          </button>
        </div>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-3 text-xs font-mono text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={15} /> Organization profile updated.
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-12 animate-pulse rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Company name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Industry</label>
              <div className="relative">
                <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="industry" value={formData.industry} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Company size</label>
              <input name="companySize" value={formData.companySize} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Primary contact</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="contactName" value={formData.contactName} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Contact email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Hiring needs</label>
              <textarea name="hiringNeeds" value={formData.hiringNeeds} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Company description</label>
              <textarea name="companyDescription" value={formData.companyDescription} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">How you use Oprella</label>
              <textarea name="useCase" value={formData.useCase} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Additional notes</label>
              <textarea name="additionalDetails" value={formData.additionalDetails} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <PencilLine size={14} /> Edit organization details and keep your public profile current.
        </div>
      </div>
    </div>
  );
}
