import { z } from 'zod';
import { AUTH_CONFIG } from '../config/auth.js';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(
      AUTH_CONFIG.PASSWORD_MIN_LENGTH,
      `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`,
    ),
});

export const createOwnerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(
      AUTH_CONFIG.PASSWORD_MIN_LENGTH,
      `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`,
    ),
  firstName: z.string().min(1, 'First name is required').default('Kenenisa'),
  lastName: z.string().min(1, 'Last name is required').default('Beyan'),
  displayName: z.string().min(1, 'Display name is required').default('Kenenisa Beyan'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
