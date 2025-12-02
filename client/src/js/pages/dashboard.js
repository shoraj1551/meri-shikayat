import { complaintService } from '../api/complaint.service.js';
import Chart from 'chart.js/auto';

export async function renderDashboardPage() {
    const app = document.getElementById('app');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Show loading state
    app.innerHTML = `
        <div class="dashboard-page">
            <div class="container">
                <div class="loading-spinner">Loading dashboard...</div>
            </div>
        </div>
    `;

    try {
        const myComplaintsResponse = await complaintService.getMyComplaints();
        const myComplaints = myComplaintsResponse.data || [];

        let dashboardContent = '';

        if (myComplaints.length > 0) {
            // Scenario A: User has complaints
            const stats = {
                total: myComplaints.length,
                pending: myComplaints.filter(c => c.status === 'Pending').length,
                resolved: myComplaints.filter(c => c.status === 'Resolved').length,
                rejected: myComplaints.filter(c => c.status === 'Rejected').length
            };

            dashboardContent = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-label">Total Complaints</span>
                        <div class="stat-value">${stats.total}</div>
                    </div>
                    <div class="stat-card pending">
                        <span class="stat-label">Pending</span>
                        <div class="stat-value">${stats.pending}</div>
                    </div>
                    <div class="stat-card resolved">
                        <span class="stat-label">Resolved</span>
                        <div class="stat-value">${stats.resolved}</div>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="glass-card">
                        <h3>Complaint Status Overview</h3>
                        <div class="chart-container">
                            <canvas id="complaintChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-card">
                        <h3>Quick Actions</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                            <button class="btn btn-primary btn-block" onclick="window.router.navigate('/submit-complaint')">
                                + New Complaint
                            </button>
                            <button class="btn btn-secondary btn-block">
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div class="section-header">
                    <h2>My Complaints History</h2>
                </div>
                <div class="complaints-list">
                    ${myComplaints.map(complaint => renderComplaintCard(complaint)).join('')}
                </div>
            `;

            // Render Chart after DOM update
            setTimeout(() => {
                renderChart(stats);
            }, 0);

        } else {
            // Scenario B: User has 0 complaints
            const nearbyResponse = await complaintService.getNearbyComplaints();
            const nearbyComplaints = nearbyResponse.data || [];

            dashboardContent = `
                <div class="welcome-section glass-card mb-4">
                    <div class="info-card" style="background: transparent; box-shadow: none; padding: 0;">
                        <h2>👋 Welcome, ${user.firstName}!</h2>
                        <p>You haven't submitted any complaints yet. Your voice matters - help us improve your community.</p>
                        <div class="user-location-info mt-2">
                            <p><strong>📍 Location:</strong> ${user.location?.city || 'Not set'}, ${user.location?.state || ''}</p>
                        </div>
                    </div>
                </div>

                <div class="section-header mt-4">
                    <h2>What's Happening Nearby</h2>
                    <p class="text-muted">Top issues reported in ${user.location?.city || 'your area'}</p>
                </div>

                ${nearbyComplaints.length > 0 ? `
                    <div class="stories-section">
                        <div class="stories-scroll-container">
                            ${nearbyComplaints.map(complaint => renderStoryItem(complaint)).join('')}
                        </div>
                    </div>

                    <div class="complaints-list">
                        ${nearbyComplaints.map(complaint => renderComplaintCard(complaint, true)).join('')}
                    </div>
                ` : `
                    <div class="empty-state glass-card text-center">
                        <p>No complaints reported in your area yet. Be the first!</p>
                        <button class="btn btn-primary mt-3" onclick="window.router.navigate('/submit-complaint')">
                            Submit First Complaint
                        </button>
                    </div>
                `}
            `;
        }

        app.innerHTML = `
            <div class="dashboard-page">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="header-content">
                            <h1>Dashboard</h1>
                            <p class="text-muted">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        ${myComplaints.length > 0 ? `
                            <button class="btn btn-primary" onclick="window.router.navigate('/submit-complaint')">
                                + New Complaint
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="dashboard-content">
                        ${dashboardContent}
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Dashboard Error:', error);
        app.innerHTML = `
            <div class="container">
                <div class="error-message">
                    Failed to load dashboard. Please try again later.
                </div>
            </div>
        `;
    }
}

function renderChart(stats) {
    const ctx = document.getElementById('complaintChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Resolved', 'Rejected'],
            datasets: [{
                data: [stats.pending, stats.resolved, stats.rejected],
                backgroundColor: [
                    '#f59e0b', // Pending - Orange
                    '#10b981', // Resolved - Green
                    '#ef4444'  // Rejected - Red
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function renderStoryItem(complaint) {
    const icon = getCategoryIcon(complaint.category);
    return `
        <div class="story-item">
            <div class="story-ring">
                <div class="story-avatar">
                    ${complaint.mediaUrl && (complaint.type === 'image')
            ? `<img src="${complaint.mediaUrl}" alt="Story">`
            : `<span>${icon}</span>`}
                </div>
            </div>
            <span class="story-title">${complaint.category}</span>
        </div>
    `;
}

function getCategoryIcon(category) {
    const icons = {
        'Roads': '🛣️',
        'Electricity': '⚡',
        'Water': '💧',
        'Sanitation': '🗑️',
        'Street Lights': '💡',
        'Parks': '🌳',
        'Other': '📝'
    };
    return icons[category] || '📝';
}

function renderComplaintCard(complaint, showUser = false) {
    const date = new Date(complaint.createdAt).toLocaleDateString();
    const statusClass = complaint.status.toLowerCase();

    return `
        <div class="complaint-card ${statusClass}">
            <div class="complaint-header">
                <span class="category-badge">${getCategoryIcon(complaint.category)} ${complaint.category}</span>
                <span class="status-badge ${statusClass}">${complaint.status}</span>
            </div>
            <h3 class="complaint-title">${complaint.title}</h3>
            <p class="complaint-desc">${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</p>
            
            ${complaint.mediaUrl ? `
                <div class="complaint-media-indicator">
                    <span>📎 Has attachment (${complaint.type})</span>
                </div>
            ` : ''}

            <div class="complaint-footer">
                <span class="complaint-date">📅 ${date}</span>
                ${showUser && complaint.user ? `
                    <span class="complaint-user">👤 ${complaint.user.firstName} ${complaint.user.lastName}</span>
                ` : ''}
                <span class="complaint-location">📍 ${complaint.location?.city || 'Unknown'}</span>
            </div>
        </div>
    `;
}
