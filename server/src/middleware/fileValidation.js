/**
 * File Validation Middleware
 * Comprehensive file security validation using magic numbers and content inspection
 * Prevents malicious file uploads through extension spoofing
 */

import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import logger from '../utils/logger.js';

/**
 * Allowed MIME types with their magic number signatures
 * This prevents attackers from uploading malicious files with fake extensions
 */
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',

    // Audio
    'audio/mpeg',      // MP3
    'audio/wav',
    'audio/wave',
    'audio/x-wav',

    // Video
    'video/mp4',
    'video/webm'
]);

/**
 * File size limits per type (in bytes)
 */
const FILE_SIZE_LIMITS = {
    'image/jpeg': 5 * 1024 * 1024,   // 5MB
    'image/png': 5 * 1024 * 1024,    // 5MB
    'image/webp': 5 * 1024 * 1024,   // 5MB
    'audio/mpeg': 10 * 1024 * 1024,  // 10MB
    'audio/wav': 10 * 1024 * 1024,   // 10MB
    'audio/wave': 10 * 1024 * 1024,  // 10MB
    'audio/x-wav': 10 * 1024 * 1024, // 10MB
    'video/mp4': 20 * 1024 * 1024,   // 20MB
    'video/webm': 20 * 1024 * 1024   // 20MB
};

/**
 * Maximum image dimensions to prevent decompression bombs
 */
const MAX_IMAGE_PIXELS = 25_000_000; // 25 megapixels (e.g., 5000x5000)
const MAX_IMAGE_WIDTH = 10000;
const MAX_IMAGE_HEIGHT = 10000;

/**
 * Validate file type using magic numbers (file content inspection)
 * This is the primary defense against malicious files
 */
export const validateFileType = async (filePath) => {
    try {
        // Read the file buffer
        const buffer = await fs.readFile(filePath);

        // Detect actual file type from magic numbers
        const detectedType = await fileTypeFromBuffer(buffer);

        if (!detectedType) {
            logger.warn('File type detection failed - unknown file format', { filePath });
            throw new Error('Unable to determine file type. File may be corrupted or invalid.');
        }

        // Check if detected MIME type is allowed
        if (!ALLOWED_MIME_TYPES.has(detectedType.mime)) {
            logger.warn('Rejected file with disallowed MIME type', {
                filePath,
                detectedMime: detectedType.mime,
                detectedExt: detectedType.ext
            });
            throw new Error(`File type ${detectedType.ext} (${detectedType.mime}) is not allowed. Allowed types: JPEG, PNG, WebP, MP3, WAV, MP4, WebM`);
        }

        // Verify file size is within limits
        const stats = await fs.stat(filePath);
        const maxSize = FILE_SIZE_LIMITS[detectedType.mime];

        if (stats.size > maxSize) {
            logger.warn('File exceeds size limit', {
                filePath,
                fileSize: stats.size,
                maxSize,
                mimeType: detectedType.mime
            });
            throw new Error(`File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB) for ${detectedType.mime}`);
        }

        logger.info('File type validation passed', {
            filePath,
            mimeType: detectedType.mime,
            extension: detectedType.ext,
            size: stats.size
        });

        return detectedType;
    } catch (error) {
        logger.error('File type validation error', {
            filePath,
            error: error.message
        });
        throw error;
    }
};

/**
 * Validate image dimensions to prevent decompression bombs
 * Decompression bombs are small files that expand to huge sizes when processed
 */
