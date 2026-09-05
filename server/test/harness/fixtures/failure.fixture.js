import { parsePaginationParams } from '../../../src/utils/pagination.js';
test('intentional regression proves the CI command fails', () => {
    expect(parsePaginationParams({ query: { page: '2' } }).page).toBe(999);
});
