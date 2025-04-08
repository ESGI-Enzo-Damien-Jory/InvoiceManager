module.exports = {
  testPathIgnorePatterns: ['/end_to_end/'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['app/**/*.{js,jsx,ts,tsx}', '!**/__tests__/**'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
