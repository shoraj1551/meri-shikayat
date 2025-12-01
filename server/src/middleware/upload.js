/**
 * File upload middleware using Multer
 */

import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        if (file.mimetype.startsWith('image')) {
            uploadPath += 'images/';
        } else if (file.mimetype.startsWith('video')) {
            uploadPath += 'videos/';
        } else if (file.mimetype.startsWith('audio')) {
            uploadPath += 'audio/';
        } else {
            uploadPath += 'others/';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: fileFilter
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5); // Max 5 files
export const uploadFields = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
    { name: 'audio', maxCount: 2 }
]);

export default upload;
