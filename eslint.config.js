const expo = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['node_modules/**', '.expo/**', 'android/**', 'ios/**', 'dist/**'] },
  ...(Array.isArray(expo) ? expo : [expo]),
  {
    settings: {
      react: { version: '19' },
    },
  },
];
