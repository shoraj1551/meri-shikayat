/**
 * Pagination Helper Utilities
 * TASK-010: Add pagination to all list endpoints
 */

import logger from '../utils/logger.js';

/**
 * Default pagination configuration
 */
export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 20,
    maxLimit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc'
};

/**
 * Parse pagination parameters from request
 * @param {Object} req - Express request object
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (req) => {
    const page = Math.max(1, parseInt(req.query.page) || PAGINATION_DEFAULTS.page);
    const limit = Math.min(
        PAGINATION_DEFAULTS.maxLimit,
        Math.max(1, parseInt(req.query.limit) || PAGINATION_DEFAULTS.limit)
    );
    const sortBy = req.query.sortBy || PAGINATION_DEFAULTS.sortBy;
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    };
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Paginate Mongoose query
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query filter
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated results with metadata
 */
export const paginateQuery = async (model, query = {}, options = {}) => {
    try {
        const {
            page = PAGINATION_DEFAULTS.page,
            limit = PAGINATION_DEFAULTS.limit,
            sortBy = PAGINATION_DEFAULTS.sortBy,
            sortOrder = PAGINATION_DEFAULTS.sortOrder,
            populate = null,
            select = null
        } = options;

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Build query
        let queryBuilder = model.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Apply population if specified
        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(pop => {
                    queryBuilder = queryBuilder.populate(pop);
                });
            } else {
                queryBuilder = queryBuilder.populate(populate);
            }
        }

        // Apply field selection if specified
        if (select) {
            queryBuilder = queryBuilder.select(select);
        }

        // Execute query and count total
        const [data, total] = await Promise.all([
            queryBuilder.exec(),
            model.countDocuments(query)
        ]);

        const pagination = createPaginationMeta(total, page, limit);

        return {
            success: true,
            data,
            pagination
        };
    } catch (error) {
        logger.error('Pagination error', {
            model: model.modelName,
            error: error.message
        });
        throw error;
    }
};

/**
 * Middleware to add pagination to request
 */
export const paginationMiddleware = (req, res, next) => {
    req.pagination = parsePaginationParams(req);
    next();
};

/**
 * Create paginated response
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {Object} pagination - Pagination params
 * @returns {Object} Formatted response
 */
export const createPaginatedResponse = (data, total, pagination) => {
    const meta = createPaginationMeta(total, pagination.page, pagination.limit);

    return {
        success: true,
        data,
        pagination: meta
    };
};

export default {
    PAGINATION_DEFAULTS,
    parsePaginationParams,
    createPaginationMeta,
    paginateQuery,
    paginationMiddleware,
    createPaginatedResponse
};
