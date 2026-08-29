import React, { useState } from 'react';
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
} from 'lucide-react';

export default function StudentOnboarding() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Student onboarding profile:', formData);
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
            Complete your profile to unlock tailored opportunity matches.
          </p>
        </div>

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
                  className={fieldClasses + ' appearance-none'}
                >
                  <option value="">Select education level</option>
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
                  placeholder="Computer Science"
                  className={fieldClasses}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Semester
              </label>
              <div className="relative">
                <CalendarRange className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={fieldClasses + ' appearance-none'}
                >
                  <option value="">Select semester</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                  <option value="Final Year">Final Year</option>
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
                  placeholder="Karachi, Pakistan"
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
                rows="3"
                placeholder="Python, UI/UX, Content Writing, Data Analysis"
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
                rows="3"
                placeholder="Product design, AI, startups, research, entrepreneurship"
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
                rows="4"
                placeholder="Describe internships, projects, part-time roles, or freelance work."
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
                rows="4"
                placeholder="What role or impact do you want to build toward in the next few years?"
                className={fieldClasses + ' pl-10 resize-none'}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-md mt-6"
          >
            <CheckCircle2 size={15} /> Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
