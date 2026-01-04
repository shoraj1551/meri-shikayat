/**
 * Feature Flags System
 * TASK-025: Implement feature flags for gradual rollouts
 */

import logger from '../utils/logger.js';

/**
 * Feature flags configuration
 * In production, integrate with LaunchDarkly or Unleash
 */
const features = {
    // Authentication features
    'auth.2fa': process.env.FEATURE_2FA === 'true',
    'auth.social': process.env.FEATURE_SOCIAL_AUTH === 'true',

    // Complaint features
    'complaints.ml_categorization': process.env.FEATURE_ML_CATEGORIZATION === 'true',
    'complaints.auto_assignment': process.env.FEATURE_AUTO_ASSIGNMENT === 'true',

    // Admin features
    'admin.bulk_actions': process.env.FEATURE_BULK_ACTIONS === 'true',
    'admin.advanced_analytics': process.env.FEATURE_ADVANCED_ANALYTICS === 'true',

    // Performance features
    'performance.caching': process.env.FEATURE_CACHING === 'true',
    'performance.cdn': process.env.FEATURE_CDN === 'true',

    // Experimental features
    'experimental.new_ui': process.env.FEATURE_NEW_UI === 'true'
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (featureName, userId = null) => {
    const enabled = features[featureName] || false;

    // TODO: Implement user-based rollout (e.g., 10% of users)
    // if (userId && enabled) {
    //     const hash = hashUserId(userId);
    //     return hash % 100 < rolloutPercentage;
    // }

    return enabled;
};

/**
 * Middleware to require feature flag
 */
export const requireFeature = (featureName) => {
    return (req, res, next) => {
        if (!isFeatureEnabled(featureName, req.user?.id)) {
            logger.warn('Feature not enabled', {
                feature: featureName,
                userId: req.user?.id
            });

            return res.status(403).json({
                success: false,
                message: 'This feature is not available'
            });
        }
        next();
    };
};

/**
 * Get all feature flags (for admin dashboard)
 */
export const getAllFeatures = () => {
    return Object.entries(features).map(([name, enabled]) => ({
        name,
        enabled
    }));
};

export default {
    isFeatureEnabled,
    requireFeature,
    getAllFeatures
};
