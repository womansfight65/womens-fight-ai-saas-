import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        /* Woman's Fight brand ramp: pink -> purple -> blue */
        brand: {
          pink: '#EC4899',
          fuchsia: '#D946A6',
          purple: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
        },
        ink: {
          DEFAULT: '#12101A',
          soft: '#3B3A47',
          muted: '#6B6A7B',
          faint: '#9A98A8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FBFAFD',
          muted: '#F5F3F9',
          sunken: '#EFEDF5',
        },
        line: {
          DEFAULT: '#E9E6F0',
          strong: '#DCD8E8',
        },
        state: {
          success: '#12A150',
          warning: '#C08A00',
          danger: '#DC2626',
          info: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
        bangla: ['var(--font-bangla)', 'var(--font-sans)', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        'display-md': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.04', letterSpacing: '-0.035em' }],
        'display-xl': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(18,16,26,0.04), 0 8px 24px -12px rgba(18,16,26,0.10)',
        lift: '0 2px 4px rgba(18,16,26,0.04), 0 18px 40px -18px rgba(18,16,26,0.18)',
        glow: '0 18px 60px -22px rgba(139,92,246,0.55)',
        ring: '0 0 0 1px rgba(233,230,240,1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(100deg, #EC4899 0%, #8B5CF6 52%, #3B82F6 100%)',
        'brand-gradient-soft':
          'linear-gradient(100deg, rgba(236,72,153,0.12) 0%, rgba(139,92,246,0.12) 52%, rgba(59,130,246,0.12) 100%)',
        'grid-faint':
          'linear-gradient(to right, rgba(18,16,26,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,16,26,0.045) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.45' },
          '40%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'dot-bounce': 'dot-bounce 1.2s infinite ease-in-out',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.22,1,0.36,1) both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
