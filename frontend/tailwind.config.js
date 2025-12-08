/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        secondary: {
          DEFAULT: '#f093fb',
          dark: '#f5576c',
        },
        accent: {
          DEFAULT: '#4facfe',
          dark: '#00f2fe',
        },
        dark: {
          bg: '#0f0f23',
          card: '#1a1a2e',
          border: '#2d2d44',
        },
      },
    },
  },
  plugins: [],
};
