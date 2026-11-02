/**
 * Admin Complaints Management - Enhanced
 * Features: Kanban Board, List View, Advanced Filtering
 */

import { adminService } from '../api/admin.service.js';
import * as complaintAdminService from '../api/complaint-admin.service.js';
import { Loading } from '../components/loading.js';
import { escapeHtml, escapeHtmlDeep, escapeJsString, safeUrl } from '../utils/html.js';

let currentView = 'kanban'; // 'kanban' or 'list'
let complaintsData = [];
let currentFilters = {};

const formatStatus = status => ({
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
}[status] || status);

export async function renderAdminComplaintsPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin) {
        window.router.navigate('/admin/login');
        return;
    }

    const safeAdmin = escapeHtmlDeep(admin);

    // Initial Layout
    app.innerHTML = `
        <div class="admin-layout">
            <!-- Sidebar -->
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <span class="admin-logo">MERI SHIKAYAT</span>
                </div>
                <nav class="sidebar-nav">
                    <a href="/admin/dashboard" class="nav-link">
                        <span class="nav-icon">📊</span> Dashboard
                    </a>
                    <a href="/admin/complaints" class="nav-link active">
                        <span class="nav-icon">📝</span> Complaints
                    </a>
                    <a href="/admin/users" class="nav-link">
                        <span class="nav-icon">👥</span> Users
                    </a>
                    ${admin.role === 'super_admin' ? `
                    <a href="/admin/pending" class="nav-link">
                        <span class="nav-icon">⏳</span> Pending Admins
                    </a>
                    ` : ''}
                </nav>
                <div class="sidebar-footer">
                    <div class="admin-profile">
                        <div class="admin-avatar">${safeAdmin.firstName[0]}</div>
                        <div class="admin-info">
                            <h4>${safeAdmin.firstName} ${safeAdmin.lastName}</h4>
                            <p>${safeAdmin.role.replace('_', ' ').toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="admin-main">
                <div class="page-header">
                    <div class="page-title">
                        <h1>Complaint Management</h1>
                        <p style="color: #64748b; margin-top: 4px;">Manage and track community issues</p>
                    </div>
                    <div class="header-actions" style="display: flex; gap: 1rem;">
                        <div class="view-controls">
                            <button class="view-btn ${currentView === 'kanban' ? 'active' : ''}" onclick="switchView('kanban')">
                                📋 Kanban
                            </button>
                            <button class="view-btn ${currentView === 'list' ? 'active' : ''}" onclick="switchView('list')">
                                📄 List
                            </button>
                        </div>
                        <button class="btn btn-primary" onclick="window.viewComplaint.filterToggle()">
                           🔍 Filters
                        </button>
                    </div>
                </div>

                <section id="complaintFilters" class="admin-filter-panel" hidden aria-label="Complaint filters">
                    <label>Status
                        <select id="filterStatus" class="form-input">
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </label>
                    <label>Priority
                        <select id="filterPriority" class="form-input">
                            <option value="">All priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </label>
                    <label>Search
                        <input id="filterSearch" class="form-input" type="search" placeholder="Title, ID, category or location">
                    </label>
                    <button id="clearComplaintFilters" type="button" class="btn btn-outline">Clear filters</button>
                </section>

                <!-- Content Area -->
                <div id="adminContent" style="position: relative; min-height: 400px;"></div>
            </main>
        </div>

        <!-- Complaint detail modal -->
        <div id="complaintDetailModal" class="modal-overlay" style="display: none;"></div>
    `;

    // Initialize Global for View Switching
    window.switchView = (view) => {
        currentView = view;
        document.querySelectorAll('.view-btn').forEach(button => button.classList.remove('active'));
        document.querySelector(`.view-btn[onclick="switchView('${view}')"]`)?.classList.add('active');
        renderContent();
    };

    window.viewComplaint = {
        filterToggle: () => {
            const panel = document.getElementById('complaintFilters');
            panel.hidden = !panel.hidden;
            if (!panel.hidden) document.getElementById('filterStatus').focus();
        },
        open: openComplaintDetail
    };

    const applyFilters = () => {
        currentFilters = {
            status: document.getElementById('filterStatus').value,
            priority: document.getElementById('filterPriority').value,
            search: document.getElementById('filterSearch').value.trim().toLowerCase()
        };
        renderContent();
    };
    ['filterStatus', 'filterPriority', 'filterSearch'].forEach(id => {
        document.getElementById(id).addEventListener(id === 'filterSearch' ? 'input' : 'change', applyFilters);
    });
    document.getElementById('clearComplaintFilters').addEventListener('click', () => {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPriority').value = '';
        document.getElementById('filterSearch').value = '';
        currentFilters = {};
        renderContent();
    });

    // Load Data
    await loadData();
}

