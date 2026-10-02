/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Cormorant Garamond"', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'] },
      colors: {
        cream: { DEFAULT: '#FAF6EF', 50: '#FFFDF9', 100: '#F6EDE1', 200: '#EBE2D5' },
        espresso: { DEFAULT: '#1F1814', 800: '#33261D', 700: '#4A3526' },
        nude: { DEFAULT: '#B98F72', light: '#EBD5C1', 300: '#D8B9A0', dark: '#A8764F' },
        ink: { DEFAULT: '#2B2019', body: '#3A2E26', muted: '#8A7C6F' },
      },
      boxShadow: { card: '0 2px 4px rgba(90,62,42,.04),0 10px 28px rgba(90,62,42,.06)', lift: '0 18px 40px rgba(43,32,25,.18)' },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { transform: 'translateX(40px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
        pop: { from: { opacity: 0, transform: 'translateY(-6px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-up': 'fadeUp .5s ease both', 'slide-in': 'slideIn .3s ease both', pop: 'pop .18s ease both' },
    },
  },
  plugins: [],
};
