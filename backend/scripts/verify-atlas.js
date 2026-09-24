// Production readiness check — reads backend/.env via dotenv, prints ONLY
// booleans/counts (never the connection string or password).
// Usage: node scripts/verify-atlas.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL || '';
  const isAtlas = url.includes('mongodb+srv://');
  console.log('[verify] target:', isAtlas ? 'Atlas SRV ✅' : 'NOT an Atlas string ❌');

  const collections = await prisma.$runCommandRaw({ listCollections: 1 });
  const names = (collections.cursor.firstBatch || []).map((c) => c.name).sort();
  console.log(`[verify] collections (${names.length}): ${names.join(', ')}`);

  const users = await prisma.user.count();
  const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
  console.log(`[verify] users=${users} admins=${admins}`);

  let uniqueEmail = false;
  try {
    const idx = await prisma.$runCommandRaw({ listIndexes: 'users' });
    uniqueEmail = (idx.cursor.firstBatch || []).some((i) => i.unique === true && i.key && i.key.email === 1);
  } catch {
    uniqueEmail = false;
  }
  console.log('[verify] users.email unique index:', uniqueEmail ? 'present ✅' : 'MISSING ❌');

  const ready = isAtlas && names.length >= 10 && admins >= 1 && uniqueEmail;
  console.log(ready ? '[verify] PRODUCTION READY ✅' : '[verify] NOT READY ❌');
}

main()
  .catch((e) => {
    console.error('[verify] ERROR:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
