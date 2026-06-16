const expo = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['node_modules/**', '.expo/**', 'android/**', 'ios/**', 'dist/**'] },
  ...(Array.isArray(expo) ? expo : [expo]),
  {
    settings: {
      react: { version: '19' },
    },
    rules: {
      // Regra nova do React Compiler (eslint-plugin-react-hooks v6) que dispara em
      // qualquer effect que chame um loader assíncrono — exatamente o padrão de
      // fetch-on-mount / fetch-on-dependency exigido pela arquitetura de 4 estados
      // (loading/error/empty/content) deste projeto. O setState real ocorre depois
      // do `await`, então não causa o cascading render síncrono que a regra visa
      // evitar. Mantemos `react-hooks/refs` e demais regras ligadas.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
