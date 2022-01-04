module.exports = {
  mode: 'jit',
  content: [
    'temp/*.html',
    'templates/index.surface.html'
  ],
  corePlugins: {
    preflight: false,
    divideStyle: true,
  },
  prefix: 'mk-',
  theme: {
    fontSize: {
      'hdr': ['1.625rem', {
        'lineHeight': '32px'
      }]
    },
    fontFamily: {
      body: ['Arial', 'Helvetica']
    },
    extend: {},
  },
  plugins: [],
}

