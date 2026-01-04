/**
 * Pagination Tests
 * Tests for pagination utilities
 */

import { parsePaginationParams, createPaginationMeta, paginateQuery } from '../../../src/utils/pagination.js';

describe('Pagination Utilities', () => {
    describe('parsePaginationParams', () => {
        it('should parse valid pagination parameters', () => {
            const req = {
                query: {
                    page: '2',
                    limit: '50',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                }
            };

            const result = parsePaginationParams(req);

            expect(result).toEqual({
                page: 2,
                limit: 50,
                skip: 50,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
        });

        it('should use defaults for missing parameters', () => {
            const req = { query: {} };

            const result = parsePaginationParams(req);

            expect(result.page).toBe(1);
            expect(result.limit).toBe(20);
            expect(result.skip).toBe(0);
        });

        it('should enforce maximum limit', () => {
            const req = {
                query: {
                    limit: '200'
                }
            };

            const result = parsePaginationParams(req);

            expect(result.limit).toBe(100); // Max limit
        });

        it('should enforce minimum page number', () => {
            const req = {
                query: {
                    page: '-1'
                }
            };

            const result = parsePaginationParams(req);

            expect(result.page).toBe(1);
        });

        it('should default to desc for invalid sortOrder', () => {
            const req = {
                query: {
                    sortOrder: 'invalid'
                }
            };

            const result = parsePaginationParams(req);

            expect(result.sortOrder).toBe('desc');
        });
    });

    describe('createPaginationMeta', () => {
        it('should create correct metadata', () => {
            const result = createPaginationMeta(100, 2, 20);

            expect(result).toEqual({
                total: 100,
                page: 2,
                limit: 20,
                totalPages: 5,
                hasNextPage: true,
                hasPrevPage: true,
                nextPage: 3,
                prevPage: 1
            });
        });

        it('should handle first page', () => {
            const result = createPaginationMeta(100, 1, 20);

            expect(result.hasPrevPage).toBe(false);
            expect(result.prevPage).toBeNull();
        });

        it('should handle last page', () => {
            const result = createPaginationMeta(100, 5, 20);

            expect(result.hasNextPage).toBe(false);
            expect(result.nextPage).toBeNull();
        });

        it('should handle empty results', () => {
            const result = createPaginationMeta(0, 1, 20);

            expect(result.totalPages).toBe(0);
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPrevPage).toBe(false);
        });

        it('should calculate total pages correctly', () => {
            const result = createPaginationMeta(95, 1, 20);

            expect(result.totalPages).toBe(5); // 95 / 20 = 4.75, rounded up to 5
        });
    });

    describe('paginateQuery', () => {
        let mockModel;

        beforeEach(() => {
            mockModel = {
                find: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
                countDocuments: jest.fn().mockResolvedValue(100)
            };
        });

        it('should paginate query successfully', async () => {
            const result = await paginateQuery(mockModel, {}, {
                page: 2,
                limit: 20,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.total).toBe(100);
            expect(result.pagination.page).toBe(2);
        });

        it('should apply population', async () => {
            await paginateQuery(mockModel, {}, {
                populate: 'user'
            });

            expect(mockModel.populate).toHaveBeenCalledWith('user');
        });

        it('should apply field selection', async () => {
            await paginateQuery(mockModel, {}, {
                select: 'title description'
            });

            expect(mockModel.select).toHaveBeenCalledWith('title description');
        });
    });
});
