module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        serviceworker: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    ignorePatterns: ['dist/', 'coverage/'],
    extends: ['eslint:recommended'],
    rules: {
        'no-console': 'off',
        'no-empty': ['warn', { allowEmptyCatch: true }],
        'no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            caughtErrors: 'none',
            varsIgnorePattern: '^_'
        }]
    }
};
