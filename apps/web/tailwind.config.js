export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#06b6d4',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                slate: {
                    925: '#05070f',
                    950: '#0a0a0f',
                },
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
            boxShadow: {
                glow: '0 0 20px -5px rgba(6, 182, 212, 0.15)',
                'glow-lg': '0 0 30px -5px rgba(6, 182, 212, 0.25)',
                card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
