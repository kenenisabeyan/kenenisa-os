import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { prisma } from '../lib/prisma.js';
import { verifyPassword } from '../utils/password.js';

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log('--- USER ---');
    console.log('ID:', u.id);
    console.log('Email:', u.email);
    console.log('Role:', u.role);
    console.log('isActive:', u.isActive);
    console.log('Password hash:', u.passwordHash);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
