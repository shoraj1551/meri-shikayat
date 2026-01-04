/**
 * Mock Social Media Data Service
 * [U] UI/UX Engineer - Temporary mock data
 * [DS] AI/ML Engineer - Replace with real API calls
 */

/**
 * Mock social media feeds
 * Structure matches expected API response format
 */
export const mockSocialFeeds = {
    facebook: [
        {
            id: "fb_1",
            text: "🎉 Great news! Over 5,000 complaints successfully resolved through Meri Shikayat platform. Your voice matters! #CitizenEmpowerment #MeriShikayat",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
            link: "https://facebook.com/merishikayat/posts/1",
            timestamp: "2024-01-15T10:30:00Z",
            likes: 1250,
            comments: 89,
            shares: 234
        },
        {
            id: "fb_2",
            text: "New feature alert! 📱 Now you can track your complaint status in real-time. Download the app and stay updated!",
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
            link: "https://facebook.com/merishikayat/posts/2",
            timestamp: "2024-01-14T15:20:00Z",
            likes: 890,
            comments: 45,
            shares: 156
        },
        {
            id: "fb_3",
            text: "Success Story: Mr. Sharma's pothole complaint resolved in just 48 hours! 🛣️ Together we're making our cities better.",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
            link: "https://facebook.com/merishikayat/posts/3",
            timestamp: "2024-01-13T09:15:00Z",
            likes: 2100,
            comments: 167,
            shares: 445
        }
    ],
    instagram: [
        {
            id: "ig_1",
            text: "Your complaints are being heard! 📢 Join thousands of citizens making a difference. Link in bio. #MeriShikayat #CitizenPower",
            image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=800&fit=crop",
            link: "https://instagram.com/p/merishikayat1",
            timestamp: "2024-01-15T14:45:00Z",
            likes: 3400,
            comments: 234
        },
        {
            id: "ig_2",
            text: "Before & After: See how your complaints create real change! 🌟 Swipe to see the transformation.",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=800&fit=crop",
            link: "https://instagram.com/p/merishikayat2",
            timestamp: "2024-01-14T11:30:00Z",
            likes: 5600,
            comments: 389
        },
        {
            id: "ig_3",
            text: "Community Impact Score: 4.8/5 ⭐ Thank you for being part of the change!",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop",
            link: "https://instagram.com/p/merishikayat3",
            timestamp: "2024-01-13T16:20:00Z",
            likes: 2890,
            comments: 156
        }
    ],
    twitter: [
        {
            id: "tw_1",
            text: "🚨 BREAKING: 4,100+ complaints resolved this month! Our AI-powered system is making government accountability faster than ever. #GovTech #CitizenFirst",
            link: "https://twitter.com/merishikayat/status/1",
            timestamp: "2024-01-15T12:00:00Z",
            likes: 890,
            retweets: 234,
            replies: 67
        },
        {
            id: "tw_2",
            text: "Pro tip: Include photos/videos with your complaint for 3x faster resolution! 📸 Our data shows visual evidence speeds up the process significantly.",
            link: "https://twitter.com/merishikayat/status/2",
            timestamp: "2024-01-14T18:30:00Z",
            likes: 456,
            retweets: 123,
            replies: 34
        },
        {
            id: "tw_3",
            text: "Shoutout to @MumbaiPolice for their quick response on complaint #MS12345. This is how collaboration works! 🙌 #DigitalIndia",
            link: "https://twitter.com/merishikayat/status/3",
            timestamp: "2024-01-13T10:45:00Z",
            likes: 1200,
            retweets: 345,
            replies: 89
        }
    ],
    reddit: [
        {
            id: "rd_1",
            title: "How Meri Shikayat helped me get a streetlight fixed in 24 hours",
            text: "I've been complaining to my local municipal office for months about a broken streetlight. Posted on Meri Shikayat yesterday and it was fixed today! Here's my experience...",
            subreddit: "r/india",
            link: "https://reddit.com/r/india/comments/merishikayat1",
            timestamp: "2024-01-15T08:20:00Z",
            upvotes: 2340,
            comments: 156
        },
        {
            id: "rd_2",
            title: "AMA: I'm part of the Meri Shikayat team - Ask me anything!",
            text: "Hey Reddit! We're building India's largest citizen complaint platform. Ask me anything about how we're using AI/ML to improve government accountability...",
            subreddit: "r/india",
            link: "https://reddit.com/r/india/comments/merishikayat2",
            timestamp: "2024-01-14T14:00:00Z",
            upvotes: 5670,
            comments: 789
        },
        {
            id: "rd_3",
            title: "Success Rate Analysis: Which departments respond fastest?",
            text: "I analyzed 10,000+ complaints on Meri Shikayat. Here are the departments with the best response times. Surprising results!",
            subreddit: "r/dataisbeautiful",
            link: "https://reddit.com/r/dataisbeautiful/comments/merishikayat3",
            timestamp: "2024-01-13T19:30:00Z",
            upvotes: 8900,
            comments: 234
        }
    ],
    youtube: [
        {
            id: "yt_1",
            title: "How to File a Complaint on Meri Shikayat | Complete Tutorial",
            thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop",
            link: "https://youtube.com/watch?v=merishikayat1",
            timestamp: "2024-01-15T10:00:00Z",
            views: 45600,
            likes: 3400,
            duration: "8:45"
        },
        {
            id: "yt_2",
            title: "Success Stories: Real Citizens, Real Change | Meri Shikayat",
            thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop",
            link: "https://youtube.com/watch?v=merishikayat2",
            timestamp: "2024-01-14T16:30:00Z",
            views: 78900,
            likes: 6700,
            duration: "12:30"
        },
        {
            id: "yt_3",
            title: "Behind the Scenes: How AI Categorizes Your Complaints",
            thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
            link: "https://youtube.com/watch?v=merishikayat3",
            timestamp: "2024-01-13T12:15:00Z",
            views: 23400,
            likes: 1890,
            duration: "15:20"
        }
    ]
};

/**
 * Get all social media feeds
 * [DS] Replace this with: fetch('/api/social-media/feeds')
 */
export function getSocialFeeds() {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            resolve({
                success: true,
                data: mockSocialFeeds,
                cached_at: new Date().toISOString()
            });
        }, 500);
    });
}

/**
 * Get feed for specific platform
 * [DS] Replace with: fetch(`/api/social-media/${platform}`)
 */
export function getPlatformFeed(platform) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                platform: platform,
                posts: mockSocialFeeds[platform] || []
            });
        }, 300);
    });
}

/**
 * Format timestamp to relative time
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
