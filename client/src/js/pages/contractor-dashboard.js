import apiClient from '../api/client.js';
import { escapeHtmlDeep } from '../utils/html.js';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value) || 0);

export async function renderContractorDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="dashboard-page"><div class="dashboard-container"><p>Loading contractor dashboard...</p></div></div>';

    try {
        const { data: response } = await apiClient.get('/contractors/dashboard/me');
        const data = escapeHtmlDeep(response.data);
        app.innerHTML = `
            <div class="dashboard-page"><div class="dashboard-container">
                <header class="dashboard-header"><div class="header-content"><h1>Contractor Dashboard</h1><p>${data.contractor.companyName || 'Contractor account'}</p></div></header>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-content"><h3 class="stat-value">${data.stats.assigned}</h3><p>Assigned Jobs</p></div></div>
                    <div class="stat-card"><div class="stat-content"><h3 class="stat-value">${data.stats.inProgress}</h3><p>In Progress</p></div></div>
                    <div class="stat-card"><div class="stat-content"><h3 class="stat-value">${data.stats.completed}</h3><p>Completed</p></div></div>
                    <div class="stat-card"><div class="stat-content"><h3 class="stat-value">${money(data.stats.totalEarnings)}</h3><p>Total Earnings</p></div></div>
                </div>
                <section class="content-section"><h2>Assigned Jobs</h2><div class="jobs-list">
                    ${data.assignments.length ? data.assignments.map(item => `<article class="glass-card">
                        <h3>${item.complaint?.title || 'Complaint unavailable'}</h3>
                        <p>${item.complaint?.complaintId || ''} · ${item.status}</p>
                        <p>${item.workDescription || 'No work instructions provided.'}</p>
                    </article>`).join('') : '<div class="empty-state"><h3>No persisted assignments</h3><p>Jobs will appear after an administrator assigns them.</p></div>'}
                </div></section>
            </div></div>`;
    } catch (error) {
        app.innerHTML = '<div class="dashboard-page"><div class="dashboard-container"><div class="error-state"><h1>Contractor dashboard unavailable</h1><p>Unable to load persisted contractor data.</p></div></div></div>';
    }
}
