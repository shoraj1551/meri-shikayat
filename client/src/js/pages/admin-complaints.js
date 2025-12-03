/**
 * Admin Complaints Management Page
 * View, filter, and manage all complaints
 */

import { adminService } from '../api/admin.service.js';
import * as complaintAdminService from '../api/complaint-admin.service.js';

let currentPage = 1;
let currentFilters = {};

export async function renderAdminComplaintsPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin) {
        window.router.navigate('/admin/login');
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
                    <a href="/admin/dashboard" class="nav-item">
                        <i class="icon">📊</i> Dashboard
                    </a>
                    <a href="/admin/complaints" class="nav-item active">
                        <i class="icon">📝</i> Complaints
                    </a>
                    ${admin.role === 'super_admin' ? `
                    <a href="/admin/pending" class="nav-item">
                        <i class="icon">⏳</i> Pending Admins
                    </a>
                    <a href="/admin/permission-requests" class="nav-item">
                        <i class="icon">🔑</i> Permissions
                    </a>
                    ` : ''}
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-name">${admin.firstName} ${admin.lastName}</div>
                        <div class="user-role">${admin.role.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button>
                </div>
            </aside>

            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">Complaint Management</h1>
                </header>

                <!-- Filters -->
                <div class="glass-card filters-section">
                    <div class="filters-grid">
                        <div class="filter-item">
                            <label>Status</label>
                            <select id="filterStatus" class="form-input">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div class="filter-item">
                            <label>Priority</label>
                            <select id="filterPriority" class="form-input">
                                <option value="">All Priorities</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div class="filter-item">
                            <label>Category</label>
                            <select id="filterCategory" class="form-input">
                                <option value="">All Categories</option>
                                <option value="Roads">Roads</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Water">Water</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Street Lights">Street Lights</option>
                                <option value="Parks">Parks</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="filter-item">
                            <label>Search</label>
                            <input type="text" id="filterSearch" class="form-input" placeholder="Search title or description...">
                        </div>
                    </div>
                    <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
                    <button id="clearFilters" class="btn btn-outline">Clear</button>
                </div>

                <div id="loadingState" class="glass-card loading-message">Loading complaints...</div>
                <div id="errorState" class="error-message" style="display: none;"></div>
                
                <div id="complaintsContainer"></div>
                
                <div id="paginationContainer" class="pagination-container"></div>
            </main>
        </div>

        <!-- Complaint Detail Modal -->
        <div id="complaintDetailModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card modal-large">
                <div class="modal-header">
                    <h3>Complaint Details</h3>
                    <button class="modal-close" onclick="closeComplaintModal()">×</button>
                </div>
                <div id="complaintDetailContent"></div>
            </div>
        </div>

        <!-- Status Update Modal -->
        <div id="statusUpdateModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Update Status</h3>
                <div class="form-group">
                    <label>New Status *</label>
                    <select id="newStatus" class="form-input">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Reason</label>
                    <textarea id="statusReason" class="form-input" rows="3" placeholder="Reason for status change..."></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeStatusModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="confirmStatusUpdate()">Update Status</button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await adminService.logout();
        window.location.href = '/admin/login';
    });

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Handle navigation
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.router.navigate(link.getAttribute('href'));
        });
    });

    // Load complaints
    await loadComplaints();
}

async function loadComplaints(page = 1) {
    currentPage = page;
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const container = document.getElementById('complaintsContainer');

    loadingState.style.display = 'block';
    errorState.style.display = 'none';

    try {
        const filters = { ...currentFilters, page, limit: 20 };
        const response = await complaintAdminService.getComplaints(filters);

        loadingState.style.display = 'none';

        if (response.data.complaints.length === 0) {
            container.innerHTML = '<div class="glass-card empty-state">No complaints found.</div>';
            return;
        }

        renderComplaints(response.data.complaints);
        renderPagination(response.data.pagination);
    } catch (error) {
        loadingState.style.display = 'none';
        errorState.textContent = 'Failed to load complaints.';
        errorState.style.display = 'block';
    }
}

