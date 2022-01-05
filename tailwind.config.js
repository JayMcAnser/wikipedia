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
      }],
      'body': ['1rem'],
      'year': ['0.90rem']
    },
    fontFamily: {
      hdr: ['Arial', 'Helvetica'],
      body: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'Times', 'serif']
    },
    extend: {},
  },
  plugins: [],
}

