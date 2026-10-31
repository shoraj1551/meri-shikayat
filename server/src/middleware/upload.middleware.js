/**
 * Upload Middleware
 * Handles file uploads using Multer
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const profileUploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads', 'profiles');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            fs.mkdirSync(profileUploadDir, { recursive: true });
            cb(null, profileUploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        // The final extension is assigned only after content inspection.
        cb(null, `${crypto.randomBytes(32).toString('hex')}.upload`);
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']).has(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};
