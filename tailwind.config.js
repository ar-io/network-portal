/** @type {import('tailwindcss').Config} */
import { colors } from './tokens';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // or 'media' or 'class
  theme: {
    extend: {
      text: {
        // TODO: add typography tokens
        base: '14px',
        scale: 1.2,
      },
    },
    colors,
  },
  plugins: [require('tailwindcss-animate')],
};
