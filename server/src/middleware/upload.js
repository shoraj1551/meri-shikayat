import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
        // Sanitize filename - remove any path traversal attempts
        const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(sanitizedName);
        const nameWithoutExt = path.basename(sanitizedName, ext);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        // Validate extension against whitelist
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp3', '.wav', '.mp4', '.webm'];
        if (!allowedExtensions.includes(ext.toLowerCase())) {
            return cb(new Error('Invalid file extension'));
        }

        cb(null, `${file.fieldname}-${uniqueSuffix}-${nameWithoutExt}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', // Images
        'audio/mpeg', 'audio/wav', 'audio/mp3', // Audio
        'video/mp4', 'video/webm'               // Video
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, MP3, WAV, MP4, and WebM are allowed.'));
    }
};

// Limits
const limits = {
    fileSize: 50 * 1024 * 1024 // 50MB limit (video can be large)
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});
