/**
 * Dashboard page component (placeholder)
 */

export function renderDashboardPage() {
    const app = document.getElementById('app');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    app.innerHTML = `
        <div class="dashboard-page">
            <div class="container">
                <div class="dashboard-header">
                    <h1>Welcome, ${user.firstName || 'User'}!</h1>
                    <p>Your dashboard is ready</p>
                </div>
                
                <div class="dashboard-content">
                    <div class="info-card">
                        <h2>🎉 Location Set Successfully!</h2>
                        <p>Your location has been saved. You can now access all features of Meri Shikayat.</p>
                        <div class="user-info">
                            <p><strong>Name:</strong> ${user.fullName || 'N/A'}</p>
                            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                            <p><strong>Location:</strong> ${user.location?.city || 'N/A'}, ${user.location?.state || 'N/A'}</p>
                        </div>
                        <p style="margin-top: 2rem; color: var(--text-secondary);">
                            Dashboard features coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
