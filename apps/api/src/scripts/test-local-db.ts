import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../utils/password.js';

// Test with local postgres
const localUrl = 'postgresql://postgres:postgres@localhost:5432/kenenisa_os?schema=public';
console.log('Testing connection to:', localUrl);

const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: localUrl,
    },
  },
  log: ['error'],
});

async function testLocal() {
  try {
    const users = await prismaLocal.user.findMany();
    console.log('LOCAL POSTGRES USERS COUNT:', users.length);
    for (const u of users) {
      console.log('User:', {
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      });
      console.log("Matches 'kenenisa@077215':", await verifyPassword(u.passwordHash, 'kenenisa@077215'));
      console.log("Matches 'kenenisa@3072215':", await verifyPassword(u.passwordHash, 'kenenisa@3072215'));
    }
  } catch (e) {
    console.error('Error connecting to local postgres:', e.message);
  } finally {
    await prismaLocal.$disconnect();
  }
}

testLocal();
