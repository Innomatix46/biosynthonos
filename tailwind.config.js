/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#111827',
        'brand-blue': '#38bdf8', // sky-400
        'brand-green': '#34d399', // emerald-400
        'brand-yellow': '#facc15', // yellow-400
        'brand-pink': '#ec4899', // pink-500
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
