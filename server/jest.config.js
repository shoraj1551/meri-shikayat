export default {
    transform: {},
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/test/harness/environment.cjs'],
    setupFilesAfterEnv: ['<rootDir>/test/harness/unit-setup.js'],
    testMatch: [
        '<rootDir>/src/__tests__/utils/**/*.test.js',
        '<rootDir>/src/__tests__/middleware/rbac.test.js',
        '<rootDir>/src/__tests__/services/**/*.test.js',
        '<rootDir>/test/harness/**/*.unit.test.js'
    ],
    collectCoverageFrom: ['src/**/*.js', '!src/__tests__/**', '!src/index.js'],
    coverageDirectory: 'coverage/unit',
    coverageReporters: ['text', 'lcov', 'html'],
    clearMocks: true,
    maxWorkers: 2,
    restoreMocks: true,
    verbose: true,
    testTimeout: 10000
};
