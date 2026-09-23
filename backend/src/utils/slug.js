/** URL-safe slug from a title; uniqueness handled by callers. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

/** Returns a slug that isn't taken yet, appending -2, -3, … as needed. */
export async function uniqueSlug(prisma, model, base, excludeId = null) {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i < 50; i += 1) {
    const existing = await prisma[model].findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}