function renderComplaints(complaints) {
    const container = document.getElementById('complaintsContainer');

    container.innerHTML = `
        <div class="complaints-grid">
            ${complaints.map(complaint => `
                <div class="complaint-card glass-card">
                    <div class="complaint-header">
                        <div>
                            <h4>${complaint.title}</h4>
                            <p class="complaint-meta">
                                ${complaint.user.firstName} ${complaint.user.lastName} • 
                                ${new Date(complaint.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="complaint-badges">
                            <span class="status-badge status-${complaint.status}">${complaint.status.replace('_', ' ')}</span>
                            <span class="priority-badge priority-${complaint.priority}">${complaint.priority}</span>
                        </div>
                    </div>
                    
                    <p class="complaint-description">${complaint.description.substring(0, 150)}${complaint.description.length > 150 ? '...' : ''}</p>
                    
                    <div class="complaint-info">
                        <span class="info-item">📁 ${complaint.category}</span>
                        <span class="info-item">📍 ${complaint.location?.pincode || 'N/A'}</span>
                        ${complaint.assignedTo ? `<span class="info-item">👤 ${complaint.assignedTo.firstName}</span>` : ''}
                    </div>
                    
                    <div class="complaint-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewComplaint('${complaint._id}')">View Details</button>
                        <button class="btn btn-sm btn-primary" onclick="openStatusModal('${complaint._id}', '${complaint.status}')">Update Status</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPagination(pagination) {
    const container = document.getElementById('paginationContainer');

    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
        pages.push(`
            <button class="pagination-btn ${i === pagination.page ? 'active' : ''}" 
                    onclick="loadComplaints(${i})">${i}</button>
        `);
    }

    container.innerHTML = `
        <div class="pagination">
            <button class="pagination-btn" ${pagination.page === 1 ? 'disabled' : ''} 
                    onclick="loadComplaints(${pagination.page - 1})">Previous</button>
            ${pages.join('')}
            <button class="pagination-btn" ${pagination.page === pagination.pages ? 'disabled' : ''} 
                    onclick="loadComplaints(${pagination.page + 1})">Next</button>
        </div>
    `;
}

function applyFilters() {
    currentFilters = {
        status: document.getElementById('filterStatus').value,
        priority: document.getElementById('filterPriority').value,
        category: document.getElementById('filterCategory').value,
        search: document.getElementById('filterSearch').value
    };

    // Remove empty filters
    Object.keys(currentFilters).forEach(key => {
        if (!currentFilters[key]) delete currentFilters[key];
    });

    loadComplaints(1);
}

function clearFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterSearch').value = '';
    currentFilters = {};
    loadComplaints(1);
}

let currentComplaintId = null;

window.viewComplaint = async function (id) {
    // Implement in next task (A6)
    alert('Complaint detail view - Coming in next task');
};

window.openStatusModal = function (id, currentStatus) {
    currentComplaintId = id;
    document.getElementById('newStatus').value = currentStatus;
    document.getElementById('statusReason').value = '';
    document.getElementById('statusUpdateModal').style.display = 'flex';
};

window.closeStatusModal = function () {
    document.getElementById('statusUpdateModal').style.display = 'none';
    currentComplaintId = null;
};

window.confirmStatusUpdate = async function () {
    const status = document.getElementById('newStatus').value;
    const reason = document.getElementById('statusReason').value;

    try {
        await complaintAdminService.updateComplaintStatus(currentComplaintId, status, reason);
        closeStatusModal();
        alert('✅ Status updated successfully');
        loadComplaints(currentPage);
    } catch (error) {
        alert('❌ Failed to update status: ' + (error.response?.data?.message || error.message));
    }
};

window.closeComplaintModal = function () {
    document.getElementById('complaintDetailModal').style.display = 'none';
};
