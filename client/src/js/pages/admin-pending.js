/**
 * Admin Pending Approvals Page
 */

import { adminService } from '../api/admin.service.js';

export async function renderAdminPendingPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin || admin.role !== 'super_admin') {
        window.router.navigate('/admin/dashboard');
        return;
    }

    app.innerHTML = `
        <div class="dashboard-layout admin-theme">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="logo">Meri Shikayat</div>
                    <div class="admin-badge">ADMIN PORTAL</div>
                </div>
                <nav class="sidebar-nav">
                    <a href="/admin/dashboard" class="nav-item">Dashboard</a>
                    <a href="/admin/pending" class="nav-item active">Pending Admins</a>
                </nav>
            </aside>

            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">Pending Admin Approvals</h1>
                    <button class="btn btn-outline" onclick="window.router.navigate('/admin/dashboard')">Back</button>
                </header>

                <div id="loadingState" class="loading-message">Loading pending requests...</div>
                <div id="errorState" class="error-message" style="display: none;"></div>
                
                <div id="pendingList" class="admin-table-container"></div>
            </main>
        </div>
    `;

    try {
        const response = await adminService.getPendingAdmins();
        const pendingAdmins = response.data;
        const listContainer = document.getElementById('pendingList');
        document.getElementById('loadingState').style.display = 'none';

        if (pendingAdmins.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No pending admin registrations.</div>';
            return;
        }

        listContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pendingAdmins.map(admin => `
                        <tr id="row-${admin._id}">
                            <td>${admin.firstName} ${admin.lastName}</td>
                            <td>${admin.email}</td>
                            <td>${admin.phone}</td>
                            <td>${admin.department || '-'}</td>
                            <td>${admin.designation || '-'}</td>
                            <td>${new Date(admin.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-success approve-btn" data-id="${admin._id}">Approve</button>
                                <button class="btn btn-sm btn-danger reject-btn" data-id="${admin._id}">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Add event listeners
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => handleApprove(btn.dataset.id));
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => handleReject(btn.dataset.id));
        });

    } catch (error) {
        document.getElementById('loadingState').style.display = 'none';
        const errorDiv = document.getElementById('errorState');
        errorDiv.textContent = 'Failed to load pending admins.';
        errorDiv.style.display = 'block';
    }

    // Handle navigation
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.router.navigate(href);
        });
    });
}

async function handleApprove(id) {
    if (!confirm('Are you sure you want to approve this admin?')) return;

    try {
        // Prompt for role
        const role = prompt('Assign Role (viewer, moderator, manager):', 'viewer');
        if (!role) return;

        await adminService.approveAdmin(id, { role });

        // Remove row
        document.getElementById(`row-${id}`).remove();
        alert('Admin approved successfully');
    } catch (error) {
        alert('Failed to approve admin');
    }
}

async function handleReject(id) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
        await adminService.rejectAdmin(id, reason);

        // Remove row
        document.getElementById(`row-${id}`).remove();
        alert('Admin rejected successfully');
    } catch (error) {
        alert('Failed to reject admin');
    }
}
