/**
 * Stories Feed Page
 * Where complaints become viral stories
 */

import { authService } from '../api/auth.service.js';
import { storiesService } from '../api/stories.service.js';
import Loading from '../components/loading.js';

export async function renderStoriesPage() {
    const app = document.getElementById('app');
    const user = authService.getCurrentUser();

    if (!user) {
        window.router.navigate('/login');
        return;
    }

    app.innerHTML = `
        <div class="dashboard-layout">
            <header class="dashboard-header glass-card">
                <div class="header-left">
                    <div class="logo">Meri Shikayat</div>
                    <span class="badge" style="background: linear-gradient(to right, #f43f5e, #e11d48); color:white;">LIVE STORIES</span>
                </div>
                <div class="header-right">
                    <button class="btn btn-outline" onclick="window.router.navigate('/dashboard')">Back</button>
                    <div class="user-profile">
                        <div class="avatar">${user.firstName[0]}</div>
                    </div>
                </div>
            </header>

            <main class="main-content container" style="max-width: 700px;">
                <h1 class="page-title text-center mb-4">Trending Stories 🔥</h1>
                <div id="storiesFeed" class="stories-feed-container">
                    ${Loading.skeleton(300, '100%')}
                </div>
            </main>
        </div>
    `;

    loadStories();
}

async function loadStories() {
    const container = document.getElementById('storiesFeed');
    try {
        const response = await storiesService.getFeed();
        const stories = response.data;
        const currentUser = authService.getCurrentUser();

        if (stories.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No stories yet. Be the first to share!</p>';
            return;
        }

        container.innerHTML = stories.map(s => renderStoryCard(s, currentUser)).join('');

        // Setup Logic
        setupStoryInteractions();

    } catch (e) {
        container.innerHTML = `<p class="error-text">Failed to load stories: ${e.message}</p>`;
    }
}

function renderStoryCard(story, currentUser) {
    const isHyped = story.hypes.includes(currentUser._id);
    const date = new Date(story.createdAt).toLocaleDateString();

    return `
        <div class="story-card glass-card fade-in-up" data-id="${story._id}">
            <div class="story-header">
                <div class="story-author">
                    <div class="avatar-sm">${story.user.firstName[0]}</div>
                    <div>
                        <span class="story-username">${story.user.firstName} ${story.user.lastName}</span>
                        <span class="story-meta">in ${story.category.name} • ${date}</span>
                    </div>
                </div>
                <!-- Status Badge -->
                <span class="status-badge status-${story.status}">${story.status}</span>
            </div>

            <div class="story-content">
                <h3 class="story-title">${story.title}</h3>
                <p class="story-desc">${story.description}</p>
                ${story.media && story.media.length ? `<div class="story-media-placeholder">📷 Media Attachment</div>` : ''}
            </div>

            <div class="story-actions">
                <button class="action-btn hype-btn ${isHyped ? 'active' : ''}" onclick="toggleHype('${story._id}', this)">
                    <span class="icon">🔥</span> <span class="count">${story.hypes.length}</span> Hype
                </button>
                <button class="action-btn comment-btn" onclick="toggleComments('${story._id}')">
                    <span class="icon">💬</span> <span class="count">${story.comments.length}</span> Comment
                </button>
                <button class="action-btn share-btn" onclick="shareStory('${story._id}', '${story.title}')">
                    <span class="icon">📤</span> <span class="count">${story.shares}</span> Share
                </button>
            </div>

            <div id="comments-${story._id}" class="story-comments-section" style="display:none;">
                <div class="comments-list">
                    ${story.comments.map(c => `
                        <div class="comment-item">
                            <strong>${c.user.firstName}:</strong> ${c.text}
                        </div>
                    `).join('')}
                </div>
                <div class="add-comment-box">
                    <input type="text" placeholder="Add a comment..." onkeypress="handleComment(event, '${story._id}')">
                </div>
            </div>
        </div>
    `;
}

// Global Interaction Handlers
window.toggleHype = async (id, btn) => {
    try {
        const response = await storiesService.toggleHype(id);
        const countSpan = btn.querySelector('.count');
        countSpan.innerText = response.hypes;
        if (response.isHyped) btn.classList.add('active');
        else btn.classList.remove('active');

        // Animation effect
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 300);
    } catch (e) { console.error(e); }
};

window.toggleComments = (id) => {
    const el = document.getElementById(`comments-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.handleComment = async (e, id) => {
    if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (!text) return;

        try {
            await storiesService.addComment(id, text);
            // Refresh logic (Simple reload for MVP, ideal is append)
            // For now just clear input and alert success to keep it simple without re-rendering everything
            e.target.value = '';
            alert('Comment added! (Reload to see)');
        } catch (err) {
            alert('Failed to comment');
        }
    }
};

window.shareStory = async (id, title) => {
    const shareData = {
        title: `Support this cause: ${title}`,
        text: `I just hyped this issue on Meri Shikayat! Check it out.`,
        url: window.location.href // In real app, deep link to story
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            await storiesService.trackShare(id);
            alert('Shared successfully!');
        } else {
            // Fallback
            await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
            alert('Link copied to clipboard!');
        }
    } catch (e) {
        console.log('Share canceled');
    }
};

function setupStoryInteractions() {
    // Additional generic setups if needed
}
