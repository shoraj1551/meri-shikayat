import { complaintService } from '../api/complaint.service.js';
import Loading from '../components/loading.js';

export async function renderDashboardPage() {
    const app = document.getElementById('app');

    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Redirect to login if not authenticated
    if (!token || !user || !user.id) {
        window.router.navigate('/login?redirect=/dashboard');
        return;
    }

    // Initial Skeleton State
    app.innerHTML = `
        <div class="dashboard-page">
            <div class="container">
                <div class="dashboard-header">
                    <div class="dashboard-welcome">
                        <div class="skeleton-text" style="width: 200px; height: 32px; margin-bottom: 8px;"></div>
                        <div class="skeleton-text" style="width: 150px;"></div>
                    </div>
                </div>
                <div class="stats-grid-premium">
                    ${[1, 2, 3].map(() => `
                        <div class="stat-card-premium" style="height: 140px;">
                            <div class="skeleton-text" style="width: 30%; height: 20px; margin-bottom: 20px;"></div>
                            <div class="skeleton-text" style="width: 60%; height: 30px;"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="dashboard-layout">
                    <div class="main-content">
                        <div class="skeleton-text" style="width: 100%; height: 300px;"></div>
                    </div>
                    <div class="sidebar">
                        <div class="skeleton-text" style="width: 100%; height: 200px;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        // Fetch data
        const myComplaintsResponse = await complaintService.getMyComplaints();
        const myComplaints = myComplaintsResponse.data || [];

        // Calculate Stats
        const stats = {
            total: myComplaints.length,
            pending: myComplaints.filter(c => c.status === 'Pending').length,
            resolved: myComplaints.filter(c => c.status === 'Resolved').length,
            rejected: myComplaints.filter(c => c.status === 'Rejected').length
        };

        // Render Premium Dashboard
        renderPremiumContent(app, user, myComplaints, stats);

    } catch (error) {
        console.error('Dashboard Error:', error);
        app.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h3>😕 Something went wrong</h3>
                    <p>Failed to load your dashboard. Please try again.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
                </div>
            </div>
        `;
    }
}

function renderPremiumContent(app, user, complaints, stats) {
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    app.innerHTML = `
        <div class="dashboard-page">
            <div class="container">
                <!-- Enhanced Header -->
                <div class="dashboard-header-enhanced">
                    <div class="header-left">
                        <h1 class="welcome-title">Welcome back, ${user.firstName || 'User'} ${user.lastName || ''}! 👋</h1>
                        <div class="header-meta">
                            <span class="header-date">📅 ${dateStr}</span>
                            ${user.location ? `<span class="header-location">📍 ${user.location.city || ''}, ${user.location.district || ''} - ${user.location.pincode || ''}</span>` : ''}
                        </div>
                    </div>
                    <div class="header-right">
                        <button class="btn-profile-enhanced" onclick="window.router.navigate('/profile')" title="View Profile">
                            <span class="profile-avatar">${(user.firstName?.[0] || 'U')}${(user.lastName?.[0] || '')}</span>
                            <span class="profile-text">Profile</span>
                        </button>
                        <button class="btn-logout" id="logoutBtn" title="Logout">
                            <span class="logout-icon">🚪</span>
                            <span class="logout-text">Logout</span>
                        </button>
                    </div>
                </div>

                <!-- Verification Banner -->
                ${!user.isVerified || !user.verificationStatus?.email || !user.verificationStatus?.phone ? `
                    <div class="verification-banner">
                        <div class="banner-content">
                            <div class="banner-icon">⚠️</div>
                            <div class="banner-text">
                                <strong>Account Verification Required</strong>
                                <p>
                                    ${user.userType === 'general_user'
                ? 'Please verify your email or phone number to fully activate your account.'
                : 'Please verify both your email and phone number to fully activate your account.'}
                                </p>
                            </div>
                            <button class="btn btn-primary" onclick="window.router.navigate('/verify-account')">
                                Verify Now
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Enhanced CTA Button -->
                <div class="cta-section">
                    <button class="btn-cta-primary-large" onclick="window.router.navigate('/submit-complaint')">
                        <span class="cta-icon-large">📝</span>
                        <div class="cta-content">
                            <strong>Report an Issue</strong>
                            <small>Help improve your community</small>
                        </div>
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid-premium">
                    <div class="stat-card-premium stat-card-total">
                        <div class="stat-header">
                            <span class="stat-label">Total Issues</span>
                            <div class="stat-icon-wrapper">📊</div>
                        </div>
                        <div class="stat-value-big count-up" data-target="${stats.total}">0</div>
                        <div class="stat-trend neutral">
                            <span>Lifetime submissions</span>
                        </div>
                    </div>

                    <div class="stat-card-premium stat-card-pending">
                        <div class="stat-header">
                            <span class="stat-label">In Progress</span>
                            <div class="stat-icon-wrapper">⏳</div>
                        </div>
                        <div class="stat-value-big count-up" data-target="${stats.pending}">0</div>
                        <div class="stat-trend neutral">
                            <span>Awaiting resolution</span>
                        </div>
                    </div>

                    <div class="stat-card-premium stat-card-resolved">
                        <div class="stat-header">
                            <span class="stat-label">Resolved</span>
                            <div class="stat-icon-wrapper">✅</div>
                        </div>
                        <div class="stat-value-big count-up" data-target="${stats.resolved}">0</div>
                        <div class="stat-trend positive">
                            <span>Success rate: ${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                        </div>
                    </div>
                </div>

                <!-- Main Layout -->
                <div class="dashboard-layout">
                    <!-- Left Column: My Complaints --  -->
                    <div class="main-content">
                        <div class="my-complaints-header">
                            <h2 class="section-title">My Complaints</h2>
                            <div class="complaint-filters">
                                <button class="filter-btn active" data-filter="all">
                                    All <span class="filter-count">${stats.total}</span>
                                </button>
                                <button class="filter-btn" data-filter="pending">
                                    Pending <span class="filter-count">${stats.pending}</span>
                                </button>
                                <button class="filter-btn" data-filter="resolved">
                                    Resolved <span class="filter-count">${stats.resolved}</span>
                                </button>
                                <button class="filter-btn" data-filter="rejected">
                                    Rejected <span class="filter-count">${stats.rejected}</span>
                                </button>
                            </div>
                        </div>

                        ${complaints.length > 0 ? `
                            <div class="complaints-list-premium" id="complaintsGrid">
                                ${complaints.map(c => renderPremiumComplaintCard(c)).join('')}
                            </div>
                        ` : renderEmptyState()}
                    </div>

                    <!-- Community Feed Section - Full Width Below -->
                    <div class="community-feed-section-full">
                        <div class="community-feed-card">
                            <div class="feed-header">
                                <h3 class="section-title">Community Feed</h3>
                                <button class="btn-change-location" id="changePinBtn" title="Change location filter">
                                    📍 ${user.location?.pincode || '110001'} <span class="change-icon">⚙️</span>
                                </button>
                            </div>
                            
                            <div class="feed-container" id="communityFeed">
                                <!-- Feed items will be loaded here -->
                                <div class="feed-loading">
                                    <div class="skeleton-text" style="width: 100%; height: 120px; margin-bottom: 1rem;"></div>
                                    <div class="skeleton-text" style="width: 100%; height: 120px; margin-bottom: 1rem;"></div>
                                    <div class="skeleton-text" style="width: 100%; height: 120px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dashboard Footer - Matching Home Page -->
                <footer class="enhanced-footer">
                    <div class="container">
                        <div class="footer-grid">
                            <div class="footer-col footer-about">
                                <div class="footer-logo">
                                    <h2>मेरी शिकायत</h2>
                                    <p>Empowering citizens to report and resolve community issues.</p>
                                </div>
                                <div class="about-section">
                                    <h4>About Us</h4>
                                    <p>Meri Shikayat is a citizen-centric platform connecting people directly with government authorities. We believe in transparency, accountability, and quick resolution.</p>
                                </div>
                            </div>
                            <div class="footer-col">
                                <h3>Quick Links</h3>
                                <ul class="footer-links-list">
                                    <li><a href="#" onclick="window.router.navigate('/about')">About Us</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/how-it-works')">How It Works</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/success-stories')">Success Stories</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/contact')">Contact</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/faq')">FAQ</a></li>
                                </ul>
                            </div>
                            <div class="footer-col">
                                <h3>Legal</h3>
                                <ul class="footer-links-list">
                                    <li><a href="#" onclick="window.router.navigate('/privacy')">Privacy Policy</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/terms')">Terms of Service</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/disclaimer')">Disclaimer</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/guidelines')">Community Guidelines</a></li>
                                </ul>
                            </div>
                            <div class="footer-col">
                                <h3>Contact Us</h3>
                                <ul class="footer-links-list">
                                    <li><a href="#" onclick="window.router.navigate('/contact')">Contact Page</a></li>
                                    <li><a href="#" onclick="window.router.navigate('/help')">Help Center</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Social Media Section -->
                        <div class="footer-social-section">
                            <h3 class="social-title">Social Media</h3>
                            <div class="footer-social-icons">
                                <a href="https://facebook.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon facebook" title="Facebook">
                                    <span>📘</span>
                                </a>
                                <a href="https://instagram.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon instagram" title="Instagram">
                                    <span>📷</span>
                                </a>
                                <a href="https://twitter.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon twitter" title="X (Twitter)">
                                    <span>𝕏</span>
                                </a>
                                <a href="https://reddit.com/user/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon reddit" title="Reddit">
                                    <span>🤖</span>
                                </a>
                                <a href="https://youtube.com/@merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon youtube" title="YouTube">
                                    <span>▶️</span>
                                </a>
                            </div>
                            <a href="/follow-us" class="view-all-feeds">View All Feeds</a>
                        </div>
                        
                        <div class="footer-bottom">
                            <p>&copy; ${new Date().getFullYear()} Meri Shikayat. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    `;

    // Initialize Animations
    animateCounters();

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to home
            window.router.navigate('/');
        });
    }

    // Complaint filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const complaintsGrid = document.getElementById('complaintsGrid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const allCards = complaintsGrid?.querySelectorAll('.complaint-card-premium');

            if (!allCards) return;

            allCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else {
                    const statusBadge = card.querySelector('.status-badge-premium');
                    const status = statusBadge?.textContent.trim().toLowerCase();

                    if (status && status.includes(filter)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Load community feed
    loadCommunityFeed(user.location?.pincode || '110001');

    // PIN code change handler
    const changePinBtn = document.getElementById('changePinBtn');
    if (changePinBtn) {
        changePinBtn.addEventListener('click', () => {
            const newPin = prompt('Enter PIN code:', user.location?.pincode || '110001');
            if (newPin && /^\d{6}$/.test(newPin)) {
                loadCommunityFeed(newPin);
                changePinBtn.innerHTML = `📍 ${newPin} <span class="change-icon">⚙️</span>`;
            }
        });
    }
}

function renderPremiumComplaintCard(complaint) {
    const icon = getCategoryIcon(complaint.category);
    const date = new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const statusLower = complaint.status.toLowerCase();

    // Determine progress width
    let progressWidth = '10%';
    let fillClass = 'pending';
    if (statusLower === 'resolved') {
        progressWidth = '100%';
        fillClass = 'resolved';
    } else if (statusLower === 'rejected') {
        progressWidth = '100%';
        fillClass = 'rejected';
    } else if (statusLower === 'in progress') {
        progressWidth = '60%';
        fillClass = 'inprogress';
    } else {
        // Pending
        progressWidth = '33%';
        fillClass = 'pending';
    }

    return `
        <div class="complaint-card-premium" onclick="window.alert('Detailed view coming soon!')" style="cursor: pointer;">
            <div class="complaint-icon-box">
                ${icon}
            </div>
            
            <div class="complaint-info">
                <h4>${complaint.title || 'Untitled Issue'}</h4>
                <div class="complaint-meta">
                    <span>📅 ${date}</span>
                    <span>📍 ${complaint.location?.city || 'Unknown Location'}</span>
                    <span>🆔 #${complaint._id.substring(complaint._id.length - 6).toUpperCase()}</span>
                </div>
            </div>

            <div class="status-tracker-mini">
                <span class="status-badge-premium ${statusLower}">
                    ${statusLower === 'resolved' ? '✅' : statusLower === 'rejected' ? '❌' : '⏳'} 
                    ${complaint.status}
                </span>
                <div class="tracker-bar">
                    <div class="tracker-fill ${fillClass}" style="width: ${progressWidth}"></div>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="empty-state-premium" style="text-align: center; padding: 3rem; background: white; border-radius: 16px; border: 1px dashed var(--border-color);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🍃</div>
            <h3>No complaints yet</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">You haven't reported any issues. Be a hero for your community!</p>
            <button class="btn btn-primary" onclick="window.router.navigate('/submit-complaint')">
                Get Started
            </button>
        </div>
    `;
}

function getCategoryIcon(category) {
    const icons = {
        'Roads': '🛣️',
        'Electricity': '⚡',
        'Water': '💧',
        'Sanitation': '🗑️',
        'Street Lights': '💡',
        'Parks': '🌳',
        'Police': '👮',
        'Other': '📝'
    };
    return icons[category] || '📝';
}

function animateCounters() {
    const counters = document.querySelectorAll('.count-up');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; // ms
        const increment = target / (duration / 16); // 60fps

        let current = 0;
        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// ========================================
// COMMUNITY FEED FUNCTIONS
// ========================================

function renderFeedItem(complaint) {
    const timeAgo = getTimeAgo(complaint.createdAt);
    const userInitials = `${complaint.user?.firstName?.[0] || 'U'}${complaint.user?.lastName?.[0] || ''}`;

    return `
        <div class="feed-item" data-id="${complaint._id}">
            <div class="feed-item-header">
                <div class="feed-user-info">
                    <div class="feed-user-avatar">${userInitials}</div>
                    <div class="feed-user-details">
                        <strong class="feed-user-name">${complaint.user?.firstName || 'Anonymous'}</strong>
                        <span class="feed-time">${timeAgo}</span>
                    </div>
                </div>
                <span class="feed-category-badge">${complaint.category || 'Other'}</span>
            </div>
            
            <div class="feed-content">
                <h4 class="feed-title">${complaint.title || 'Untitled'}</h4>
                <p class="feed-description">${truncateText(complaint.description, 100)}</p>
                ${complaint.media && complaint.media.length > 0 ? `
                    <div class="feed-media-preview">
                        <img src="${complaint.media[0]}" alt="Complaint media" />
                    </div>
                ` : ''}
            </div>
            
            <div class="feed-location">
                📍 ${complaint.location?.city || 'Unknown'}, ${complaint.location?.district || ''}
            </div>
            
            <div class="feed-actions">
                <button class="feed-action-btn like-btn ${complaint.isLiked ? 'active' : ''}" data-action="like" data-id="${complaint._id}">
                    <span class="action-icon">👍</span>
                    <span class="action-count">${complaint.likes || 0}</span>
                </button>
                <button class="feed-action-btn comment-btn" data-action="comment" data-id="${complaint._id}">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${complaint.comments?.length || 0}</span>
                </button>
                <button class="feed-action-btn hype-btn ${complaint.isHyped ? 'active' : ''}" data-action="hype" data-id="${complaint._id}">
                    <span class="action-icon">🔥</span>
                    <span class="action-count">${complaint.hype || 0}</span>
                </button>
                <button class="feed-action-btn share-btn" data-action="share" data-id="${complaint._id}">
                    <span class="action-icon">📤</span>
                    <span class="action-text">Share</span>
                </button>
            </div>
            
            <div class="feed-comments-section" id="comments-${complaint._id}" style="display: none;">
                <div class="comments-list">
                    ${complaint.comments && complaint.comments.length > 0 ?
            complaint.comments.map(c => `
                            <div class="comment-item">
                                <strong>${c.user?.firstName || 'User'}:</strong> ${c.text}
                            </div>
                        `).join('') :
            '<p class="no-comments">No comments yet. Be the first!</p>'
        }
                </div>
                <div class="comment-input-wrapper">
                    <input type="text" class="comment-input" placeholder="Add a comment..." data-id="${complaint._id}">
                    <button class="btn-send-comment" data-id="${complaint._id}">Send</button>
                </div>
            </div>
        </div>
    `;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';

    return Math.floor(seconds) + 's ago';
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

async function loadCommunityFeed(pincode) {
    const feedContainer = document.getElementById('communityFeed');

    try {
        const mockFeedData = [
            {
                _id: '1',
                user: { firstName: 'Raj', lastName: 'Kumar' },
                title: 'Broken Street Light',
                description: 'The street light near sector 15 has been broken for 3 days. It\'s very dark at night and unsafe for pedestrians.',
                category: 'Street Lights',
                location: { city: 'Delhi', district: 'Central' },
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 12,
                hype: 5,
                comments: [],
                isLiked: false,
                isHyped: false
            },
            {
                _id: '2',
                user: { firstName: 'Priya', lastName: 'Sharma' },
                title: 'Pothole on Main Road',
                description: 'Large pothole causing accidents. Multiple vehicles damaged. Urgent repair needed!',
                category: 'Roads',
                location: { city: 'Delhi', district: 'Central' },
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
                likes: 25,
                hype: 15,
                comments: [{ user: { firstName: 'Amit' }, text: 'Same issue here!' }],
                isLiked: true,
                isHyped: false
            },
            {
                _id: '3',
                user: { firstName: 'Amit', lastName: 'Singh' },
                title: 'Water Supply Issue',
                description: 'No water supply for the past 2 days in our area. Please fix urgently.',
                category: 'Water',
                location: { city: 'Delhi', district: 'Central' },
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                likes: 8,
                hype: 3,
                comments: [],
                isLiked: false,
                isHyped: true
            }
        ];

        feedContainer.innerHTML = mockFeedData.map(item => renderFeedItem(item)).join('');
        attachFeedActionListeners();

    } catch (error) {
        console.error('Error loading feed:', error);
        feedContainer.innerHTML = `
            <div class="feed-error">
                <p>Failed to load community feed</p>
                <button class="btn btn-secondary" onclick="loadCommunityFeed('${pincode}')">Retry</button>
            </div>
        `;
    }
}

function attachFeedActionListeners() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const count = this.querySelector('.action-count');
            const currentCount = parseInt(count.textContent);
            count.textContent = this.classList.contains('active') ? currentCount + 1 : currentCount - 1;
        });
    });

    document.querySelectorAll('.hype-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const count = this.querySelector('.action-count');
            const currentCount = parseInt(count.textContent);
            count.textContent = this.classList.contains('active') ? currentCount + 1 : currentCount - 1;
        });
    });

    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const commentsSection = document.getElementById(`comments-${id}`);
            commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const shareUrl = `${window.location.origin}/complaint/${id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Link copied to clipboard!');
            });
        });
    });

    document.querySelectorAll('.btn-send-comment').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const input = document.querySelector(`.comment-input[data-id="${id}"]`);
            const text = input.value.trim();

            if (text) {
                const commentsList = document.querySelector(`#comments-${id} .comments-list`);
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                const noComments = commentsList.querySelector('.no-comments');
                if (noComments) noComments.remove();

                const commentHTML = `
                    <div class="comment-item">
                        <strong>${user.firstName || 'You'}:</strong> ${text}
                    </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', commentHTML);

                const commentBtn = document.querySelector(`.comment-btn[data-id="${id}"]`);
                const countSpan = commentBtn.querySelector('.action-count');
                countSpan.textContent = parseInt(countSpan.textContent) + 1;

                input.value = '';
            }
        });
    });
}
