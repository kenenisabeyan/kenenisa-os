import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z
    .string()
    .optional()
    .default('postgresql://postgres:postgres@localhost:5432/kenenisa_os?schema=public'),

  // Security & Session
  SESSION_SECRET: z.string().optional().default('kenenisa-os-default-dev-session-secret-change-in-prod'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // AI Intelligence Core Provider Configuration
  AI_PROVIDER: z.string().default('openai'),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  AI_TIMEOUT_MS: z.coerce.number().default(15000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

// Production security assertion
if (_env.data.NODE_ENV === 'production') {
  if (!_env.data.DATABASE_URL || _env.data.DATABASE_URL.includes('localhost')) {
    console.warn('⚠️ WARNING: Using local or missing DATABASE_URL in production environment.');
  }
}

export const config = _env.data;
export type Config = z.infer<typeof envSchema>;
