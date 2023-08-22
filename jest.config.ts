/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    roots: ['<rootDir>/test', '<rootDir>/src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config$': '<rootDir>/src/config',
        '^@controllers$': '<rootDir>/src/controllers',
        '^@plugins$': '<rootDir>/src/plugins',
        '^@services$': '<rootDir>/src/services',
        '^@types$': '<rootDir>/src/types',
        '^@schemas$': '<rootDir>/src/schemas',
    },
};
