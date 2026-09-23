import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed --workspace=backend
// Never commit real credentials — set them in backend/.env (gitignored).
async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@kairos.club').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password === 'CHANGE_ME') {
    console.warn('[seed] ADMIN_PASSWORD not set (or still CHANGE_ME) — skipping admin seed.');
    console.warn('[seed] Set ADMIN_EMAIL + ADMIN_PASSWORD in backend/.env, then re-run.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // find + create/update instead of upsert: upsert needs a MongoDB replica set
  // (transactions), and this seed must work on a standalone dev server too.
  const existing = await prisma.user.findUnique({ where: { email } });
  const data = {
    name: process.env.ADMIN_NAME || 'Kairos Admin',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  };
  const user = existing
    ? await prisma.user.update({ where: { email }, data })
    : await prisma.user.create({
        data: {
          ...data,
          email,
          department: 'Computer Science',
          year: 'Faculty',
        },
      });
  console.log(`[seed] Admin ready: ${user.email} (id ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
