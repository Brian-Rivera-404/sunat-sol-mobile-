/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        navy: '#0A2240',
        'navy-mid': '#0D3060',
        'blue-sunat': '#1B4FBF',
        'blue-lt': '#2563EB',
        'orange-sunat': '#E85E1E',
        gold: '#F4C430',
        'bg-sunat': '#EEF2FF',
        'green-sunat': '#16A34A',
        'green-bg': '#DCFCE7',
        'red-sunat': '#DC2626',
        'red-bg': '#FEE2E2',
        'amber-sunat': '#D97706',
        'amber-bg': '#FEF3C7',
      },
    },
  },
  plugins: [],
};
