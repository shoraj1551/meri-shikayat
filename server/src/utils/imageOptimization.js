/**
 * Image Optimization Utility
 * TASK-PR-012: Optimize images (WebP conversion, multiple sizes)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

/**
 * Image size configurations
 */
export const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 800, height: 800 },
    large: { width: 1920, height: 1920 }
};

/**
 * Optimize and convert image to WebP
 * @param {string} inputPath - Original image path
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generated image variants
 */
export const optimizeImage = async (inputPath, outputDir) => {
    try {
        const filename = path.basename(inputPath, path.extname(inputPath));
        const variants = {};

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        logger.info('Processing image', {
            filename,
            originalSize: `${metadata.width}x${metadata.height}`,
            format: metadata.format
        });

        // Generate variants
        for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
            const outputPath = path.join(outputDir, `${filename}-${sizeName}.webp`);

            await sharp(inputPath)
                .resize(dimensions.width, dimensions.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({
                    quality: sizeName === 'thumbnail' ? 70 : 85,
                    effort: 4
                })
                .toFile(outputPath);

            variants[sizeName] = outputPath;

            const stats = await fs.stat(outputPath);
            logger.info(`Generated ${sizeName}`, {
                path: outputPath,
                size: `${(stats.size / 1024).toFixed(2)} KB`
            });
        }

        // Calculate compression ratio
        const originalStats = await fs.stat(inputPath);
        const optimizedStats = await fs.stat(variants.medium);
        const compressionRatio = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(2);

        logger.info('Image optimization complete', {
            filename,
            originalSize: `${(originalStats.size / 1024).toFixed(2)} KB`,
            optimizedSize: `${(optimizedStats.size / 1024).toFixed(2)} KB`,
            compression: `${compressionRatio}%`
        });

        return {
            original: inputPath,
            variants,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: 'webp',
                compressionRatio
            }
        };
    } catch (error) {
        logger.error('Image optimization failed', {
            inputPath,
            error: error.message
        });
        throw error;
    }
};

/**
 * Batch optimize images in a directory
 * @param {string} inputDir - Input directory
 * @param {string} outputDir - Output directory
 */
export const batchOptimizeImages = async (inputDir, outputDir) => {
    try {
        const files = await fs.readdir(inputDir);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|gif)$/i.test(file)
        );

        logger.info('Starting batch optimization', {
            directory: inputDir,
            imageCount: imageFiles.length
        });

        const results = [];
        for (const file of imageFiles) {
            const inputPath = path.join(inputDir, file);
            const result = await optimizeImage(inputPath, outputDir);
            results.push(result);
        }

        logger.info('Batch optimization complete', {
            processed: results.length,
            outputDir
        });

        return results;
    } catch (error) {
        logger.error('Batch optimization failed', {
            error: error.message
        });
        throw error;
    }
};

/**
 * Get responsive image srcset
 * @param {Object} variants - Image variants
 * @param {string} baseUrl - Base URL for images
 * @returns {string} srcset string
 */
export const generateSrcSet = (variants, baseUrl = '') => {
    const sizes = [
        { name: 'thumbnail', width: 150 },
        { name: 'small', width: 300 },
        { name: 'medium', width: 800 },
        { name: 'large', width: 1920 }
    ];

    return sizes
        .filter(size => variants[size.name])
        .map(size => `${baseUrl}/${path.basename(variants[size.name])} ${size.width}w`)
        .join(', ');
};

export default {
    IMAGE_SIZES,
    optimizeImage,
    batchOptimizeImages,
    generateSrcSet
};
