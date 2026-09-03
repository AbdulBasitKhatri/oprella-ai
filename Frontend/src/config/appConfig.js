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
  manageOpportunities: '/manage-opportunities',
  organizationProfile: '/organization-profile',
  dashboard: '/dashboard',
  feed: '/feed',
  studentProfile: '/student-profile',
  tracker: '/tracker',
  savedOpportunities: '/saved-opportunities',
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

export const isStudentRole = (role) => {
  if (!role) return false;
  return !isRecruiterRole(role);
};

export const API_BASE_URL = API_BASE;

export const API_ROUTES = {
  auth: {
    login: withApiBase('/auth/login'),
    signup: withApiBase('/auth/signup'),
    studentOnboarding: withApiBase('/auth/student-onboarding'),
    studentCvImport: withApiBase('/auth/student-onboarding/import-cv'),
    recruiterOnboarding: withApiBase('/auth/recruiter-onboarding'),
    recruiterDashboard: withApiBase('/auth/recruiter/dashboard'),
    recruiterProfile: withApiBase('/auth/recruiter/profile'),
    studentProfile: withApiBase('/auth/student/profile'),
    changePassword: withApiBase('/auth/change-password'),
    studentDeleteAccount: withApiBase('/auth/student/delete-account'),
    recruiterDeleteAccount: withApiBase('/auth/recruiter/delete-account'),
  },
  opportunities: {
    create: withApiBase('/opportunities/'),
    list: withApiBase('/opportunities/'),
    feed: withApiBase('/opportunities/feed'),
    forYou: withApiBase('/opportunities/for-you'),
    publicById: (id) => withApiBase(`/opportunities/public/${id}`),
    mine: withApiBase('/opportunities/my'),
    byId: (id) => withApiBase(`/opportunities/${id}`),
  },
  saved: {
    list: withApiBase('/auth/student/saved-opportunities'),
    remove: (id) => withApiBase(`/auth/student/saved-opportunities/${id}`),
  },
  applications: {
    preview: (id) => withApiBase(`/applications/preview/${id}`),
    apply: (id) => withApiBase(`/applications/${id}`),
    mine: withApiBase('/applications/my'),
    forOpportunity: (id) => withApiBase(`/applications/opportunity/${id}`),
    status: (id) => withApiBase(`/applications/${id}/status`),
    message: (id) => withApiBase(`/applications/${id}/message`),
  },
  notifications: {
    list: withApiBase('/notifications'),
    read: (id) => withApiBase(`/notifications/${id}/read`),
  },
};
