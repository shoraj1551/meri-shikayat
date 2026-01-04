/**
 * CDN Configuration
 * TASK-PR-011: Integrate CDN for static assets
 */

import logger from '../utils/logger.js';

/**
 * CDN configuration
 */
export const CDN_CONFIG = {
    enabled: process.env.CDN_ENABLED === 'true',
    baseUrl: process.env.CDN_BASE_URL || '',
    provider: process.env.CDN_PROVIDER || 'cloudflare', // cloudflare, cloudfront, fastly

    // Asset types to serve via CDN
    assetTypes: {
        images: true,
        videos: true,
        documents: false // Keep documents on origin for access control
    },

    // Cache control headers
    cacheControl: {
        images: 'public, max-age=31536000, immutable', // 1 year
        videos: 'public, max-age=31536000, immutable',
        documents: 'private, max-age=3600' // 1 hour
    }
};

/**
 * Get CDN URL for an asset
 * @param {string} assetPath - Original asset path
 * @param {string} type - Asset type (images, videos, documents)
 * @returns {string} CDN URL or original path
 */
export const getCDNUrl = (assetPath, type = 'images') => {
    if (!CDN_CONFIG.enabled || !CDN_CONFIG.assetTypes[type]) {
        return assetPath;
    }

    // Remove leading slash if present
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

    return `${CDN_CONFIG.baseUrl}/${cleanPath}`;
};

/**
 * Middleware to add CDN URLs to response
 */
export const cdnMiddleware = (req, res, next) => {
    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json to transform URLs
    res.json = function (data) {
        if (CDN_CONFIG.enabled && data) {
            transformUrls(data);
        }
        return originalJson(data);
    };

    next();
};

/**
 * Transform URLs in response data to use CDN
 */
function transformUrls(obj) {
    if (Array.isArray(obj)) {
        obj.forEach(item => transformUrls(item));
    } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (key === 'imageUrl' || key === 'images' || key === 'media') {
                if (typeof obj[key] === 'string') {
                    obj[key] = getCDNUrl(obj[key], 'images');
                } else if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].map(url => getCDNUrl(url, 'images'));
                }
            } else if (key === 'videoUrl' || key === 'videos') {
                if (typeof obj[key] === 'string') {
                    obj[key] = getCDNUrl(obj[key], 'videos');
                }
            } else if (typeof obj[key] === 'object') {
                transformUrls(obj[key]);
            }
        }
    }
}

/**
 * Set cache control headers for static assets
 */
export const setCacheHeaders = (req, res, next) => {
    const ext = req.path.split('.').pop().toLowerCase();

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    const videoExts = ['mp4', 'webm', 'ogg'];

    if (imageExts.includes(ext)) {
        res.setHeader('Cache-Control', CDN_CONFIG.cacheControl.images);
    } else if (videoExts.includes(ext)) {
        res.setHeader('Cache-Control', CDN_CONFIG.cacheControl.videos);
    }

    next();
};

export default {
    CDN_CONFIG,
    getCDNUrl,
    cdnMiddleware,
    setCacheHeaders
};
