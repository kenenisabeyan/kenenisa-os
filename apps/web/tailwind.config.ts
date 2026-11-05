import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Official Kenenisa OS Brand Palette
        brand: {
          cyan: '#20B5D6',     // System intelligence, technology & primary brand identity
          orange: '#FE721D',   // Active action, energy & call-to-action
          blue: '#20B5D6',     // Actions & navigation
          indigo: '#0b7994',   // Active states & focus
          purple: '#20B5D6',   // Intelligence Core & AI advisory
          gold: '#FE721D',     // Highlights & achievements
          green: '#22C55E',    // Success, completed & healthy
          bgLight: '#F8FAFC',  // Primary light application background
        },
        bgLight: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 8px 16px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
