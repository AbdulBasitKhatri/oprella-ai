import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Calendar, Clock3, MapPin, Sparkles, AlertCircle, CheckCircle2, Globe, ListChecks, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_TYPES,
  STIPEND_CURRENCIES,
  STIPEND_PERIODS,
} from '../constants/categories';

const initialForm = {
  title: '',
  organization: '',
  category: 'INTERNSHIP',
  type: 'PAID',
  location: '',
  remoteType: 'Hybrid',
  applicationDeadline: '',
  startDate: '',
  startTime: '',
  durationDays: '',
  workDays: '',
  timezone: 'UTC',
  applicationUrl: '',
  description: '',
  requiredSkills: '',
  eligibility: '',
  stipendAmount: '',
  stipendCurrency: 'PKR',
  stipendPeriod: 'MONTHLY',
  stipend: '',
};

export default function PostOpportunity() {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [opportunityId, setOpportunityId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      setIsEditMode(false);
      setOpportunityId(null);
      setFormData(initialForm);
      return;
    }

    const fetchOpportunity = async () => {
      try {
        setIsEditMode(true);
        setOpportunityId(id);
        const response = await fetch(API_ROUTES.opportunities.byId(id), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load opportunity for editing.');
        }

        const data = await response.json();
        setFormData({
          title: data.title || '',
          organization: data.organization || '',
          category: data.category || 'INTERNSHIP',
          type: data.type || 'PAID',
          location: data.location || '',
          remoteType: data.remoteType || 'Hybrid',
          applicationDeadline: data.applicationDeadline || '',
          startDate: data.startDate || '',
          startTime: data.startTime || '',
          durationDays: data.durationDays || '',
          workDays: data.workDays || '',
          timezone: data.timezone || 'UTC',
          applicationUrl: data.applicationUrl || '',
          description: data.description || '',
          requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills.join(', ') : '',
          eligibility: data.eligibility || '',
          stipendAmount: data.stipendAmount ?? '',
          stipendCurrency: data.stipendCurrency || 'PKR',
          stipendPeriod: data.stipendPeriod || 'MONTHLY',
          stipend: data.stipend || '',
        });
      } catch (err) {
        setError(err.message || 'Unable to load opportunity.');
      }
    };

    if (token) {
      fetchOpportunity();
    }
  }, [location.search, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!token) {
      setError('Please sign in before posting an opportunity.');
      return;
    }

    try {
      setIsSubmitting(true);

      const stipendAmount = formData.stipendAmount !== '' ? Number(formData.stipendAmount) : null;
      const stipendText = stipendAmount !== null
        ? `${formData.stipendCurrency || 'PKR'} ${stipendAmount} / ${formData.stipendPeriod || 'MONTHLY'}`
        : formData.stipend || '';

      const payload = {
        title: formData.title,
        organization: formData.organization || user?.companyName || user?.fullName || 'Organization',
        category: formData.category,
        type: formData.type,
        location: formData.location,
        remoteType: formData.remoteType,
        applicationDeadline: formData.applicationDeadline || null,
        startDate: formData.startDate || null,
        startTime: formData.startTime || null,
        durationDays: formData.durationDays ? Number(formData.durationDays) : null,
        workDays: formData.workDays || null,
        timezone: formData.timezone || 'UTC',
        applicationUrl: formData.applicationUrl || '',
        description: formData.description,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        eligibility: formData.eligibility || '',
        stipendAmount,
        stipendCurrency: formData.stipendCurrency || 'PKR',
        stipendPeriod: formData.stipendPeriod || 'MONTHLY',
        stipend: stipendText,
        status: 'draft',
        createdBy: user?._id || user?.id || user?.email || null,
        publishedAt: new Date().toISOString(),
      };

      const url = isEditMode && opportunityId ? API_ROUTES.opportunities.byId(opportunityId) : API_ROUTES.opportunities.create;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to publish opportunity.');
      }

      setStatus(
        isEditMode
          ? 'Opportunity successfully updated and saved to the backend.'
          : 'Opportunity successfully published and saved to the backend.'
      );
      if (!isEditMode) {
        setFormData(initialForm);
      }
    } catch (err) {
      setError(err.message || 'Unable to publish opportunity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
            <Sparkles size={15} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Publisher</p>
            <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Post Opportunity</h1>
          </div>
        </div>

        {status && (
          <div className="mb-6 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={15} /> {status}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-xs font-mono text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Opportunity title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                placeholder="Frontend Developer Intern"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Organization</label>
              <div className="relative">
                <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                  placeholder="Acme Labs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Opportunity category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {OPPORTUNITY_CATEGORIES.filter((cat) => cat.id !== 'ALL').map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {OPPORTUNITY_TYPES.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                  placeholder="Remote / Karachi"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Mode</label>
              <select
                name="remoteType"
                value={formData.remoteType}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Application deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Start date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Start time</label>
              <div className="relative">
                <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Duration (days)</label>
              <input
                type="number"
                min="1"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Working days</label>
              <input
                name="workDays"
                value={formData.workDays}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                placeholder="Mon-Fri / Tue-Thu"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Timezone</label>
              <input
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="UTC / PKT"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Application URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  name="applicationUrl"
                  value={formData.applicationUrl}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                  placeholder="https://example.com/apply"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
              placeholder="Describe the role, responsibilities, and selection process."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Required skills</label>
            <textarea
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              rows={3}
              className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
              placeholder="React, Python, UI/UX, problem solving"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Eligibility</label>
              <input
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                placeholder="Open to undergrad students"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Stipend</label>
              <div className="grid gap-2 sm:grid-cols-[1.1fr_0.8fr_1fr]">
                <div className="relative">
                  <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    name="stipendAmount"
                    type="number"
                    min="0"
                    value={formData.stipendAmount}
                    onChange={handleChange}
                    className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                    placeholder="25000"
                  />
                </div>

                <select
                  name="stipendCurrency"
                  value={formData.stipendCurrency}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {STIPEND_CURRENCIES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <select
                  name="stipendPeriod"
                  value={formData.stipendPeriod}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {STIPEND_PERIODS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <AlertCircle size={13} /> Review before publishing
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch(API_ROUTES.opportunities.byId(opportunityId), {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (!response.ok) {
                        const payload = await response.json().catch(() => ({}));
                        throw new Error(payload.detail || 'Unable to delete opportunity.');
                      }

                      navigate(FRONTEND_ROUTES.manageOpportunities, { replace: true });
                    } catch (err) {
                      setError(err.message || 'Unable to delete opportunity.');
                    }
                  }}
                  className="inline-flex items-center gap-2 border border-red-300 bg-red-50 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-zinc-900 px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                {isSubmitting
                  ? (isEditMode ? 'Updating...' : 'Publishing...')
                  : (isEditMode ? <>Update listing <ArrowRight size={14} /></> : <>Publish listing <ArrowRight size={14} /></>)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
