/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0A0A',
          900: '#070707',
          800: '#0A0A0A',
          700: '#121212',
        },
        graphite: {
          DEFAULT: '#171717',
          card: '#141414',
          border: '#242424',
          subtle: '#2A2A2A',
        },
        warm: {
          white: '#F5F5F2',
          DEFAULT: '#F5F5F2',
        },
        muted: {
          DEFAULT: '#A3A3A3',
          dark: '#737373',
          light: '#CCCCCC',
        },
        accent: {
          gold: '#D6A84F',
          goldHover: '#C49740',
          goldMuted: 'rgba(214, 168, 79, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.025em',
        tight: '-0.015em',
        wideTracking: '0.15em',
        eyebrow: '0.2em',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        editorial: '1360px',
        prose: '680px',
      },
      boxShadow: {
        subtle: '0 4px 24px -2px rgba(0, 0, 0, 0.45)',
        focusGold: '0 0 0 2px rgba(214, 168, 79, 0.4)',
      },
    },
  },
  plugins: [],
}
