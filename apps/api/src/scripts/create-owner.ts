import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';
import { createOwnerSchema } from '@kenenisa-os/shared';
import { UserRole, TaskPriority } from '@prisma/client';

/**
 * Secure Owner Account Provisioning / Bootstrap Script.
 * Reads credentials from environment variables or command-line arguments.
 * Uses a Prisma $transaction to atomically initialize the OWNER user and UserSettings.
 */
async function bootstrapOwner() {
  console.info('🔒 Starting KENENISA OS Owner Account Provisioning...');

  const inputEmail = process.env.OWNER_EMAIL || process.argv[2] || 'beyankenenisa@gmail.com';
  const inputPassword =
    process.env.OWNER_PASSWORD || process.argv[3] || 'kenenisa@3072215';
  const inputFirstName = process.env.OWNER_FIRST_NAME || process.argv[4] || 'Kenenisa';
  const inputLastName = process.env.OWNER_LAST_NAME || process.argv[5] || 'Beyan';
  const inputDisplayName = `${inputFirstName} ${inputLastName}`.trim();

  // Validate payload against centralized schema
  const parsed = createOwnerSchema.parse({
    email: inputEmail,
    password: inputPassword,
    firstName: inputFirstName,
    lastName: inputLastName,
    displayName: inputDisplayName,
  });

  const passwordHash = await hashPassword(parsed.password);

  // Execute inside a database transaction to prevent partial initialization
  const ownerUser = await prisma.$transaction(async (tx) => {
    // If an existing owner had the old default email, migrate them to preserve all their data
    const oldUser = await tx.user.findUnique({
      where: { email: 'beyankenenisa@kenenisa.com' },
    });
    if (oldUser && parsed.email !== 'beyankenenisa@kenenisa.com') {
      const existingNew = await tx.user.findUnique({ where: { email: parsed.email } });
      if (!existingNew) {
        return await tx.user.update({
          where: { id: oldUser.id },
          data: {
            email: parsed.email,
            passwordHash,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            displayName: parsed.displayName,
            role: UserRole.OWNER,
            isActive: true,
          },
        });
      }
    }

    const user = await tx.user.upsert({
      where: { email: parsed.email },
      update: {
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        displayName: parsed.displayName,
        role: UserRole.OWNER,
        isActive: true,
      },
      create: {
        email: parsed.email,
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        displayName: parsed.displayName,
        role: UserRole.OWNER,
        isActive: true,
      },
    });

    await tx.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        timezone: 'Africa/Addis_Ababa',
        weekStartsOn: 1,
        dailyWorkCapacityMinutes: 480,
        weeklyWorkCapacityMinutes: 2400,
        defaultTaskPriority: TaskPriority.P2,
        defaultProjectView: 'board',
        theme: 'dark',
      },
    });

    return user;
  });

  console.info(
    `✅ OWNER account successfully provisioned: ${ownerUser.email} (ID: ${ownerUser.id})`,
  );
}

bootstrapOwner()
  .catch((err) => {
    console.error('❌ Failed to bootstrap owner account:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
