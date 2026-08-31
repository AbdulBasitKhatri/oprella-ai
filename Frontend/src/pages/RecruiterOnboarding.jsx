import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, BriefcaseBusiness, Globe, MapPin, Users, Mail, UserRound, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES, isRecruiterRole } from '../config/appConfig';

const fieldClasses =
  'w-full px-3 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none';

export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const dataPayload = new FormData();
      const detailsPayload = {
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
        additionalDetails: formData.additionalDetails
          ? { notes: formData.additionalDetails }
          : {},
      };

      dataPayload.append('details', JSON.stringify(detailsPayload));

      const activeToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(API_ROUTES.auth.recruiterOnboarding, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        body: dataPayload,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to complete recruiter onboarding');
      }

      const updatedUserData = { ...user, ...resData.user, is_onboarded: true, role: user?.role || 'Recruiter / Organization' };
      if (typeof updateUser === 'function') {
        updateUser(updatedUserData);
      }

      navigate(FRONTEND_ROUTES.home, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRecruiterRole(user?.role)) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl dark:shadow-[0_4px_30px_rgba(255,255,255,0.02)] backdrop-blur-xl relative rounded-none">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-xs rounded-none">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Recruiter Profile Setup
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Tell us about your organization
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Complete your company profile so we can match you with the right talent and campaigns.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} /> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="Acme Labs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Industry
              </label>
              <div className="relative">
                <BriefcaseBusiness className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="AI / EdTech / SaaS"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Company Size
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="11-50 employees"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  className={`${fieldClasses} pl-10`}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="Karachi, Pakistan"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contact Name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="Ayesha Khan"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} pl-10`}
                  placeholder="recruiter@company.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              What are you hiring for?
            </label>
            <textarea
              name="hiringNeeds"
              value={formData.hiringNeeds}
              onChange={handleChange}
              required
              rows={3}
              className={fieldClasses}
              placeholder="Interns, recent grads, data analysts, full-stack developers..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Company Description
            </label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              required
              rows={3}
              className={fieldClasses}
              placeholder="Describe your mission, platform, and the kind of talent you want to attract."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              What do you want to use Oprella for?
            </label>
            <textarea
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
              required
              rows={3}
              className={fieldClasses}
              placeholder="We want to discover student candidates, host internships, and publish hiring opportunities."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Additional Notes
            </label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              rows={3}
              className={fieldClasses}
              placeholder="Any extra information for our team or future matches..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-2">
            <CheckCircle2 size={14} /> Your onboarding profile will unlock recruiter features and candidate matching.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving profile...' : <>Complete onboarding <ArrowRight size={14} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
