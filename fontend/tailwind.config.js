/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#030916',
        sidebar: '#040B18',
        surface: '#071329',
        'surface-raised': '#09172E',
        input: '#08162B',
        primary: {
          DEFAULT: '#693BFF',
          hover: '#8057FF',
          active: '#5429E8',
          highlight: '#A875FF',
          tinted: '#17143B',
        },
        border: {
          DEFAULT: '#172A48',
          strong: '#22436D',
          primary: '#6037D9',
        },
        rating: '#FFB52E',
      },
    },
  },
  plugins: [],
};
