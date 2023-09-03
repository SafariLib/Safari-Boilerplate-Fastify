/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    roots: ['<rootDir>/test', '<rootDir>/src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@utils$': '<rootDir>/src/utils',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@types$': '<rootDir>/src/types',
    },
};
