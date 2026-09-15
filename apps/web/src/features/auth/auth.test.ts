import { describe, it, expect } from 'vitest';
import { loginSchema, createOwnerSchema } from '@kenenisa-os/shared';

describe('Frontend Auth Schemas and Policies', () => {
  it('validates login input correctly', () => {
    const valid = loginSchema.safeParse({
      email: 'kenenisa@kenenisa-os.internal',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('enforces minimum 12 character password on owner creation schema', () => {
    const shortPassword = createOwnerSchema.safeParse({
      email: 'owner@kenenisa-os.internal',
      password: 'short',
      firstName: 'Kenenisa',
      lastName: 'Beyan',
      displayName: 'Kenenisa Beyan',
    });
    expect(shortPassword.success).toBe(false);

    const validOwner = createOwnerSchema.safeParse({
      email: 'owner@kenenisa-os.internal',
      password: 'KenenisaOS#2026!ValidPassword',
      firstName: 'Kenenisa',
      lastName: 'Beyan',
      displayName: 'Kenenisa Beyan',
    });
    expect(validOwner.success).toBe(true);
  });
});