async function loadData() {
    const container = document.getElementById('adminContent');
    container.innerHTML = Loading.skeleton(400, "100%");

    try {
        const response = await complaintAdminService.getComplaints({ limit: 100 }); // Fetch more for Kanban
        complaintsData = response.data.complaints.map(complaint => ({
            ...escapeHtmlDeep(complaint),
            category: escapeHtml(complaint.category?.name || complaint.category || 'Uncategorized'),
            mediaUrl: safeUrl(complaint.mediaUrl)
        }));
        renderContent();
    } catch (error) {
        container.innerHTML = Loading.error('Complaints unavailable', 'We could not load complaint records.', { actionLabel: 'Try again' });
        container.querySelector('[data-state-action="retry"]')?.addEventListener('click', loadData);
    }
}

function renderContent() {
    const container = document.getElementById('adminContent');
    const filteredComplaints = complaintsData.filter(complaint => {
        if (currentFilters.status && complaint.status !== currentFilters.status) return false;
        if (currentFilters.priority && complaint.priority?.toLowerCase() !== currentFilters.priority) return false;
        if (currentFilters.search) {
            const category = typeof complaint.category === 'object' ? complaint.category?.name : complaint.category;
            const haystack = [complaint._id, complaint.complaintId, complaint.title, category, complaint.location?.address, complaint.location?.city]
                .filter(Boolean).join(' ').toLowerCase();
            if (!haystack.includes(currentFilters.search)) return false;
        }
        return true;
    });

    if (filteredComplaints.length === 0) {
        container.innerHTML = Loading.empty(
            currentFilters.search || currentFilters.status || currentFilters.priority ? 'No matching complaints' : 'No complaints yet',
            currentFilters.search || currentFilters.status || currentFilters.priority ? 'Change or clear the current filters to see more results.' : 'Submitted complaints will appear here.'
        );
        return;
    }

    if (currentView === 'kanban') {
        renderKanban(container, filteredComplaints);
    } else {
        renderList(container, filteredComplaints);
    }
}

