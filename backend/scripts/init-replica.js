// One-time (idempotent) replica-set initiation for the project-local mongod.
// Prisma's MongoDB connector requires a replica set even for basic writes.
// Run from backend/: node scripts/init-replica.js
import { MongoClient } from 'mongodb';

const url = process.env.REPLICA_URL || 'mongodb://127.0.0.1:27018/?directConnection=true';

async function main() {
  const client = new MongoClient(url);
  await client.connect();
  try {
    const admin = client.db('admin');
    try {
      await admin.command({ replSetGetStatus: 1 });
      console.log('[init-replica] Replica set already initiated.');
    } catch {
      await admin.command({
        replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27018' }] },
      });
      console.log('[init-replica] Replica set rs0 initiated — primary election in progress.');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('[init-replica] Failed:', err.message);
  process.exit(1);
});
