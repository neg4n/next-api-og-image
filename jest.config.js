/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/*'],
  coverageReporters: ['html', 'json', 'lcov'],
  testPathIgnorePatterns: ['/__utils__/'],
  testTimeout: 10000,
}
