import { z } from 'zod';

/**
 * Centralized Password Policy Constants
 */
export const PASSWORD_MIN_LENGTH = 12;

/**
 * Password validation schema.
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);

/**
 * Email validation and normalization schema.
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .transform((val) => val.trim().toLowerCase());

/**
 * Login request payload schema.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Owner account bootstrap / creation schema.
 */
export const createOwnerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').default('Kenenisa'),
  lastName: z.string().min(1, 'Last name is required').default('Beyan'),
  displayName: z.string().min(1, 'Display name is required').default('Kenenisa Beyan'),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
