/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./views/**/*.{html,ejs}',
    "./static/**/*.js"],
  theme: {
    fontFamily: {
      'sans': ['Quicksand', 'sans-serif', ...defaultTheme.fontFamily.sans],
    }
  }
}

