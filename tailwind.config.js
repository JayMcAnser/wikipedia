module.exports = {
  // explain to no interference with existing sheets: https://www.youtube.com/watch?v=oG6XPy1t1KA
  prefix: 'mk-',
  purge: {
    enabled: true,
    content: ["templates/*.html"],
  },
  darkMode: false, // or 'media' or 'class'
  corePlugins: {
    preflight: false
  },
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
