/**
 * @fileoverview Babel Configuration
 * @description Babel configuration for Jest testing environment
 * @author Cashify Development Team
 * @version 1.0.0
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs',
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
            modules: 'commonjs',
          },
        ],
      ],
    },
  },
};

console.log('✅ Babel configuration loaded!');
