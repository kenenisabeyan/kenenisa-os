export const config = {
  appName: 'KENENISA OS',
  appDescription: 'Personal Engineering & Career Operating System',
  apiBaseUrl: (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '')}/api/v1`
      : 'http://localhost:3000/api/v1')
  ),
  env: import.meta.env.MODE || 'development',
} as const;
