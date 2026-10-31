import { prisma } from '../lib/prisma.js';

async function main() {
  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`
    );
    console.log('Database tables count:', tables.length);
    console.log('Tables:', tables.map((t) => t.table_name).join(', '));

    const migrations = await (
      prisma.$queryRawUnsafe(
        `SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;`
      ) as Promise<Array<{ migration_name: string; finished_at: string }>>
    ).catch(() => [] as Array<{ migration_name: string; finished_at: string }>);
    console.log('Migrations count:', migrations.length);
    console.log('Migrations:', migrations);
  } catch (err) {
    console.error('Check error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
