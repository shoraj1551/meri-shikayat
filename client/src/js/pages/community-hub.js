/**
 * Community Hub Page
 * Find people, manage connections
 */

import { authService } from '../api/auth.service.js';
import { socialService } from '../api/social.service.js';
import { Loading } from '../components/loading.js';
import { escapeHtmlDeep, escapeJsString } from '../utils/html.js';

export async function renderCommunityPage() {
    const app = document.getElementById('app');
    const user = authService.getCurrentUser();

    if (!user) {
        window.router.navigate('/login');
        return;
    }

    const safeUser = escapeHtmlDeep(user);

    app.innerHTML = `
        <div class="dashboard-layout">
            <header class="dashboard-header glass-card">
                <div class="header-left">
                    <div class="logo">Meri Shikayat</div>
                </div>
                <div class="header-right">
                    <button class="btn btn-outline" onclick="window.router.navigate('/dashboard')">Back</button>
                    <div class="user-profile">
                        <div class="avatar">${safeUser.firstName[0]}</div>
                    </div>
                </div>
            </header>

            <main class="main-content container">
                <div class="community-header">
                    <h1 class="page-title">Community & Network</h1>
                    <div class="search-bar-premium">
                        <input type="text" id="userSearchInput" placeholder="Find citizens by name...">
                        <button id="searchBtn" class="btn btn-primary">Search</button>
                    </div>
                </div>

                <div class="community-grid">
                    <!-- Left: My Network -->
                    <div class="network-sidebar">
                        <div class="glass-card mb-4">
                            <h3>My Connections</h3>
                            <div id="myNetworkList" class="network-list">
                                ${Loading.skeleton(50, '100%')}
                            </div>
                        </div>
                    </div>

                    <!-- Right: Discovery -->
                    <div class="discovery-area">
                        <div class="glass-card">
                            <h3>Recommended for you</h3>
                            <div id="recommendedList" class="user-cards-grid">
                                ${Loading.skeleton(200, '100%')}
                            </div>
                        </div>

                        <div id="searchResultsSection" style="display:none; margin-top: 2rem;">
                            <div class="glass-card">
                                <h3>Search Results</h3>
                                <div id="searchResultsList" class="user-cards-grid"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Load Data
    loadNetwork();
    loadRecommendations();

    // Event Listeners
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('userSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

async function loadNetwork() {
    try {
        const response = await socialService.getMyNetwork();
        const connections = escapeHtmlDeep(response.data);
        const container = document.getElementById('myNetworkList');

        if (connections.length === 0) {
            container.innerHTML = Loading.empty('No connections yet', 'People you connect with will appear here.', { compact: true });
            return;
        }

        container.innerHTML = connections.map(c => {
            const friend = c.requester._id === authService.getCurrentUser()._id ? c.recipient : c.requester;
            return `
                <div class="network-item" onclick="window.router.navigate('/messages')">
                    <div class="avatar-sm">${friend.firstName[0]}</div>
                    <div class="network-info">
                        <strong>${friend.firstName} ${friend.lastName}</strong>
                        <span class="status-indicator online"></span>
                    </div>
                    <button class="btn-icon-sm">💬</button>
                </div>
            `;
        }).join('');
    } catch (e) {
        const container = document.getElementById('myNetworkList');
        container.innerHTML = Loading.error('Connections unavailable', 'We could not load your network.', { compact: true, actionLabel: 'Try again' });
        container.querySelector('[data-state-action="retry"]')?.addEventListener('click', loadNetwork);
    }
}

async function loadRecommendations() {
    try {
        const response = await socialService.getRecommendedUsers();
        const users = response.data;
        renderUserCards(users, 'recommendedList');
    } catch (e) {
        const container = document.getElementById('recommendedList');
        container.innerHTML = Loading.error('Recommendations unavailable', 'We could not load recommendations.', { compact: true, actionLabel: 'Try again' });
        container.querySelector('[data-state-action="retry"]')?.addEventListener('click', loadRecommendations);
    }
}

async function performSearch() {
    const query = document.getElementById('userSearchInput').value;
    if (!query) return;

    document.getElementById('searchResultsSection').style.display = 'block';
    const container = document.getElementById('searchResultsList');
    container.innerHTML = Loading.skeleton(100, '100%');

    try {
        const response = await socialService.searchUsers(query);
        renderUserCards(response.data, 'searchResultsList');
    } catch (e) {
        container.innerHTML = Loading.error('Search unavailable', 'We could not complete this search.', { compact: true, actionLabel: 'Try again' });
        container.querySelector('[data-state-action="retry"]')?.addEventListener('click', performSearch);
    }
}

function renderUserCards(users, containerId) {
    users = escapeHtmlDeep(users);
    const container = document.getElementById(containerId);
    if (users.length === 0) {
        container.innerHTML = Loading.empty('No users found', 'Try a different name or search term.', { compact: true });
        return;
    }

    container.innerHTML = users.map(u => `
        <div class="user-card-premium">
            <div class="uc-avatar">${u.firstName[0]}</div>
            <div class="uc-info">
                <h4>${u.firstName} ${u.lastName}</h4>
                <p>📍 ${u.location?.city || 'Citizen'}</p>
            </div>
            <div class="uc-actions">
                <button class="btn btn-sm btn-primary" onclick="sendRequest('${escapeJsString(u._id)}')">Connect</button>
            </div>
        </div>
    `).join('');
}

// Global Actions
window.sendRequest = async (id) => {
    try {
        await socialService.sendConnectionRequest(id, 'friend');
        window.appFeedback.notify('Friend request sent.', { type: 'success' });
    } catch (e) {
        window.appFeedback.notify(e.message || 'Unable to send the friend request.', { type: 'error' });
    }
};
