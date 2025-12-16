/**
 * User Stats Helper Functions
 * Utility functions to update user statistics
 */

import User from '../models/User.js';

/**
 * Increment user's complaint count and impact score
 * Call this when a user files a new complaint
 */
export const incrementComplaintStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.totalComplaints': 1,
                'stats.impactScore': 5  // 5 points for filing a complaint
            }
        });
    } catch (error) {
        console.error('Error updating complaint stats:', error);
    }
};

/**
 * Increment user's resolved complaint count and impact score
 * Call this when a user's complaint is marked as resolved
 */
export const incrementResolvedStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.resolvedComplaints': 1,
                'stats.impactScore': 20  // 20 points for getting a complaint resolved
            }
        });
    } catch (error) {
        console.error('Error updating resolved stats:', error);
    }
};

/**
 * Increment user's comment count
 * Call this when a user posts a comment
 */
export const incrementCommentStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.totalComments': 1,
                'stats.impactScore': 2  // 2 points for commenting
            }
        });
    } catch (error) {
        console.error('Error updating comment stats:', error);
    }
};

/**
 * Increment user's hype count (when they receive a hype)
 * Call this when another user hypes their content
 */
export const incrementHypeStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.totalHypes': 1,
                'stats.impactScore': 3  // 3 points for receiving a hype
            }
        });
    } catch (error) {
        console.error('Error updating hype stats:', error);
    }
};

/**
 * Increment user's share count
 * Call this when a user shares content
 */
export const incrementShareStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.totalShares': 1,
                'stats.impactScore': 4  // 4 points for sharing
            }
        });
    } catch (error) {
        console.error('Error updating share stats:', error);
    }
};

/**
 * Calculate and update reputation score based on all stats
 * Call this periodically or after significant stat changes
 */
export const updateReputationScore = async (userId) => {
    try {
        const user = await User.findById(userId).select('stats');
        if (!user) return;

        // Reputation formula: weighted sum of all activities
        const reputation =
            (user.stats.totalComplaints || 0) * 5 +
            (user.stats.resolvedComplaints || 0) * 20 +
            (user.stats.totalComments || 0) * 2 +
            (user.stats.totalHypes || 0) * 3 +
            (user.stats.totalShares || 0) * 4;

        await User.findByIdAndUpdate(userId, {
            'stats.reputationScore': reputation
        });
    } catch (error) {
        console.error('Error updating reputation score:', error);
    }
};

/**
 * Batch update stats for multiple users
 * Useful for periodic recalculations
 */
export const recalculateAllUserStats = async () => {
    try {
        const users = await User.find({}).select('_id');

        for (const user of users) {
            await updateReputationScore(user._id);
        }

        console.log(`Recalculated stats for ${users.length} users`);
    } catch (error) {
        console.error('Error recalculating user stats:', error);
    }
};
