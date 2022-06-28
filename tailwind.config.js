/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ["./src/**/*.{js,jsx}"],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  plugins: [],
}
