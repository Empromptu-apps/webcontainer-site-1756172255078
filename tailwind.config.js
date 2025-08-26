/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tiny Habits Brand Colors
        brand: {
          main: '#007f5f',      // Main brand color
          secondary: '#c4baa2',  // Secondary brand color
          green1: '#2b9348',     // Other brand colors
          green2: '#55a630',
          green3: '#80b918',
          green4: '#aacc00',
          brown: '#57553e',
          accent: '#00b652',
        },
        primary: {
          50: '#f0f9f6',
          100: '#dcf2ea',
          200: '#bce5d6',
          300: '#8dd1ba',
          400: '#5ab89a',
          500: '#007f5f',  // Main brand color
          600: '#007f5f',
          700: '#006b50',
          800: '#005741',
          900: '#004835',
        },
        secondary: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#ebe7dd',
          300: '#ddd7c9',
          400: '#c4baa2',  // Secondary brand color
          500: '#c4baa2',
          600: '#b5a88d',
          700: '#a0937a',
          800: '#8b7f68',
          900: '#786c57',
        }
      }
    },
  },
  plugins: [],
}
