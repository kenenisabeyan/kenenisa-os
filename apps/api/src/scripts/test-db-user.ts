import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { prisma } from '../lib/prisma.js';
import { verifyPassword } from '../utils/password.js';

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'UNDEFINED');
  const count = await prisma.user.count();
  console.log('Total users:', count);
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log('User found:', {
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    });
    console.log("Matches 'kenenisa@077215':", await verifyPassword(u.passwordHash, 'kenenisa@077215'));
    console.log("Matches 'kenenisa@3072215':", await verifyPassword(u.passwordHash, 'kenenisa@3072215'));
  }
}

main()
  .catch((e) => {
    console.error('Script error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
