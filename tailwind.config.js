/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    fontFamily:{
      'orbitron': ['Orbitron', 'sans-serif'],
      'quantico': ['Quantico', 'sans-serif'],
      'raleway-dots': ['Raleway Dots', 'sans-serif'],
      'roboto-mono': ['Roboto Mono', 'monospace']
    },
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
    },
  },
  plugins: [],
}