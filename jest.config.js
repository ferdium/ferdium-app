/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/internal-api'],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['src/', 'test/'],

  // The test environment that will be used for testing
  // testEnvironment: "jest-environment-node",
  testEnvironment: 'node',

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/recipes/',
    // TODO: Need to unignore tests
    '/src/internal-server',
  ],

  transform: {
    '^.+\\.tsx?$': 'esbuild-runner/jest',
    '^.+\\.ts?$': 'esbuild-runner/jest',
  },
};
