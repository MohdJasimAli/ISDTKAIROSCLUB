// Backend mirror of frontend/src/utils/constants.js — keep in sync.
export const IDEA_CATEGORIES = [
  'WEB_DEVELOPMENT', 'APP_DEVELOPMENT', 'AI_ML', 'DATA_SCIENCE', 'IOT',
  'ROBOTICS', 'HARDWARE', 'EMBEDDED_SYSTEMS', 'CYBERSECURITY', 'CLOUD',
  'AUTOMATION', 'RESEARCH', 'SOCIAL_IMPACT', 'PRODUCT_DEVELOPMENT', 'OTHER',
];

export const IDEA_STAGES = [
  'JUST_AN_IDEA', 'RESEARCHING', 'PROTOTYPE_IN_PROGRESS', 'MVP_READY', 'TESTING',
];

export const SUPPORT_OPTIONS = [
  'Team Members', 'Technical Guidance', 'Software Development', 'Hardware',
  'AI/ML', 'UI/UX', 'Research Guidance', 'Mentorship', 'Other',
];

export const PROJECT_STATUSES = [
  'IDEA_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'TEAM_FORMATION', 'DEVELOPMENT',
  'TESTING', 'PROTOTYPE_READY', 'SHOWCASE', 'CONNECTED_WITH_ISDT', 'COMPLETED',
];

// Allowed forward transitions (admin can pick any of these; nothing else).
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
