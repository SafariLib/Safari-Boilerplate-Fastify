/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    moduleNameMapper: {
        '^@root/(.*)$': '<rootDir>/$1',
        '^@utils$': '<rootDir>/src/utils',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
    },
};
