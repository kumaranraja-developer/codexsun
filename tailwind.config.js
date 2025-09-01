/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    './apps/**/*.{html,js,ts,jsx,tsx}',
    './sites/**/*.{html,js,ts,jsx,tsx}',
    './cortex/**/*.{html,j2,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
