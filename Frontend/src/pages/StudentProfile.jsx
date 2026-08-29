import React, { useState } from 'react';
import { Upload, BriefcaseBusiness, GraduationCap, MapPin, Sparkles, Target, BookOpenText, PencilLine } from 'lucide-react';

const initialState = {
  education: 'Bachelor of Science in Computer Science',
  degreeField: 'Software Engineering',
  semester: '6th Semester',
  skills: 'React, Node.js, Python, UI/UX Design',
  interests: 'AI, Product Design, Web Development',
  location: 'Karachi, Pakistan',
  experience: 'Frontend developer intern with 2 projects in React and dashboard design.',
  careerGoals: 'To become a product-focused software engineer and work on impactful digital products.',
};

export default function StudentProfile() {
  const [formData, setFormData] = useState(initialState);
  const [cvFile, setCvFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Student onboarding data:', { ...formData, cvFile });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 py-10 px-4 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
            <Sparkles size={12} /> Student onboarding
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Build your student profile
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Tell us about your education, skills, goals, and experience so we can personalize your opportunity matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-none border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Education
              </label>
              <div className="relative">
                <BookOpenText className="absolute left-3 top-3 text-zinc-400" size={16} />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Degree / Field
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 text-zinc-400" size={16} />
                <input
                  type="text"
                  name="degreeField"
                  value={formData.degreeField}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                  placeholder="e.g. Software Engineering"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Semester
              </label>
              <input
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 py-2.5 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                placeholder="e.g. 6th Semester"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 py-2.5 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                placeholder="React, Node.js, Python, UX Design"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full border border-zinc-300 bg-zinc-100 py-2.5 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                placeholder="AI, product design, entrepreneurship"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                  placeholder="e.g. Karachi, Pakistan"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Experience
              </label>
              <div className="relative">
                <BriefcaseBusiness className="absolute left-3 top-3 text-zinc-400" size={16} />
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                  placeholder="Internships, freelance, projects"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Career Goals
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 text-zinc-400" size={16} />
                <textarea
                  name="careerGoals"
                  value={formData.careerGoals}
                  onChange={handleChange}
                  rows="4"
                  className="w-full resize-none border border-zinc-300 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100"
                  placeholder="What are your career goals?"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                Upload CV
              </label>
              <div className="flex flex-col gap-3 rounded-none border border-dashed border-zinc-300 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-950/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="flex h-10 w-10 items-center justify-center border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <Upload size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{cvFile ? cvFile.name : 'No file selected'}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF, DOCX up to 5MB</p>
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center border border-zinc-300 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-800 transition hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500">
                  <PencilLine size={14} className="mr-2" />
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="border border-zinc-300 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-700 transition hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              Save draft
            </button>
            <button
              type="submit"
              className="bg-zinc-900 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Complete profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
