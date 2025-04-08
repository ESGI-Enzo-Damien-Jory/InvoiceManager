module.exports = {
  collectCoverage: true,
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/*.config.js',
    '!**/.*',
    '!server.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
