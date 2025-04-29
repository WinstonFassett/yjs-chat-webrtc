/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dae5',
          300: '#adbace',
          400: '#8094b3',
          500: '#5e7798',
          600: '#475f7f',
          700: '#394c67',
          800: '#324157',
          900: '#2c384a',
          950: '#1a2130',
        },
        dark: {
          100: '#d5d6db',
          200: '#aaadb7',
          300: '#808593',
          400: '#555c6f',
          500: '#2b334b',
          600: '#22293c',
          700: '#1a1f2d',
          800: '#11141e',
          900: '#090a0f',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};