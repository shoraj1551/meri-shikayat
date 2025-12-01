/**
 * Shared constants used across client and server
 */

export const COMPLAINT_CATEGORIES = {
    INFRASTRUCTURE: 'infrastructure',
    PUBLIC_SERVICE: 'public-service',
    UTILITIES: 'utilities',
    SAFETY: 'safety',
    ENVIRONMENT: 'environment',
    OTHER: 'other'
};

export const COMPLAINT_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

export const COMPLAINT_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

export const FILE_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio'
};

export const MAX_FILE_SIZES = {
    IMAGE: 5 * 1024 * 1024,  // 5MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    AUDIO: 10 * 1024 * 1024  // 10MB
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
