import { complaintService } from '../api/complaint.service.js';
import Loading from '../components/loading.js';

export async function renderDashboardPage() {
    const app = document.getElementById('app');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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

                    <!-- Right Column: Sidebar -->
                    <div class="sidebar">
                        <div class="quick-actions-card">
                            <h3 class="section-title">Quick Actions</h3>
                            <div class="action-btn-group">
                                <button class="btn-premium-action primary" onclick="window.router.navigate('/submit-complaint')">
                                    <span>📝</span> File New Complaint
                                </button>
                                <button class="btn-premium-action" onclick="window.router.navigate('/profile')">
                                    <span>👤</span> Update Profile
                                </button>
                                <button class="btn-premium-action" onclick="window.router.navigate('/success-stories')">
                                    <span>✨</span> View Success Stories
                                </button>
                            </div>
                        
                            <div class="map-widget">
                                <!-- Map placeholder with overlay -->
                                <div style="background: rgba(255,255,255,0.8); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600;">
                                    📍 Nearby Issues
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
