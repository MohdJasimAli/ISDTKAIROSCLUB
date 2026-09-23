// Single source of frontend constants — mirrors backend Prisma enums.
// To add a category/skill/status: update here AND backend/prisma/schema.prisma, then re-migrate.

export const IDEA_CATEGORIES = [
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'APP_DEVELOPMENT', label: 'App Development' },
  { value: 'AI_ML', label: 'AI / ML' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'IOT', label: 'IoT' },
  { value: 'ROBOTICS', label: 'Robotics' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'EMBEDDED_SYSTEMS', label: 'Embedded Systems' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'CLOUD', label: 'Cloud' },
  { value: 'AUTOMATION', label: 'Automation' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'SOCIAL_IMPACT', label: 'Social Impact' },
  { value: 'PRODUCT_DEVELOPMENT', label: 'Product Development' },
  { value: 'OTHER', label: 'Other' },
];

export const IDEA_STAGES = [
  { value: 'JUST_AN_IDEA', label: 'Just an Idea' },
  { value: 'RESEARCHING', label: 'Researching' },
  { value: 'PROTOTYPE_IN_PROGRESS', label: 'Prototype in Progress' },
  { value: 'MVP_READY', label: 'MVP Ready' },
  { value: 'TESTING', label: 'Testing' },
];

export const IDEA_STATUSES = [
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CHANGES_REQUESTED', label: 'Changes Requested' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const PROJECT_STATUSES = [
  { value: 'IDEA_SUBMITTED', label: 'Idea Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'TEAM_FORMATION', label: 'Team Formation' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'PROTOTYPE_READY', label: 'Prototype Ready' },
  { value: 'SHOWCASE', label: 'Showcase' },
  { value: 'CONNECTED_WITH_ISDT', label: 'Connected with ISDT' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const SUPPORT_OPTIONS = [
  'Team Members', 'Technical Guidance', 'Software Development', 'Hardware',
  'AI/ML', 'UI/UX', 'Research Guidance', 'Mentorship', 'Other',
];

export const SKILLS = [
  'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'UI/UX',
  'Graphic Design', 'Video Editing', 'Hardware', 'IoT', 'Robotics',
  'Research', 'Content', 'Outreach', 'Other',
];

// Badge color per status (indigo = approved/active, amber = waiting, rose = rejected, violet = ISDT).
export const STATUS_BADGES = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  UNDER_REVIEW: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  APPROVED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  CHANGES_REQUESTED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  IDEA_SUBMITTED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  TEAM_FORMATION: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  DEVELOPMENT: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  TESTING: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  PROTOTYPE_READY: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  SHOWCASE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CONNECTED_WITH_ISDT: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  COMPLETED: 'bg-emerald-600 text-white ring-emerald-600',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value;

// Mirrors backend/src/config/constants.js PROJECT_STATUS_TRANSITIONS (UI hints only —
// the server enforces these; nothing else is accepted).
export const PROJECT_STATUS_TRANSITIONS = {
  IDEA_SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED'],
  APPROVED: ['TEAM_FORMATION'],
  TEAM_FORMATION: ['DEVELOPMENT'],
  DEVELOPMENT: ['TESTING'],
  TESTING: ['PROTOTYPE_READY'],
  PROTOTYPE_READY: ['SHOWCASE'],
  SHOWCASE: ['CONNECTED_WITH_ISDT', 'COMPLETED'],
  CONNECTED_WITH_ISDT: ['COMPLETED'],
  COMPLETED: [],
};

export const MEMBERSHIP_STATUSES = [
  { value: 'PENDING', label: 'Pending review' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'REJECTED', label: 'Not selected' },
];
