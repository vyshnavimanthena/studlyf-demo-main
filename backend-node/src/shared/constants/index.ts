export const ROLES = {
  STUDENT: 'student',
  INSTITUTION: 'institution',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  JUDGE: 'judge',
  MENTOR: 'mentor',
  HIRING_PARTNER: 'hiring_partner',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
};
