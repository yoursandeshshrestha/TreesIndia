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
        sans: ['Inter-Regular', 'System'],
        medium: ['Inter-Medium', 'System'],
        semibold: ['Inter-SemiBold', 'System'],
        bold: ['Inter-Bold', 'System'],
      },
    },
  },
  plugins: [],
};

