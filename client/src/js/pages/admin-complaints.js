/**
 * Admin Complaints Management - Enhanced
 * Features: Kanban Board, List View, Advanced Filtering
 */

import { adminService } from '../api/admin.service.js';
import * as complaintAdminService from '../api/complaint-admin.service.js';
import Loading from '../components/loading.js';

let currentView = 'kanban'; // 'kanban' or 'list'
let complaintsData = [];
let currentFilters = {};

export async function renderAdminComplaintsPage() {
    const app = document.getElementById('app');
    const admin = adminService.getCurrentAdmin();

    if (!admin) {
        window.router.navigate('/admin/login');
        return;
    }

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
                        <div class="admin-avatar">${admin.firstName[0]}</div>
                        <div class="admin-info">
                            <h4>${admin.firstName} ${admin.lastName}</h4>
                            <p>${admin.role.replace('_', ' ').toUpperCase()}</p>
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

                <!-- Content Area -->
                <div id="adminContent" style="position: relative; min-height: 400px;"></div>
            </main>
        </div>

        <!-- Detail Modal Placeholder -->
        <div id="complaintDetailModal" class="modal-overlay" style="display: none;"></div>
    `;

    // Initialize Global for View Switching
    window.switchView = (view) => {
        currentView = view;
        renderAdminComplaintsPage(); // Re-render with new view
    };

    window.viewComplaint = {
        filterToggle: () => {
            // To be implemented: Toggle filter sidebar
            alert('Advanced filters coming soon');
        },
        open: openComplaintDetail
    };

    // Load Data
    await loadData();
}

async function loadData() {
    const container = document.getElementById('adminContent');
    container.innerHTML = Loading.skeleton(400, "100%");

    try {
        const response = await complaintAdminService.getComplaints({ limit: 100 }); // Fetch more for Kanban
        complaintsData = response.data.complaints;
        renderContent();
    } catch (error) {
        container.innerHTML = `<div class="error-message">Failed to load data: ${error.message}</div>`;
    }
}

function renderContent() {
    const container = document.getElementById('adminContent');

    if (currentView === 'kanban') {
        renderKanban(container);
    } else {
        renderList(container);
    }
}

function renderKanban(container) {
    const columns = {
        'Pending': complaintsData.filter(c => c.status === 'Pending'),
        'In Progress': complaintsData.filter(c => c.status === 'In Progress'),
        'Resolved': complaintsData.filter(c => c.status === 'Resolved'),
        'Rejected': complaintsData.filter(c => c.status === 'Rejected')
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
        <div class="kanban-card" onclick="viewComplaint.open('${c._id}')">
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

function renderList(container) {
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
                    ${complaintsData.map(c => `
                        <tr>
                            <td>#${c._id.substring(c._id.length - 6).toUpperCase()}</td>
                            <td>${c.title}</td>
                            <td>${c.category}</td>
                            <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
                            <td><span class="priority-badge priority-${c.priority.toLowerCase()}">${c.priority}</span></td>
                            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn-sm" onclick="viewComplaint.open('${c._id}')">👁️</button>
                            </td>
                        </tr>
                    `).join('')}
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
                                    <strong>Attachment:</strong> <a href="${c.mediaUrl}" target="_blank">View Media</a>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="case-section">
                            <h3>Action Required</h3>
                            <div class="form-group">
                                <label>Update Status</label>
                                <select id="updateStatusSelect" class="form-input">
                                    <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                    <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Review Note</label>
                                <textarea id="statusReason" class="form-input" placeholder="Why are you changing the status?"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="updateComplaintStatus('${c._id}')">Update Case</button>
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
                await complaintAdminService.updateStatus(id, newStatus.toLowerCase().replace(' ', '_'), reason);
                alert('Status Updated!');
                document.getElementById('complaintDetailModal').style.display = 'none';
                loadData(); // Refresh board
            } catch (e) {
                alert('Error updating status');
            }
        };

    } catch (error) {
        modal.innerHTML = `<div class="error-message">Failed to load details</div>`;
    }
}