export const validateImageDimensions = async (filePath, mimeType) => {
    // Only validate image files
    if (!mimeType.startsWith('image/')) {
        return true;
    }

    try {
        const metadata = await sharp(filePath).metadata();

        const { width, height } = metadata;
        const totalPixels = width * height;

        // Check individual dimension limits
        if (width > MAX_IMAGE_WIDTH) {
            logger.warn('Image width exceeds limit', {
                filePath,
                width,
                maxWidth: MAX_IMAGE_WIDTH
            });
            throw new Error(`Image width (${width}px) exceeds maximum allowed width (${MAX_IMAGE_WIDTH}px)`);
        }

        if (height > MAX_IMAGE_HEIGHT) {
            logger.warn('Image height exceeds limit', {
                filePath,
                height,
                maxHeight: MAX_IMAGE_HEIGHT
            });
            throw new Error(`Image height (${height}px) exceeds maximum allowed height (${MAX_IMAGE_HEIGHT}px)`);
        }

        // Check total pixel count (prevents decompression bombs)
        if (totalPixels > MAX_IMAGE_PIXELS) {
            logger.warn('Image total pixels exceed limit', {
                filePath,
                width,
                height,
                totalPixels,
                maxPixels: MAX_IMAGE_PIXELS
            });
            throw new Error(`Image dimensions (${width}x${height} = ${totalPixels.toLocaleString()} pixels) exceed maximum allowed (${MAX_IMAGE_PIXELS.toLocaleString()} pixels)`);
        }

        logger.info('Image dimension validation passed', {
            filePath,
            width,
            height,
            totalPixels,
            format: metadata.format
        });

        return true;
    } catch (error) {
        logger.error('Image dimension validation error', {
            filePath,
            error: error.message
        });
        throw error;
    }
};

/**
 * Complete file validation middleware
 * Validates file type and dimensions
 */
export const validateUploadedFile = async (req, res, next) => {
    // Skip if no file uploaded
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;

    try {
        // Step 1: Validate file type using magic numbers
        const detectedType = await validateFileType(filePath);

        // Step 2: Validate image dimensions (if image)
        if (detectedType.mime.startsWith('image/')) {
            await validateImageDimensions(filePath, detectedType.mime);
        }

        // Store validated file info in request
        req.validatedFile = {
            originalName: req.file.originalname,
            mimeType: detectedType.mime,
            extension: detectedType.ext,
            size: req.file.size,
            path: filePath
        };

        logger.info('File upload validation successful', {
            userId: req.user?.id,
            fileName: req.file.filename,
            mimeType: detectedType.mime,
            size: req.file.size
        });

        next();
    } catch (error) {
        // Delete the invalid file
        try {
            await fs.unlink(filePath);
            logger.info('Deleted invalid file', { filePath });
        } catch (unlinkError) {
            logger.error('Failed to delete invalid file', {
                filePath,
                error: unlinkError.message
            });
        }

        // Return validation error
        return res.status(400).json({
            success: false,
            message: 'File validation failed',
            error: error.message
        });
    }
};

/**
 * Validate multiple files
 */
export const validateMultipleFiles = async (req, res, next) => {
    // Skip if no files uploaded
    if (!req.files || req.files.length === 0) {
        return next();
    }

    const validatedFiles = [];
    const errors = [];

    for (const file of req.files) {
        try {
            // Validate file type
            const detectedType = await validateFileType(file.path);

            // Validate image dimensions if image
            if (detectedType.mime.startsWith('image/')) {
                await validateImageDimensions(file.path, detectedType.mime);
            }

            validatedFiles.push({
                originalName: file.originalname,
                mimeType: detectedType.mime,
                extension: detectedType.ext,
                size: file.size,
                path: file.path
            });
        } catch (error) {
            errors.push({
                fileName: file.originalname,
                error: error.message
            });

            // Delete invalid file
            try {
                await fs.unlink(file.path);
            } catch (unlinkError) {
                logger.error('Failed to delete invalid file', {
                    filePath: file.path,
                    error: unlinkError.message
                });
            }
        }
    }

    // If any files failed validation, return error
    if (errors.length > 0) {
        // Delete all uploaded files
        for (const file of validatedFiles) {
            try {
                await fs.unlink(file.path);
            } catch (unlinkError) {
                logger.error('Failed to delete file during cleanup', {
                    filePath: file.path,
                    error: unlinkError.message
                });
            }
        }

        return res.status(400).json({
            success: false,
            message: 'Some files failed validation',
            errors
        });
    }

    // Store validated files in request
    req.validatedFiles = validatedFiles;

    logger.info('Multiple files validation successful', {
        userId: req.user?.id,
        fileCount: validatedFiles.length
    });

    next();
};

export default {
    validateFileType,
    validateImageDimensions,
    validateUploadedFile,
    validateMultipleFiles
};
