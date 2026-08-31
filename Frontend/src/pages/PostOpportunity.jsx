import React, { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Calendar, Clock3, MapPin, Sparkles, AlertCircle, CheckCircle2, Globe, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../config/appConfig';
import { OPPORTUNITY_CATEGORIES } from '../constants/categories';

const initialForm = {
  title: '',
  organization: '',
  category: 'INTERNSHIP',
  type: 'INTERNSHIP',
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
  stipend: '',
};

export default function PostOpportunity() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        stipend: formData.stipend || '',
        status: 'draft',
        createdBy: user?._id || user?.id || user?.email || null,
        publishedAt: new Date().toISOString(),
      };

      const response = await fetch(API_ROUTES.opportunities.create, {
        method: 'POST',
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

      setStatus('Opportunity successfully published and saved to the backend.');
      setFormData(initialForm);
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
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="BOOTCAMP">Bootcamp</option>
                <option value="COURSE_CERT">Course / Certificate</option>
                <option value="SCHOLARSHIP">Scholarship</option>
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
              <div className="relative">
                <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600"
                  placeholder="PKR 25,000 / month"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <AlertCircle size={13} /> Review before publishing
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-zinc-900 px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              {isSubmitting ? 'Publishing...' : <>Publish listing <ArrowRight size={14} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
