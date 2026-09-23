// Safe fields to return to clients (never passwordHash).
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  year: true,
  phone: true,
  bio: true,
  skills: true,
  interests: true,
  githubUrl: true,
  linkedinUrl: true,
  membershipStatus: true,
  isActive: true,
  createdAt: true,
};

export function pickPublic(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
