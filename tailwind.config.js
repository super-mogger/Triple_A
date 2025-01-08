/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          primary: '#2DD4BF',
          text: '#E5E7EB',
          'text-secondary': '#9CA3AF',
        }
      }
    },
  },
  plugins: [],
}
