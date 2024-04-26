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
    colors: {
      ...colors,
      transparent: 'transparent',
      'gradient-primary-start': '#F7C3A1',
      'gradient-primary-end': '#DF9BE8',
      'btn-primary-base': '#0e0e0f',
      'btn-primary-gradient-start': 'rgba(102, 102, 102, 0.06)',
      'btn-primary-gradient-end': 'rgba(0, 0, 0 0.06)',
      'btn-primary-outer-gradient-start': '#EEB3BFA3',
      'btn-primary-outer-gradient-end': '#DF9BE808',
      divider: '#232329',
      // these correspond to textHigh, textMid, textLow 
      high: '#CACAD6',
      mid: '#A3A3AD',
      low: '#7F7F87',
    },
  },
  plugins: [require('tailwindcss-animate')],
};
