/** @type {import('tailwindcss').Config} */
import { colors } from './tokens';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      text: {
        // TODO: add typography tokens
        base: '14px',
        scale: 1.2,
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
    },
    colors: { ...colors, transparent: 'transparent' },
  },
  plugins: [require('tailwindcss-animate')],
};
