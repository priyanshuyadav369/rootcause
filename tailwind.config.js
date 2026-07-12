/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14261A',
          light: '#1E3527',
        },
        paper: {
          DEFAULT: '#F5F2E6',
          dark: '#EBE6D4',
        },
        moss: {
          DEFAULT: '#3B6142',
          light: '#E4E8D6',
          dark: '#28472E',
        },
        gold: {
          DEFAULT: '#D9A62E',
          light: '#F0CD7C',
        },
        alert: {
          DEFAULT: '#9C3B2E',
          light: '#F3DCD6',
        },
      },
      fontFamily: {
        display: ['"Spectral"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '4px',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
