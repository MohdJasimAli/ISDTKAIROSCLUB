// One-off demo-data utility: the Phase 8 status-machine test walked the demo project
// to its terminal COMPLETED state. Reset it to a mid-development state for demos.
// Usage: node scripts/reset-demo-project.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({
    where: { name: 'Campus Lost & Found with QR Tags' },
    select: { id: true, status: true },
  });
  if (!project) {
    console.log('[reset-demo] Demo project not found — nothing to do.');
    return;
  }
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: 'DEVELOPMENT', progress: 40 },
  });
  console.log(`[reset-demo] ${updated.name}: ${project.status} -> ${updated.status} (progress ${updated.progress}%)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
