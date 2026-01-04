/**
 * Contractor Dashboard Page
 * Dashboard for contractor users to view and manage assigned jobs
 */

export function renderContractorDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="dashboard-page">
            <div class="dashboard-container">
                <!-- Header -->
                <header class="dashboard-header">
                    <div class="header-content">
                        <h1>🏗️ Contractor Dashboard</h1>
                        <p>Manage your assigned jobs and track progress</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="window.router.navigate('/profile')">
                            Profile
                        </button>
                        <button class="btn btn-outline" onclick="handleLogout()">
                            Logout
                        </button>
                    </div>
                </header>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-content">
                            <h3 class="stat-value">0</h3>
                            <p class="stat-label">Assigned Jobs</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-content">
                            <h3 class="stat-value">0</h3>
                            <p class="stat-label">In Progress</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <h3 class="stat-value">0</h3>
                            <p class="stat-label">Completed</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <h3 class="stat-value">₹0</h3>
                            <p class="stat-label">Total Earnings</p>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="dashboard-content">
                    <div class="content-section">
                        <h2>Assigned Jobs</h2>
                        <div class="jobs-list">
                            <div class="empty-state">
                                <div class="empty-icon">📭</div>
                                <h3>No jobs assigned yet</h3>
                                <p>Jobs will appear here when they are assigned to you by administrators.</p>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar">
                        <div class="sidebar-card">
                            <h3>Quick Actions</h3>
                            <div class="quick-actions">
                                <button class="action-btn" onclick="window.router.navigate('/profile')">
                                    👤 View Profile
                                </button>
                                <button class="action-btn" onclick="window.router.navigate('/help')">
                                    ❓ Help & Support
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-card">
                            <h3>Recent Activity</h3>
                            <div class="activity-list">
                                <p class="text-muted">No recent activity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeContractorDashboard();
}

function initializeContractorDashboard() {
    // Load contractor data
    loadContractorData();
}

async function loadContractorData() {
    try {
        // TODO: Fetch contractor data from API
        console.log('Loading contractor data...');
    } catch (error) {
        console.error('Error loading contractor data:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.router.navigate('/login');
}
