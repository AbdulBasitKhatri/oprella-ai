import React, { useEffect, useState } from 'react';
import { Save, UserRound, Mail, MapPin, GraduationCap, Briefcase, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccountSecurity from '../components/AccountSecurity';
import { API_ROUTES } from '../config/appConfig';

const emptyProfile = {
  fullName: '',
  email: '',
  education: '',
  degreeField: '',
  semester: '',
  skills: '',
  interests: '',
  location: '',
  experience: '',
  careerGoals: '',
};

export default function StudentProfile() {
  const { user, token, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState(emptyProfile);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_ROUTES.auth.studentProfile, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || 'Unable to load student profile.');
        }

        const profile = await response.json();
        setFormData({
          fullName: profile.fullName || user?.fullName || '',
          email: profile.email || user?.email || '',
          education: profile.education || '',
          degreeField: profile.degreeField || '',
          semester: profile.semester || '',
          skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
          interests: profile.interests || '',
          location: profile.location || '',
          experience: profile.experience || '',
          careerGoals: profile.careerGoals || '',
        });
        setCvFileName(profile.cvFileName || '');
      } catch (err) {
        setError(err.message || 'Unable to load student profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [token, user?.fullName, user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token) {
      setError('You must be signed in to save your profile.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        education: formData.education,
        degreeField: formData.degreeField,
        semester: formData.semester,
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        interests: formData.interests,
        location: formData.location,
        experience: formData.experience,
        careerGoals: formData.careerGoals,
      };

      const formDataPayload = new FormData();
      formDataPayload.append('details', JSON.stringify(payload));
      if (cvFile) {
        formDataPayload.append('cv', cvFile);
      }

      const response = await fetch(API_ROUTES.auth.studentProfile, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataPayload,
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError.detail || 'Unable to save profile.');
      }

      const saved = await response.json();
      updateUser({
        fullName: saved.fullName || formData.fullName,
        email: saved.email || formData.email,
      });

      if (saved.cvFileName) {
        setCvFileName(saved.cvFileName);
      }
      setCvFile(null);
      setSuccess('Student profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
              <UserRound size={16} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Student</p>
              <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Profile</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save changes'}
            </button>

          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-3 text-xs font-mono text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={15} /> {success}
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
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Full name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Education</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="education" value={formData.education} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Degree field</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="degreeField" value={formData.degreeField} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Semester</label>
              <input name="semester" value={formData.semester} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Skills</label>
              <input name="skills" value={formData.skills} onChange={handleChange} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" placeholder="React, Python, Problem solving" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">CV / Resume</label>
              <div className="flex flex-col gap-2 rounded border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                  <FileText size={16} />
                  <span className="text-xs font-medium">{cvFileName || 'No CV uploaded yet'}</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-[10px] file:font-extrabold file:uppercase file:tracking-widest file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-950"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Interests</label>
              <textarea name="interests" value={formData.interests} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Experience</label>
              <textarea name="experience" value={formData.experience} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Career goals</label>
              <textarea name="careerGoals" value={formData.careerGoals} onChange={handleChange} rows={3} className="w-full border border-zinc-300 bg-zinc-100 px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
          </div>
        )}
        <AccountSecurity token={token} onDeleted={{ endpoint: API_ROUTES.auth.studentDeleteAccount, complete: () => { logout(); window.location.href = '/login'; } }} />
      </div>
    </div>
  );
}
