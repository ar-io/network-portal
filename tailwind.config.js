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
      boxShadow: {
        one: '0px 0px 0px 16px rgba(14, 14, 15, 0.70)',
      },
    },
    colors: {
      ...colors,
      transparent: 'transparent',
      'gradient-primary-start': '#F7C3A1',
      'gradient-primary-end': '#DF9BE8',
      'gradient-red-start': '#FFB4B4',
      'gradient-red-end': '#FF6C6C',
      'btn-primary-base': '#0e0e0f',
      'btn-primary-gradient-start': 'rgba(102, 102, 102, 0.06)',
      'btn-primary-gradient-end': 'rgba(0, 0, 0 0.06)',
      'btn-primary-outer-gradient-start': '#EEB3BFA3',
      'btn-primary-outer-gradient-end': '#DF9BE808',
      'btn-secondary-default': '#212124',
      divider: '#232329',
      // these correspond to textHigh, textMid, textLow
      high: '#CACAD6',
      mid: '#A3A3AD',
      low: '#7F7F87',
      link: '#A3A3AD',
      containerL0: '#09090A',
      containerL3: '#1E1E24',
      'streak-up': '#3DB7C2',
      'text-red': '#DB4354',
      warning: '#ffb938',
      'stroke-low': 'rgba(202, 202, 214, 0.08)',
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
    require('tailwindcss-animate'),
  ],
};
