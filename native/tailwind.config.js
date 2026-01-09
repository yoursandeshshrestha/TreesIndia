/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['OpenSans-Regular'],
        medium: ['OpenSans-Medium'],
        semibold: ['OpenSans-SemiBold'],
        bold: ['OpenSans-Bold'],
      },
    },
  },
  plugins: [],
};

