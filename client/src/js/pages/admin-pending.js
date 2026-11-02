/**
 * Admin Pending Approvals Page - Enhanced UI with Modals
 */

import { adminService } from '../api/admin.service.js';
import { escapeHtmlDeep } from '../utils/html.js';
import { Loading } from '../components/loading.js';

let currentAdminId = null;
let currentAction = null;

export async function renderAdminPendingPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin || admin.role !== 'super_admin') {
        window.router.navigate('/admin/dashboard');
        return;
    }

    const safeCurrentAdmin = escapeHtmlDeep(admin);

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
                    <a href="/admin/pending" class="nav-item active">
                        <i class="icon">⏳</i> Pending Admins
                    </a>
                    <a href="/admin/permission-requests" class="nav-item">
                        <i class="icon">🔑</i> Permissions
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-name">${safeCurrentAdmin.firstName} ${safeCurrentAdmin.lastName}</div>
                        <div class="user-role">SUPER ADMIN</div>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button>
                </div>
            </aside>

            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">Pending Admin Approvals</h1>
                    <button class="btn btn-outline" onclick="window.router.navigate('/admin/dashboard')">
                        <span class="btn-icon">←</span> Back
                    </button>
                </header>

                <div id="loadingState">${Loading.state('loading', { message: 'Loading pending registrations', count: 3 })}</div>
                <div id="errorState" class="error-message" style="display: none;"></div>
                
                <div id="pendingList" class="admin-pending-grid"></div>
            </main>
        </div>

        <!-- Approval Modal -->
        <div id="approvalModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Approve Admin</h3>
                <p>Select a role to assign to this admin:</p>
                <div class="form-group">
                    <label for="roleSelect">Role *</label>
                    <select id="roleSelect" class="form-input">
                        <option value="viewer">Viewer - View only access</option>
                        <option value="moderator">Moderator - View and edit complaints</option>
                        <option value="manager">Manager - Full complaint and user management</option>
                        <option value="super_admin">Super Admin - Full system access</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-success" onclick="confirmApproval()">
                        <span class="btn-icon">✓</span> Approve
                    </button>
                </div>
            </div>
        </div>

        <!-- Rejection Modal -->
        <div id="rejectionModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Reject Admin Application</h3>
                <p>Please provide a detailed reason for rejection:</p>
                <div class="form-group">
                    <label for="rejectionReason">Rejection Reason *</label>
                    <textarea 
                        id="rejectionReason" 
                        class="form-input" 
                        rows="4" 
                        placeholder="Explain why this application is being rejected (minimum 20 characters)..."
                        minlength="20"
                    ></textarea>
                    <div class="char-counter">
                        <span id="charCount">0</span> / 20 characters minimum
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmRejection()" id="rejectBtn" disabled>
                        <span class="btn-icon">✗</span> Reject
                    </button>
                </div>
            </div>
        </div>
    `;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await adminService.logout();
        window.location.href = '/admin/login';
    });

    // Character counter for rejection reason
    const rejectionTextarea = document.getElementById('rejectionReason');
    const charCount = document.getElementById('charCount');
    const rejectBtn = document.getElementById('rejectBtn');

    if (rejectionTextarea) {
        rejectionTextarea.addEventListener('input', () => {
            const length = rejectionTextarea.value.trim().length;
            charCount.textContent = length;
            rejectBtn.disabled = length < 20;
        });
    }

    try {
        const response = await adminService.getPendingAdmins();
        const pendingAdmins = escapeHtmlDeep(response.data);
        const listContainer = document.getElementById('pendingList');
        document.getElementById('loadingState').style.display = 'none';

        if (pendingAdmins.length === 0) {
            listContainer.innerHTML = Loading.empty('No pending registrations', 'New administrator registrations awaiting review will appear here.');
            return;
        }

        listContainer.innerHTML = pendingAdmins.map(admin => `
            <div class="pending-admin-card" id="card-${admin._id}">
                <div class="admin-card-header">
                    <div class="admin-info">
                        <h4>${admin.firstName} ${admin.lastName}</h4>
                        <p class="admin-email">${admin.email}</p>
                    </div>
                </div>
                
                <div class="admin-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${admin.phone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Department</span>
                        <span class="detail-value">${admin.department || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Designation</span>
                        <span class="detail-value">${admin.designation || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Registered On</span>
                        <span class="detail-value">${new Date(admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
                
                <div class="admin-actions">
                    <button class="btn btn-sm btn-success approve-btn" data-id="${admin._id}">
                        <span class="btn-icon">✓</span> Approve
                    </button>
                    <button class="btn btn-sm btn-danger reject-btn" data-id="${admin._id}">
                        <span class="btn-icon">✗</span> Reject
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => openApprovalModal(btn.dataset.id));
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => openRejectionModal(btn.dataset.id));
        });

    } catch (error) {
        document.getElementById('loadingState').style.display = 'none';
        const errorDiv = document.getElementById('errorState');
        errorDiv.innerHTML = Loading.error('Registrations unavailable', 'We could not load pending administrator registrations.', { actionLabel: 'Try again' });
        errorDiv.style.display = 'block';
        errorDiv.querySelector('[data-state-action="retry"]')?.addEventListener('click', renderAdminPendingPage);
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

function openApprovalModal(id) {
    currentAdminId = id;
    currentAction = 'approve';
    document.getElementById('approvalModal').style.display = 'flex';
}

function openRejectionModal(id) {
    currentAdminId = id;
    currentAction = 'reject';
    document.getElementById('rejectionModal').style.display = 'flex';
    document.getElementById('rejectionReason').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('rejectBtn').disabled = true;
}

function closeModal() {
    document.getElementById('approvalModal').style.display = 'none';
    document.getElementById('rejectionModal').style.display = 'none';
    currentAdminId = null;
    currentAction = null;
}
window.closeModal = closeModal;

window.confirmApproval = async function () {
    const role = document.getElementById('roleSelect').value;

    try {
        const response = await adminService.approveAdmin(currentAdminId, { role });

        // Remove card with animation
        const card = document.getElementById(`card-${currentAdminId}`);
        card.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => card.remove(), 300);

        closeModal();
        window.appFeedback.notify(response.message || 'Admin approved successfully. Notification sent.', { type: 'success' });
    } catch (error) {
        window.appFeedback.notify('Failed to approve admin: ' + (error.response?.data?.message || error.message), { type: 'error' });
    }
};

window.confirmRejection = async function () {
    const reason = document.getElementById('rejectionReason').value.trim();

    if (reason.length < 20) {
        window.appFeedback.notify('Please provide a detailed reason (minimum 20 characters).', { type: 'warning' });
        return;
    }

    try {
        const response = await adminService.rejectAdmin(currentAdminId, reason);

        // Remove card with animation
        const card = document.getElementById(`card-${currentAdminId}`);
        card.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => card.remove(), 300);

        closeModal();
        window.appFeedback.notify(response.message || 'Admin rejected successfully. Notification sent.', { type: 'success' });
    } catch (error) {
        window.appFeedback.notify('Failed to reject admin: ' + (error.response?.data?.message || error.message), { type: 'error' });
    }
};