function renderKanban(container, complaints) {
    const columns = {
        'Pending': complaints.filter(c => c.status === 'pending'),
        'In Progress': complaints.filter(c => c.status === 'in_progress'),
        'Resolved': complaints.filter(c => c.status === 'resolved'),
        'Rejected': complaints.filter(c => c.status === 'rejected')
    };

    const colClasses = {
        'Pending': 'col-pending',
        'In Progress': 'col-inprogress',
        'Resolved': 'col-resolved',
        'Rejected': 'col-rejected'
    };

    const html = `
        <div class="kanban-board">
            ${Object.keys(columns).map(status => `
                <div class="kanban-column ${colClasses[status]}">
                    <div class="kanban-header">
                        <span>${status}</span>
                        <span class="badge-count">${columns[status].length}</span>
                    </div>
                    <div class="kanban-body">
                        ${columns[status].map(c => createKanbanCard(c)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function createKanbanCard(c) {
    const date = new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `
        <div class="kanban-card" onclick="viewComplaint.open('${escapeJsString(c._id)}')">
            <div class="kanban-card-meta">
                <span>#${c._id.substring(c._id.length - 6).toUpperCase()}</span>
                <span>${date}</span>
            </div>
            <div class="kanban-card-title">${c.title}</div>
            <div class="kanban-tags">
                <span class="k-tag">${c.category}</span>
                <span class="k-tag k-priority-${c.priority.toLowerCase()}">${c.priority}</span>
                <span class="k-tag">📍 ${c.location?.city || 'Unknown'}</span>
            </div>
        </div>
    `;
}

function renderList(container, complaints) {
    const html = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${complaints.map(c => {
                        c._id = escapeJsString(c._id);
                        return `
                        <tr>
                            <td>#${c._id.substring(c._id.length - 6).toUpperCase()}</td>
                            <td>${c.title}</td>
                            <td>${c.category}</td>
                            <td><span class="status-badge status-${c.status}">${formatStatus(c.status)}</span></td>
                            <td><span class="priority-badge priority-${c.priority.toLowerCase()}">${c.priority}</span></td>
                            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn-sm" onclick="viewComplaint.open('${c._id}')">👁️</button>
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = html;
}

async function openComplaintDetail(id) {
    const modal = document.getElementById('complaintDetailModal');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-dialog case-file-modal">
            ${Loading.skeleton(200, "100%")}
        </div>
    `;

    try {
        const response = await complaintAdminService.getComplaintById(id);
        const c = response.data;

        modal.innerHTML = `
            <div class="modal-dialog case-file-modal">
                <div class="case-header">
                    <div>
                        <h2 style="margin:0; font-size: 1.5rem;">${c.title}</h2>
                        <span style="color: #64748b; font-size: 0.9rem;">Case ID: #${c._id}</span>
                    </div>
                    <button class="btn btn-outline" onclick="document.getElementById('complaintDetailModal').style.display='none'">Close</button>
                </div>
                <div class="case-body">
                    <div class="case-main">
                        <div class="case-section">
                            <h3>Description</h3>
                            <p style="line-height: 1.6; color: #334155;">${c.description}</p>
                            ${c.mediaUrl ? `
                                <div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                                    <strong>Attachment:</strong> <a href="${c.mediaUrl}" target="_blank" rel="noopener noreferrer">View Media</a>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="case-section">
                            <h3>Action Required</h3>
                            <div class="form-group">
                                <label>Update Status</label>
                                <select id="updateStatusSelect" class="form-input">
                                     <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
                                     <option value="in_progress" ${c.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                     <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                     <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Review Note</label>
                                <textarea id="statusReason" class="form-input" placeholder="Why are you changing the status?"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="updateComplaintStatus('${escapeJsString(c._id)}')">Update Case</button>
                        </div>
                    </div>
                    
                    <div class="case-sidebar-col">
                        <div class="case-section">
                            <h3>Complainant</h3>
                            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                                <div style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center;">👤</div>
                                <div>
                                    <div style="font-weight: 600;">${c.user.firstName} ${c.user.lastName}</div>
                                    <div style="font-size: 0.85rem; color: #64748b;">${c.user.email}</div>
                                </div>
                            </div>
                            <div>
                                <strong>Phone:</strong> ${c.user.phone || 'N/A'}
                            </div>
                        </div>
                        
                        <div class="case-section">
                            <h3>Location</h3>
                             <p>📍 ${c.location?.address || 'No address provided'}</p>
                             <p>City: ${c.location?.city || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Expose update function specifically for this modal
        window.updateComplaintStatus = async (id) => {
            const newStatus = document.getElementById('updateStatusSelect').value;
            const reason = document.getElementById('statusReason').value;

            try {
                await complaintAdminService.updateComplaintStatus(id, newStatus, reason);
                window.appFeedback.notify('Complaint status updated.', { type: 'success' });
                document.getElementById('complaintDetailModal').style.display = 'none';
                loadData(); // Refresh board
            } catch (e) {
                window.appFeedback.notify('Unable to update the complaint status.', { type: 'error' });
            }
        };

    } catch (error) {
        modal.innerHTML = Loading.error('Complaint unavailable', 'We could not load the complaint details.', { compact: true });
    }
}
