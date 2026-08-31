const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const withApiBase = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

export const FRONTEND_ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  onboarding: '/onboarding',
  recruiterOnboarding: '/recruiter-onboarding',
  rDashboard: '/r-dashboard',
  postOpportunity: '/post-opportunity',
  organizationProfile: '/organization-profile',
  dashboard: '/dashboard',
  tracker: '/tracker',
  admin: '/admin',
};

export const isRecruiterRole = (role) => {
  if (!role) return false;

  const value = String(role).toLowerCase();
  return (
    value.includes('recruiter') ||
    value.includes('organization') ||
    value.includes('organisation') ||
    value.includes('org') ||
    value.includes('company') ||
    value.includes('employer')
  );
};

export const API_BASE_URL = API_BASE;

export const API_ROUTES = {
  auth: {
    login: withApiBase('/auth/login'),
    signup: withApiBase('/auth/signup'),
    studentOnboarding: withApiBase('/auth/student-onboarding'),
    recruiterOnboarding: withApiBase('/auth/recruiter-onboarding'),
    recruiterDashboard: withApiBase('/auth/recruiter/dashboard'),
    recruiterProfile: withApiBase('/auth/recruiter/profile'),
  },
  opportunities: {
    create: withApiBase('/opportunities/'),
    list: withApiBase('/opportunities/'),
  },
};
