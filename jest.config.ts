const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/*.test.ts"
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.[jt]s'],
};

export default config;
