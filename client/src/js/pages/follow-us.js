/**
 * Follow Us Page - Social Media Feeds
 * [U] UI/UX Engineer Implementation
 */

import { getSocialFeeds, formatTimestamp, formatNumber } from '../services/social-media.service.js';
import { getCurrentLanguage } from '../i18n/translations.js';

export function renderFollowUsPage() {
    const app = document.getElementById('app');
    const lang = getCurrentLanguage() || 'en';

    // Show loading state
    app.innerHTML = `
        <div class="follow-us-page">
            <header class="follow-header">
                <div class="container">
                    <a href="/" class="back-link">← ${lang === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}</a>
                    <h1 class="page-title">${lang === 'hi' ? 'हमें फॉलो करें' : 'Follow Us'}</h1>
                    <p class="page-subtitle">${lang === 'hi' ? 'हमारे सोशल मीडिया पर जुड़ें और नवीनतम अपडेट प्राप्त करें' : 'Connect with us on social media for latest updates'}</p>
                </div>
            </header>
            
            <main class="follow-content">
                <div class="container">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>${lang === 'hi' ? 'सोशल मीडिया फीड लोड हो रहा है...' : 'Loading social media feeds...'}</p>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Load social feeds
    getSocialFeeds().then(response => {
        if (response.success && response.configured) {
            renderSocialFeeds(response.data, lang);
        } else {
            app.querySelector('.follow-content').innerHTML = `
                <div class="container"><div class="empty-state">
                    <h2>Live social feeds are not connected</h2>
                    <p>Use the official profile links below instead of displaying unverified posts.</p>
                    <a href="https://facebook.com/merishikayat" target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a href="https://instagram.com/merishikayat" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <a href="https://twitter.com/merishikayat" target="_blank" rel="noopener noreferrer">X / Twitter</a>
                </div></div>`;
        }
    }).catch(error => {
        console.error('Failed to load social feeds:', error);
        app.querySelector('.follow-content').innerHTML = `
            <div class="container">
                <div class="error-state">
                    <p>${lang === 'hi' ? 'सोशल मीडिया फीड लोड करने में त्रुटि' : 'Error loading social media feeds'}</p>
                </div>
            </div>
        `;
    });

    // Add event listener for back link
    setTimeout(() => {
        const backLink = app.querySelector('.back-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        }
    }, 100);
}

function renderSocialFeeds(feeds, lang) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="follow-us-page">
            <header class="follow-header">
                <div class="container">
                    <a href="/" class="back-link">← ${lang === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}</a>
                    <h1 class="page-title">${lang === 'hi' ? 'हमें फॉलो करें' : 'Follow Us'}</h1>
                    <p class="page-subtitle">${lang === 'hi' ? 'हमारे सोशल मीडिया पर जुड़ें और नवीनतम अपडेट प्राप्त करें' : 'Connect with us on social media for latest updates'}</p>
                </div>
            </header>
            
            <main class="follow-content">
                <div class="container">
                    <!-- Facebook Feed -->
                    <section class="platform-section facebook-section">
                        <div class="platform-header">
                            <div class="platform-info">
                                <div class="platform-icon facebook-icon">📘</div>
                                <div>
                                    <h2 class="platform-name">Facebook</h2>
                                    <p class="platform-handle">@MeriShikayat</p>
                                </div>
                            </div>
                            <a href="https://facebook.com/merishikayat" target="_blank" class="btn-follow facebook-btn">
                                ${lang === 'hi' ? 'फॉलो करें' : 'Follow'}
                            </a>
                        </div>
                        <div class="posts-grid">
                            ${feeds.facebook.map(post => `
                                <div class="post-card facebook-card">
                                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                                    <div class="post-content">
                                        <p class="post-text">${post.text}</p>
                                        <div class="post-meta">
                                            <span class="post-time">${formatTimestamp(post.timestamp)}</span>
                                            <div class="post-engagement">
                                                <span>👍 ${formatNumber(post.likes)}</span>
                                                <span>💬 ${formatNumber(post.comments)}</span>
                                                <span>🔄 ${formatNumber(post.shares)}</span>
                                            </div>
                                        </div>
                                        <a href="${post.link}" target="_blank" class="post-link">${lang === 'hi' ? 'Facebook पर देखें' : 'View on Facebook'} →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- Instagram Feed -->
                    <section class="platform-section instagram-section">
                        <div class="platform-header">
                            <div class="platform-info">
                                <div class="platform-icon instagram-icon">📷</div>
                                <div>
                                    <h2 class="platform-name">Instagram</h2>
                                    <p class="platform-handle">@MeriShikayat</p>
                                </div>
                            </div>
                            <a href="https://instagram.com/merishikayat" target="_blank" class="btn-follow instagram-btn">
                                ${lang === 'hi' ? 'फॉलो करें' : 'Follow'}
                            </a>
                        </div>
                        <div class="posts-grid instagram-grid">
                            ${feeds.instagram.map(post => `
                                <div class="post-card instagram-card">
                                    <img src="${post.image}" alt="Instagram post" class="post-image">
                                    <div class="post-overlay">
                                        <div class="post-engagement">
                                            <span>❤️ ${formatNumber(post.likes)}</span>
                                            <span>💬 ${formatNumber(post.comments)}</span>
                                        </div>
                                    </div>
                                    <div class="post-content">
                                        <p class="post-text">${post.text}</p>
                                        <a href="${post.link}" target="_blank" class="post-link">${lang === 'hi' ? 'Instagram पर देखें' : 'View on Instagram'} →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- X (Twitter) Feed -->
                    <section class="platform-section twitter-section">
                        <div class="platform-header">
                            <div class="platform-info">
                                <div class="platform-icon twitter-icon">𝕏</div>
                                <div>
                                    <h2 class="platform-name">X (Twitter)</h2>
                                    <p class="platform-handle">@MeriShikayat</p>
                                </div>
                            </div>
                            <a href="https://twitter.com/merishikayat" target="_blank" class="btn-follow twitter-btn">
                                ${lang === 'hi' ? 'फॉलो करें' : 'Follow'}
                            </a>
                        </div>
                        <div class="posts-list">
                            ${feeds.twitter.map(post => `
                                <div class="post-card twitter-card">
                                    <div class="post-content">
                                        <p class="post-text">${post.text}</p>
                                        <div class="post-meta">
                                            <span class="post-time">${formatTimestamp(post.timestamp)}</span>
                                            <div class="post-engagement">
                                                <span>❤️ ${formatNumber(post.likes)}</span>
                                                <span>🔄 ${formatNumber(post.retweets)}</span>
                                                <span>💬 ${formatNumber(post.replies)}</span>
                                            </div>
                                        </div>
                                        <a href="${post.link}" target="_blank" class="post-link">${lang === 'hi' ? 'X पर देखें' : 'View on X'} →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- Reddit Feed -->
                    <section class="platform-section reddit-section">
                        <div class="platform-header">
                            <div class="platform-info">
                                <div class="platform-icon reddit-icon">🤖</div>
                                <div>
                                    <h2 class="platform-name">Reddit</h2>
                                    <p class="platform-handle">u/MeriShikayat</p>
                                </div>
                            </div>
                            <a href="https://reddit.com/user/merishikayat" target="_blank" class="btn-follow reddit-btn">
                                ${lang === 'hi' ? 'फॉलो करें' : 'Follow'}
                            </a>
                        </div>
                        <div class="posts-list">
                            ${feeds.reddit.map(post => `
                                <div class="post-card reddit-card">
                                    <div class="post-content">
                                        <h3 class="post-title">${post.title}</h3>
                                        <p class="post-subreddit">${post.subreddit}</p>
                                        <p class="post-text">${post.text}</p>
                                        <div class="post-meta">
                                            <span class="post-time">${formatTimestamp(post.timestamp)}</span>
                                            <div class="post-engagement">
                                                <span>⬆️ ${formatNumber(post.upvotes)}</span>
                                                <span>💬 ${formatNumber(post.comments)}</span>
                                            </div>
                                        </div>
                                        <a href="${post.link}" target="_blank" class="post-link">${lang === 'hi' ? 'Reddit पर देखें' : 'View on Reddit'} →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- YouTube Feed -->
                    <section class="platform-section youtube-section">
                        <div class="platform-header">
                            <div class="platform-info">
                                <div class="platform-icon youtube-icon">▶️</div>
                                <div>
                                    <h2 class="platform-name">YouTube</h2>
                                    <p class="platform-handle">@MeriShikayat</p>
                                </div>
                            </div>
                            <a href="https://youtube.com/@merishikayat" target="_blank" class="btn-follow youtube-btn">
                                ${lang === 'hi' ? 'सब्सक्राइब करें' : 'Subscribe'}
                            </a>
                        </div>
                        <div class="posts-grid youtube-grid">
                            ${feeds.youtube.map(post => `
                                <div class="post-card youtube-card">
                                    <div class="video-thumbnail">
                                        <img src="${post.thumbnail}" alt="${post.title}">
                                        <div class="video-duration">${post.duration}</div>
                                    </div>
                                    <div class="post-content">
                                        <h3 class="video-title">${post.title}</h3>
                                        <div class="post-meta">
                                            <span>${formatNumber(post.views)} views</span>
                                            <span>•</span>
                                            <span>${formatTimestamp(post.timestamp)}</span>
                                        </div>
                                        <a href="${post.link}" target="_blank" class="post-link">${lang === 'hi' ? 'YouTube पर देखें' : 'Watch on YouTube'} →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- Call to Action -->
                    <section class="cta-section">
                        <h2>${lang === 'hi' ? 'सभी प्लेटफॉर्म पर हमसे जुड़ें' : 'Connect with us on all platforms'}</h2>
                        <p>${lang === 'hi' ? 'नवीनतम अपडेट, सफलता की कहानियां और सामुदायिक प्रभाव के लिए हमें फॉलो करें' : 'Follow us for latest updates, success stories, and community impact'}</p>
                        <div class="social-buttons">
                            <a href="https://facebook.com/merishikayat" target="_blank" class="social-btn facebook-btn">📘 Facebook</a>
                            <a href="https://instagram.com/merishikayat" target="_blank" class="social-btn instagram-btn">📷 Instagram</a>
                            <a href="https://twitter.com/merishikayat" target="_blank" class="social-btn twitter-btn">𝕏 X</a>
                            <a href="https://reddit.com/user/merishikayat" target="_blank" class="social-btn reddit-btn">🤖 Reddit</a>
                            <a href="https://youtube.com/@merishikayat" target="_blank" class="social-btn youtube-btn">▶️ YouTube</a>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;

    // Re-attach back link event listener
    const backLink = app.querySelector('.back-link');
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.router.navigate('/');
        });
    }
}
