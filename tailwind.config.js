module.exports = {
  prefixXX: 'mk-',
  purge: {
    enabled: true,
    content: ["templates/*.html"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'daily-dev-tips': "#F89283"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
