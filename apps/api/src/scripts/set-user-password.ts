import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { AuthService } from '../domain/auth/auth.service.js';

async function updatePassword() {
  const targetEmail = 'beyankenenisa@gmail.com';
  const newPassword = 'kenenisa@077215';

  console.log(`Setting password for ${targetEmail} to: ${newPassword}`);
  const newHash = await hashPassword(newPassword);

  const updatedUser = await prisma.user.upsert({
    where: { email: targetEmail },
    update: {
      passwordHash: newHash,
      isActive: true,
      role: 'OWNER',
    },
    create: {
      email: targetEmail,
      passwordHash: newHash,
      firstName: 'Kenenisa',
      lastName: 'Beyan',
      displayName: 'Kenenisa Beyan',
      role: 'OWNER',
      isActive: true,
    },
  });

  console.log('User updated:', {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    isActive: updatedUser.isActive,
  });

  // Verify the hash
  const isValid = await verifyPassword(updatedUser.passwordHash, newPassword);
  console.log('Verify password direct check:', isValid);

  // Test AuthService.login with the new credentials
  try {
    const loginResult = await AuthService.login({
      email: targetEmail,
      password: newPassword,
    });
    console.log('AuthService.login succeeded!', {
      userId: loginResult.user.id,
      email: loginResult.user.email,
      role: loginResult.user.role,
      tokenLength: loginResult.rawToken.length,
    });
  } catch (err) {
    console.error('AuthService.login failed:', err);
  }
}

updatePassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
