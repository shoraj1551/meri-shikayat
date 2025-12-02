/**
 * Admin Dashboard
 */

import { adminService } from '../api/admin.service.js';

export function renderAdminDashboard() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin) {
        window.router.navigate('/admin/login');
        return;
    }

    // Helper to check permission
    const hasPermission = (perm) => admin.role === 'super_admin' || (admin.permissions && admin.permissions[perm]);

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
                    <div class="card welcome-card admin-card">
                        <div class="card-content">
                            <h2>Welcome back, ${admin.firstName}!</h2>
                            <p>You are logged in as <strong>${admin.role.replace('_', ' ')}</strong>.</p>
                            <p>Admin ID: ${admin.adminId}</p>
                        </div>
                    </div>

                    <!-- Stats Cards (Placeholder) -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">0</div>
                            <div class="stat-label">New Complaints</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Pending Reviews</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Active Users</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="card admin-card">
                        <h3>Quick Actions</h3>
                        <div class="action-buttons">
                            ${hasPermission('viewComplaints') ? `
                            <button class="btn btn-primary" onclick="window.router.navigate('/admin/complaints')">View Complaints</button>
                            ` : ''}
                            
                            <button class="btn btn-outline" onclick="window.router.navigate('/admin/my-permissions')">Request Access</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await adminService.logout();
        window.router.navigate('/admin/login');
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
