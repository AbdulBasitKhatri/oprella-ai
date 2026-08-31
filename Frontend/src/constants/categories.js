export const OPPORTUNITY_CATEGORIES = [
  { id: 'ALL', label: 'All Opportunities' },
  { id: 'INTERNSHIP', label: 'Internships' },
  { id: 'HACKATHON', label: 'Hackathons & Competitions' },
  { id: 'FELLOWSHIP', label: 'Fellowships' },
  { id: 'SCHOLARSHIP', label: 'Scholarships' },
  { id: 'VOLUNTEER', label: 'Volunteerships' },
  { id: 'TRAINEE', label: 'Trainee Programs' },
  { id: 'STUDY_ABROAD', label: 'Study Abroad' },
  { id: 'BOOTCAMP', label: 'Bootcamps' },
  { id: 'COURSE_CERT', label: 'Courses & Certificates' },
  { id: 'WORKSHOP', label: 'Workshops' },
  { id: 'WEBINAR', label: 'Webinars' },
  { id: 'TUITION', label: 'Tuition Support' },
  { id: 'RESEARCH_FUNDING', label: 'Research Grants' },
  { id: 'YOUTH_PROGRAM', label: 'Youth Programs' },
];

export const getCategoryLabel = (id) => {
  const found = OPPORTUNITY_CATEGORIES.find((cat) => cat.id === id);
  return found ? found.label : id;
};