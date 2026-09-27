const js = require('@eslint/js');
const globals = require('globals');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2021,
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^(req|res|next|_|queryInterface|Sequelize)',
          varsIgnorePattern: '^_',
        },
      ],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-self-compare': 'error',
      'no-cond-assign': ['error', 'always'],

      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'no-throw-literal': 'error',

      curly: ['error', 'multi-line'],
      'no-unreachable': 'error',
      'default-case-last': 'error',
      'no-lonely-if': 'warn',
      'no-useless-return': 'warn',

      'prefer-template': 'warn',
      'no-useless-concat': 'error',
      'no-unneeded-ternary': 'error',
      'object-shorthand': ['warn', 'always', { avoidQuotes: true }],
      'no-duplicate-imports': 'error',
      'no-debugger': 'error',
      'no-console': 'off',
      'no-undef': 'error',
    },
  },
  {
    files: ['**/migrations/**', '**/seeders/**'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/.husky/**',
      'package-lock.json',
      'apps/booking/**',
      'apps/notifications/**',
    ],
  },
];
