import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import {
  BookOpen,
  GraduationCap,
  CalendarRange,
  BriefcaseBusiness,
  MapPin,
  Target,
  Sparkles,
  CheckCircle2,
  PencilLine,
  UploadCloud,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth(); // Retrieve state & updater from AuthContext

  const [formData, setFormData] = useState({
    education: '',
    degreeField: '',
    semester: '',
    skills: '',
    interests: '',
    location: '',
    experience: '',
    careerGoals: '',
  });

  const [cvFile, setCvFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (!file) return;

    // Allowed extensions for PDF/DOC/DOCX
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setFileError('Invalid file format. Only PDF, DOC, and DOCX files are allowed.');
      e.target.value = '';
      return;
    }

    // 5MB Limit Check
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB threshold.');
      e.target.value = '';
      return;
    }

    setCvFile(file);
  };

  const removeFile = () => {
    setCvFile(null);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const dataPayload = new FormData();
      const detailsPayload = {
        education: formData.education,
        degreeField: formData.degreeField,
        semester: formData.semester,
        skills: formData.skills,
        interests: formData.interests,
        location: formData.location,
        experience: formData.experience,
        careerGoals: formData.careerGoals,
      };

      dataPayload.append('details', JSON.stringify(detailsPayload));

      if (cvFile) {
        dataPayload.append('cv', cvFile);
      }

      // Use active token from AuthContext or fallback to local storage
      const activeToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(API_ROUTES.auth.onboarding, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        body: dataPayload,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to complete onboarding');
      }

      // Update global context state so the router updates immediately without a hard refresh
      const updatedUserData = { ...user, ...resData.user, is_onboarded: true };
      
      if (typeof updateUser === 'function') {
        updateUser(updatedUserData);
      }

      // Smooth client-side navigation
      navigate(FRONTEND_ROUTES.home, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClasses =
    'w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 transition-colors rounded-none';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl dark:shadow-[0_4px_30px_rgba(255,255,255,0.02)] backdrop-blur-xl relative rounded-none transition-colors duration-200">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-200 dark:via-zinc-500 to-zinc-400 opacity-80" />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-xs rounded-none">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Student Profile Setup
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Tell us about you
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Complete all profile fields to unlock tailored opportunity matches. Select "No Education" or "None" where applicable.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} /> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Education
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                  className={fieldClasses + ' appearance-none'}
                >
                  <option value="">Select education level</option>
                  <option value="No formal education">No formal education</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Degree / Field
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  type="text"
                  name="degreeField"
                  value={formData.degreeField}
                  onChange={handleChange}
                  required
                  placeholder="Computer Science (or type 'None')"
                  className={fieldClasses}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Semester / Phase
              </label>
              <div className="relative">
                <CalendarRange className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className={fieldClasses + ' appearance-none'}
                >
                  <option value="">Select semester or phase</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Karachi, Pakistan (or type 'Remote / Unspecified')"
                  className={fieldClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Skills
            </label>
            <div className="relative">
              <PencilLine className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" size={16} />
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Python, UI/UX, Data Analysis (or type 'None / Beginner')"
                className={fieldClasses + ' pl-10 resize-none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Interests
            </label>
            <div className="relative">
              <Target className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" size={16} />
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Product design, AI, Startups (or type 'None')"
                className={fieldClasses + ' pl-10 resize-none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Experience
            </label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" size={16} />
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Describe internships, projects, or type 'No prior experience'."
                className={fieldClasses + ' pl-10 resize-none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Career Goals
            </label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" size={16} />
              <textarea
                name="careerGoals"
                value={formData.careerGoals}
                onChange={handleChange}
                required
                rows="3"
                placeholder="What role do you want to build toward? (or type 'Undecided')"
                className={fieldClasses + ' pl-10 resize-none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              CV / Resume (PDF, DOC, DOCX up to 5MB)
            </label>
            {!cvFile ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-4 cursor-pointer hover:border-zinc-500 transition-colors">
                <UploadCloud className="text-zinc-400 mb-1" size={24} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  Click to upload or drag & drop CV
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono mt-0.5">
                  PDF, DOC, DOCX (Max 5MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-zinc-500" />
                  <div>
                    <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[250px]">
                      {cvFile.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {fileError && (
              <p className="text-[11px] text-red-500 font-mono mt-1">{fileError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-md mt-6 disabled:opacity-50"
          >
            <CheckCircle2 size={15} /> {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}