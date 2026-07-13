/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#F7F6F2',
        ink: '#1F201C',
        vellum: '#EAE3D8',
        plum: '#755469',
      },
    },
  },
  plugins: [],
};
