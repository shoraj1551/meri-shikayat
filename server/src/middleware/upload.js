import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // SECURITY: Generate completely random filename - NEVER trust user input
        // This prevents path traversal attacks and filename-based exploits
        const randomName = crypto.randomBytes(32).toString('hex');

        // Get extension from original filename (will be validated later by magic numbers)
        const ext = path.extname(file.originalname).toLowerCase();

        // Strict extension whitelist (belt-and-suspenders with magic number validation)
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.mp4', '.webm'];
        if (!allowedExtensions.includes(ext)) {
            return cb(new Error(`File extension ${ext} is not allowed. Allowed: ${allowedExtensions.join(', ')}`));
        }

        // Store original filename in metadata for reference (not used in actual filename)
        req.fileMetadata = {
            originalName: path.basename(file.originalname),
            uploadedAt: new Date(),
            userAgent: req.get('user-agent'),
            ip: req.ip
        };

        // Final filename: random hash + validated extension
        const finalFilename = `${randomName}${ext}`;

        cb(null, finalFilename);
    }
});


// File filter - Initial MIME type check (will be validated again with magic numbers)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/webp', // Images
        'audio/mpeg', 'audio/wav', 'audio/mp3',                // Audio
        'video/mp4', 'video/webm'                              // Video
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid MIME type: ${file.mimetype}. Only JPEG, PNG, WebP, MP3, WAV, MP4, and WebM are allowed.`));
    }
};

// Limits - Stricter than before
const limits = {
    fileSize: 20 * 1024 * 1024, // 20MB max (reduced from 50MB)
    files: 5,                    // Maximum 5 files per request
    fields: 20,                  // Maximum 20 form fields
    parts: 30,                   // Maximum 30 parts (files + fields)
    headerPairs: 2000            // Maximum header pairs
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});
