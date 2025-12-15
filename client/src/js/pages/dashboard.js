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
                            ${Loading.skeleton(100, '30%')}
                            <div style="margin-top: 20px;">
                                ${Loading.skeleton(100, '60%')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="dashboard-layout">
                    <div class="main-content">
                        ${Loading.skeleton(300, '100%')}
                    </div>
                    <div class="sidebar">
                        ${Loading.skeleton(200, '100%')}
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
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="dashboard-welcome">
                        <h1>Welcome back, ${user.firstName || 'User'}! 👋</h1>
                        <p class="dashboard-date">${dateStr}</p>
                    </div>
                    <button class="btn btn-primary btn-cta-main" onclick="window.router.navigate('/submit-complaint')">
                        <i class="icon">＋</i> New Complaint
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
                    <!-- Left Column: Complaints List -->
                    <div class="main-content">
                        <h2 class="section-title">
                            Recent Activity
                            <span class="badge" style="font-size: 0.8rem; background: var(--bg-secondary); color: var(--text-secondary); padding: 4px 8px; border-radius: 12px;">
                                ${complaints.length}
                            </span>
                        </h2>

                        ${complaints.length > 0 ? `
                            <div class="complaints-list-premium">
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
