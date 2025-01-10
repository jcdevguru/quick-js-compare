import { pathsToModuleNameMapper } from 'ts-jest';
import JSON5 from 'json5';
import fs from 'fs';

const tsconfig = JSON5.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
const { compilerOptions } = tsconfig;

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
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
};

export default config;
