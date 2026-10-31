import { prisma } from '../lib/prisma.js';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  try {
    console.log('🔄 Applying Academic Semester & Course migration to PostgreSQL...');
    const sqlPath = path.resolve('prisma/migrations/20261031000000_add_academic_courses_and_semesters/migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split sql statements by semicolon, avoiding empty lines
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err: unknown) {
        // If type or table already exists, continue gracefully
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists')) {
          console.log('⚠️ Notice:', msg.split('\n')[0]);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Academic migration statements executed successfully!');

    // Verify tables exist
    const verify: Array<{ table_name: string }> = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_name IN ('AcademicSemester', 'AcademicCourse');`
    );
    console.log('Verified tables in DB:', verify.map((t) => t.table_name));
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

