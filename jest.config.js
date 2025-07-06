/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Point to the root of the source code for module resolution
  moduleDirectories: ['node_modules', 'src'],
};
