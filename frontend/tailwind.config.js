/** @type {import('tailwindcss').Config} */
export default {
  // relative: true → paths resolve against this config file, not process.cwd().
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{js,jsx}'],
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 12px 32px -16px rgba(16,24,40,.18)',
        'card-hover': '0 2px 4px rgba(16,24,40,.06), 0 20px 40px -18px rgba(79,70,229,.35)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          from: { transform: 'translateY(10px)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.65' },
        },
      },
      animation: {
        'fade-up': 'fade-up .45s ease-out both',
        rise: 'rise .45s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .4s ease-out both',
        'scale-in': 'scale-in .35s ease-out both',
        'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
