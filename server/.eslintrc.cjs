module.exports = {
    root: true,
    env: {
        es2022: true,
        node: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    ignorePatterns: ['coverage/', 'uploads/'],
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
