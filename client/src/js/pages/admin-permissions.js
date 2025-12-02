/**
 * Admin Permissions Page
 */

import { adminService } from '../api/admin.service.js';

export function renderAdminPermissionsPage() {
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
                    <a href="/admin/dashboard" class="nav-item">Dashboard</a>
                    <a href="/admin/my-permissions" class="nav-item active">My Access</a>
                </nav>
            </aside>

            <main class="main-content">
                <header class="top-bar">
                    <h1 class="page-title">My Permissions</h1>
                    <button class="btn btn-outline" onclick="window.router.navigate('/admin/dashboard')">Back</button>
                </header>

                <div class="dashboard-grid">
                    <!-- Current Permissions -->
                    <div class="card admin-card">
                        <h3>Current Access Level</h3>
                        <div class="permission-grid">
                            ${Object.entries(admin.permissions || {}).map(([key, value]) => `
                                <div class="permission-item ${value ? 'active' : 'inactive'}">
                                    <span class="status-indicator"></span>
                                    ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Request New Permissions -->
                    <div class="card admin-card">
                        <h3>Request Additional Access</h3>
                        <form id="permissionRequestForm">
                            <div class="form-group">
                                <label>Select Permissions Needed:</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="perms" value="viewComplaints"> View Complaints</label>
                                    <label><input type="checkbox" name="perms" value="editComplaints"> Edit Complaints</label>
                                    <label><input type="checkbox" name="perms" value="deleteComplaints"> Delete Complaints</label>
                                    <label><input type="checkbox" name="perms" value="viewUsers"> View Users</label>
                                    <label><input type="checkbox" name="perms" value="editUsers"> Edit Users</label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="reason">Justification *</label>
                                <textarea id="reason" class="form-input" rows="3" required minlength="20" placeholder="Why do you need these permissions?"></textarea>
                            </div>

                            <div id="msg" class="message" style="display:none"></div>

                            <button type="submit" class="btn btn-primary">Submit Request</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Handle form submission
    document.getElementById('permissionRequestForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const checkboxes = document.querySelectorAll('input[name="perms"]:checked');
        const requestedPermissions = Array.from(checkboxes).map(cb => cb.value);
        const reason = document.getElementById('reason').value;
        const msgDiv = document.getElementById('msg');

        if (requestedPermissions.length === 0) {
            msgDiv.textContent = 'Please select at least one permission';
            msgDiv.className = 'error-message';
            msgDiv.style.display = 'block';
            return;
        }

        try {
            await adminService.requestPermissions({ requestedPermissions, reason });
            msgDiv.textContent = 'Request submitted successfully';
            msgDiv.className = 'success-message';
            msgDiv.style.display = 'block';
            e.target.reset();
        } catch (error) {
            msgDiv.textContent = error.response?.data?.message || 'Failed to submit request';
            msgDiv.className = 'error-message';
            msgDiv.style.display = 'block';
        }
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
