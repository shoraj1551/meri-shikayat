const platforms = ['facebook', 'instagram', 'twitter', 'reddit', 'youtube'];

export async function getSocialFeeds() {
    return {
        success: true,
        configured: false,
        data: Object.fromEntries(platforms.map(platform => [platform, []]))
    };
}

export async function getPlatformFeed(platform) {
    return { success: true, configured: false, platform, posts: [] };
}

export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
}

export function formatNumber(value) {
    const number = Number(value) || 0;
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return String(number);
}
