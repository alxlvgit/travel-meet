/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.{html,ejs}',
    "./static/**/*.js",],
  theme: {
    fontFamily: {
      'sans': ['Quicksand', 'sans-serif']
    },
    colors: {
      button: {
        DEFAULT: '#A7B030',
        hover: '#878D26',
        active: '#8C9A28'
      },
      extend: {},
    },
    plugins: [],
  }
}

