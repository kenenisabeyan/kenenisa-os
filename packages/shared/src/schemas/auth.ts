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

/**
 * Change password schema.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Forgot email / account lookup request schema.
 */
export const forgotEmailSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name or display name'),
});

export type ForgotEmailInput = z.infer<typeof forgotEmailSchema>;

/**
 * Forgot password request schema.
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request schema.
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: z.string().min(1, 'Reset code is required').trim(),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Create user payload schema (Owner / Admin user creation).
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'USER']).default('USER'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Update user payload schema.
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  displayName: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Self profile update schema.
 */
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  displayName: z.string().trim().min(1, 'Display name cannot be empty').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * User Settings update schema.
 */
export const updateUserSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required').optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  dailyWorkCapacityMinutes: z.number().int().min(30).max(1440).optional(),
  weeklyWorkCapacityMinutes: z.number().int().min(60).max(10080).optional(),
  defaultTaskPriority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  defaultProjectView: z.enum(['board', 'list']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;


