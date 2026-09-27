process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3002';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/migrations/**', '!src/seeders/**', '!src/config/**'],
  coverageDirectory: 'coverage',
  verbose: true,
};
