/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        // Enligt projektreglerna: minst 17px brödtext på mobil, 16px på laptop
        'body-mobile': ['17px', '26px'],
        'body-desktop': ['16px', '24px'],
        'heading-lg': ['24px', '32px'],
        'heading-xl': ['28px', '36px'],
      },
      colors: {
        stall: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
