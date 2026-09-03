export const OPPORTUNITY_CATEGORIES = [
  { id: 'ALL', label: 'All Opportunities' },
  { id: 'INTERNSHIP', label: 'Internship' },
  { id: 'JOB', label: 'Job / Placement' },
  { id: 'FELLOWSHIP', label: 'Fellowship' },
  { id: 'SCHOLARSHIP', label: 'Scholarship' },
  { id: 'RESEARCH', label: 'Research' },
  { id: 'HACKATHON', label: 'Hackathon / Competition' },
  { id: 'BOOTCAMP', label: 'Bootcamp' },
  { id: 'COURSE', label: 'Course / Certification' },
  { id: 'WORKSHOP', label: 'Workshop' },
  { id: 'WEBINAR', label: 'Webinar' },
  { id: 'VOLUNTEER', label: 'Volunteer' },
  { id: 'STUDY_ABROAD', label: 'Study Abroad' },
  { id: 'YOUTH_PROGRAM', label: 'Youth Program' },
  { id: 'MENTORSHIP', label: 'Mentorship' },
  { id: 'OTHER', label: 'Other' },
];

export const OPPORTUNITY_TYPES = [
  { id: 'PAID', label: 'Paid' },
  { id: 'UNPAID', label: 'Unpaid' },
  { id: 'STIPEND', label: 'Stipend-based' },
  { id: 'INTERNSHIP', label: 'Internship' },
  { id: 'FULL_TIME', label: 'Full-time' },
  { id: 'PART_TIME', label: 'Part-time' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'VOLUNTEER', label: 'Volunteer' },
  { id: 'HYBRID', label: 'Hybrid' },
  { id: 'REMOTE', label: 'Remote' },
  { id: 'ON_SITE', label: 'On-site' },
];

export const STIPEND_CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'PKR', label: 'PKR (Rs)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'INR', label: 'INR (₹)' },
];

export const STIPEND_PERIODS = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'WEEKLY', label: 'Per week' },
  { value: 'MONTHLY', label: 'Per month' },
  { value: 'QUARTERLY', label: 'Per quarter' },
  { value: 'ANNUALLY', label: 'Per year' },
  { value: 'PER_PROJECT', label: 'Per project' },
];

export const getCategoryLabel = (id) => {
  if (!id) return 'Opportunity';
  if (id === 'ALL') return 'All Opportunities';
  const found = OPPORTUNITY_CATEGORIES.find((cat) => cat.id === id);
  return found ? found.label : id;
};

export const getOpportunityTypeLabel = (id) => {
  if (!id) return 'Opportunity';
  const found = OPPORTUNITY_TYPES.find((type) => type.id === id);
  return found ? found.label : id;
};