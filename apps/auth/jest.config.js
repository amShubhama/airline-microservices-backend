process.env.JWT_KEY = process.env.JWT_KEY || 'testSecretKey';
process.env.JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/migrations/**', '!src/seeders/**', '!src/config/**'],
  coverageDirectory: 'coverage',
  verbose: true,
};
