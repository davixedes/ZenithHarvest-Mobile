const expo = require('eslint-config-expo/flat');

module.exports = [
  ...(Array.isArray(expo) ? expo : [expo]),
  {
    ignores: ['node_modules/**', '.expo/**', 'android/**', 'ios/**', 'dist/**'],
  },
];
