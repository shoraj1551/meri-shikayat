/**
 * Admin Dashboard - Enhanced UI
 */

import { adminService } from '../api/admin.service.js';

export async function renderAdminDashboard() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin) {
        window.location.href = '/admin/login';
        return;
    }

    // Helper to check permission
    const hasPermission = (perm) => admin.role === 'super_admin' || (admin.permissions && admin.permissions[perm]);

    // Initial Render with Loading Stats
    app.innerHTML = `
        <div class="dashboard-layout admin-theme">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="logo">Meri Shikayat</div>
                    <div class="admin-badge">ADMIN PORTAL</div>
                </div>
                
                <nav class="sidebar-nav">
                    <a href="/admin/dashboard" class="nav-item active">
                        <i class="icon">📊</i> Dashboard
                    </a>
                    
                    ${hasPermission('viewComplaints') ? `
                    <a href="/admin/complaints" class="nav-item">
                        <i class="icon">📝</i> Complaints
                    </a>
                    ` : ''}
                    
                    ${hasPermission('viewUsers') ? `
                    <a href="/admin/users" class="nav-item">
                        <i class="icon">👥</i> Users
                    </a>
                    ` : ''}
                    
                    ${hasPermission('manageAdmins') ? `
                    <a href="/admin/pending" class="nav-item">
                        <i class="icon">⏳</i> Pending Admins
                    </a>
                    ` : ''}
                    
                    ${hasPermission('manageAdmins') ? `
                    <a href="/admin/permission-requests" class="nav-item">
                        <i class="icon">🔑</i> Permissions
                    </a>
                    ` : ''}
                    
                    <a href="/admin/my-permissions" class="nav-item">
                        <i class="icon">🛡️</i> My Access
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-name">${admin.firstName} ${admin.lastName}</div>
                        <div class="user-role">${admin.role.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">Admin Dashboard</h1>
                    <div class="date-display">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </header>

                <div class="dashboard-grid">
                    <!-- Welcome Card -->
                    <div class="glass-card welcome-card-admin">
                        <div class="welcome-icon">👋</div>
                        <h2>Welcome back, ${admin.firstName}!</h2>
                        <p class="role-badge ${admin.role === 'super_admin' ? 'super-admin-badge' : 'admin-badge-role'}">${admin.role.replace('_', ' ')}</p>
                        <p class="admin-id">Admin ID: ${admin.adminId}</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid" id="statsGrid">
                        <div class="stat-card glass-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value">...</div>
                            <div class="stat-label">Total Complaints</div>
                        </div>
                        <div class="stat-card glass-card pending">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-value">...</div>
                            <div class="stat-label">Pending</div>
                        </div>
                        <div class="stat-card glass-card resolved">
                            <div class="stat-icon">✅</div>
                            <div class="stat-value">...</div>
                            <div class="stat-label">Resolved</div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value">...</div>
                            <div class="stat-label">Active Users</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="glass-card quick-actions-card">
                        <h3>Quick Actions</h3>
                        <div class="action-buttons">
                            ${hasPermission('viewComplaints') ? `
                            <button class="btn btn-primary action-btn" onclick="window.router.navigate('/admin/complaints')">
                                <span class="btn-icon">📝</span>
                                View Complaints
                            </button>
                            ` : ''}
                            
                            ${hasPermission('manageAdmins') ? `
                            <button class="btn btn-primary action-btn" onclick="window.router.navigate('/admin/pending')">
                                <span class="btn-icon">⏳</span>
                                Pending Admins
                            </button>
                            ` : ''}
                            
                            <button class="btn btn-outline action-btn" onclick="window.router.navigate('/admin/my-permissions')">
                                <span class="btn-icon">🔑</span>
                                Request Access
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Fetch and Update Stats with animation
    const updateStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            if (response.success) {
                const stats = response.data;
                const statsGrid = document.getElementById('statsGrid');
                if (!statsGrid) return;

                statsGrid.innerHTML = `
                    <div class="stat-card glass-card stat-animate">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${stats.totalComplaints}</div>
                        <div class="stat-label">Total Complaints</div>
                    </div>
                    <div class="stat-card glass-card pending stat-animate" style="animation-delay: 0.1s">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-value">${stats.pendingComplaints}</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-card glass-card resolved stat-animate" style="animation-delay: 0.2s">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.resolvedComplaints}</div>
                        <div class="stat-label">Resolved</div>
                    </div>
                    <div class="stat-card glass-card stat-animate" style="animation-delay: 0.3s">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value">${stats.activeUsers}</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Initial Load
    await updateStats();

    // Initialize Real-time Updates
    try {
        const { socketService } = await import('../utils/socket-service.js');
        // Join the admin room to receive notifications
        socketService.joinAdminRoom();

        // Listen for new complaints and refresh stats
        socketService.onNewComplaint((data) => {
            console.log('New complaint received, updating dashboard...', data);

            // Show toast notification
            const toast = document.createElement('div');
            toast.className = 'dashboard-toast';
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">🔔</span>
                    <div>
                        <div class="toast-title">New Complaint</div>
                        <div class="toast-body">${data.title || 'A new complaint has been filed'}</div>
                    </div>
                </div>
            `;
            document.body.appendChild(toast);

            // Remove toast after 3s
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 500);
            }, 5000);

            // Refresh stats
            updateStats();
        });
    } catch (err) {
        console.warn('Real-time updates unavailable:', err);
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await adminService.logout();
        window.location.href = '/admin/login';
    });

    // Handle navigation
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.router.navigate(href);
        });
    });
}
