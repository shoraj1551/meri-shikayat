/**
 * Admin Permission Requests Page - For Super Admin
 */

import { adminService } from '../api/admin.service.js';
import { escapeHtmlDeep } from '../utils/html.js';
import { Loading } from '../components/loading.js';

export async function renderPermissionRequestsPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin || admin.role !== 'super_admin') {
        window.router.navigate('/admin/dashboard');
        return;
    }

    const safeAdmin = escapeHtmlDeep(admin);

    app.innerHTML = `
        <div class="dashboard-layout admin-theme">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="logo">Meri Shikayat</div>
                    <div class="admin-badge">ADMIN PORTAL</div>
                </div>
                <nav class="sidebar-nav">
                    <a href="/admin/dashboard" class="nav-item">
                        <i class="icon">📊</i> Dashboard
                    </a>
                    <a href="/admin/pending" class="nav-item">
                        <i class="icon">⏳</i> Pending Admins
                    </a>
                    <a href="/admin/permission-requests" class="nav-item active">
                        <i class="icon">🔑</i> Permissions
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-name">${safeAdmin.firstName} ${safeAdmin.lastName}</div>
                        <div class="user-role">SUPER ADMIN</div>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button>
                </div>
            </aside>

            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">Permission Requests</h1>
                    <button class="btn btn-outline" onclick="window.router.navigate('/admin/dashboard')">
                        <span class="btn-icon">←</span> Back
                    </button>
                </header>

                <div id="loadingState">${Loading.state('loading', { message: 'Loading permission requests', count: 3 })}</div>
                <div id="errorState" class="error-message" style="display: none;"></div>
                
                <div id="requestsList" class="admin-pending-grid"></div>
            </main>
        </div>
    `;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await adminService.logout();
        window.location.href = '/admin/login';
    });

    try {
        const response = await adminService.getPermissionRequests();
        const requests = escapeHtmlDeep(response.data);
        const listContainer = document.getElementById('requestsList');
        document.getElementById('loadingState').style.display = 'none';

        if (requests.length === 0) {
            listContainer.innerHTML = Loading.empty('No permission requests', 'New administrator permission requests will appear here.');
            return;
        }

        listContainer.innerHTML = requests.map(request => `
            <div class="pending-admin-card" id="request-${request._id}">
                <div class="admin-card-header">
                    <div class="admin-info">
                        <h4>${request.adminId.firstName} ${request.adminId.lastName}</h4>
                        <p class="admin-email">${request.adminId.email} • ${request.adminId.role.replace('_', ' ')}</p>
                    </div>
                </div>
                
                <div class="admin-details-grid">
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Requested Permissions</span>
                        <div class="permission-grid" style="margin-top: 0.5rem;">
                            ${request.requestedPermissions.map(perm => `
                                <div class="permission-item active">
                                    <span class="status-indicator"></span>
                                    ${perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Justification</span>
                        <span class="detail-value">${request.reason}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Requested On</span>
                        <span class="detail-value">${new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
                
                <div class="admin-actions">
                    <button class="btn btn-sm btn-success approve-request-btn" data-id="${request._id}">
                        <span class="btn-icon">✓</span> Approve
                    </button>
                    <button class="btn btn-sm btn-danger reject-request-btn" data-id="${request._id}">
                        <span class="btn-icon">✗</span> Reject
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.approve-request-btn').forEach(btn => {
            btn.addEventListener('click', () => handleApproveRequest(btn.dataset.id));
        });

        document.querySelectorAll('.reject-request-btn').forEach(btn => {
            btn.addEventListener('click', () => handleRejectRequest(btn.dataset.id));
        });

    } catch (error) {
        document.getElementById('loadingState').style.display = 'none';
        const errorDiv = document.getElementById('errorState');
        errorDiv.innerHTML = Loading.error('Requests unavailable', 'We could not load permission requests.', { actionLabel: 'Try again' });
        errorDiv.style.display = 'block';
        errorDiv.querySelector('[data-state-action="retry"]')?.addEventListener('click', renderPermissionRequestsPage);
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

async function handleApproveRequest(id) {
    const approved = await window.appFeedback.confirmAction({
        title: 'Approve permission request?',
        message: 'The administrator will receive the requested complaint-management permissions.',
        confirmLabel: 'Approve request'
    });
    if (!approved) return;

    try {
        await adminService.approvePermissionRequest(id);

        // Remove card with animation
        const card = document.getElementById(`request-${id}`);
        card.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => card.remove(), 300);

        window.appFeedback.notify('Permission request approved successfully.', { type: 'success' });
    } catch (error) {
        window.appFeedback.notify('Failed to approve request: ' + (error.response?.data?.message || error.message), { type: 'error' });
    }
}

async function handleRejectRequest(id) {
    const notes = await window.appFeedback.requestText({
        title: 'Reject permission request?',
        message: 'Add an optional explanation for the administrator.',
        label: 'Reason for rejection',
        placeholder: 'Explain why this request is being rejected',
        confirmLabel: 'Reject request',
        tone: 'danger'
    });
    if (notes === null) return;

    try {
        await adminService.rejectPermissionRequest(id, notes || 'No reason provided');

        // Remove card with animation
        const card = document.getElementById(`request-${id}`);
        card.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => card.remove(), 300);

        window.appFeedback.notify('Permission request rejected.', { type: 'success' });
    } catch (error) {
        window.appFeedback.notify('Failed to reject request: ' + (error.response?.data?.message || error.message), { type: 'error' });
    }
}
