import { prisma } from '../lib/prisma.js';
import { cleanupExpiredSessions } from '../domain/auth/session.service.js';

async function main() {
  console.info('🧹 Purging expired and revoked sessions...');
  const deletedCount = await cleanupExpiredSessions();
  console.info(`✅ Successfully purged ${deletedCount} session records.`);
}

main()
  .catch((err) => {
    console.error('❌ Failed to clean up sessions:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
