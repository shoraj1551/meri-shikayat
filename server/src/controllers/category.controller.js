/**
 * Category Controller
 * Handles category-related operations
 */

import Category from '../models/Category.js';

/**
 * @desc    Get all active categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .select('name description icon color department sortOrder')
            .lean();

        // If no categories exist, return empty array with helpful message
        if (categories.length === 0) {
            return res.json({
                success: true,
                count: 0,
                data: [],
                message: 'No categories found. Please run seed script to create default categories.'
            });
        }

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .select('name description icon color department sortOrder')
            .lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get Category By ID Error:', error);

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
