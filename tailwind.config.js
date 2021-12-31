module.exports = {
  mode: 'jit',
  content: [
    'temp/*.html',
    'templates/index.surface.html'
  ],
  corePlugins: {
    preflight: false
  },
  prefix: 'mk-',
  theme: {
    extend: {},
  },
  plugins: [],
}

