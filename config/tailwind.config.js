const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        glacial: ['GlacialIndifference', 'serif'],
        'glacial-bold': ['GlacialIndifferenceBold', 'serif'],
      },
      colors: {
        tpmemo_pink: 'var(--calleo-pink)',
        tpmemo_text_blue: 'var(--calleo-text-blue)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ]
}
