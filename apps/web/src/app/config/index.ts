export const config = {
  appName: 'KENENISA OS',
  appDescription: 'Personal Engineering & Career Operating System',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  env: import.meta.env.MODE || 'development',
} as const;
