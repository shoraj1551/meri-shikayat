/**
 * Stories Feed Page
 * Where complaints become viral stories
 */

import { authService } from '../api/auth.service.js';
import { storiesService } from '../api/stories.service.js';
import { Loading } from '../components/loading.js';
import { escapeHtml, escapeHtmlDeep, escapeJsString, safeUrl } from '../utils/html.js';

export async function renderStoriesPage() {
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
                    <span class="badge" style="background: linear-gradient(to right, #f43f5e, #e11d48); color:white;">LIVE STORIES</span>
                </div>
                <div class="header-right">
                    <button class="btn btn-outline" onclick="window.router.navigate('/dashboard')">Back</button>
                    <div class="user-profile">
                        <div class="avatar">${safeUser.firstName[0]}</div>
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
            container.innerHTML = Loading.empty('No stories yet', 'Resolved complaint stories shared by the community will appear here.');
            return;
        }

        container.innerHTML = stories.map(s => renderStoryCard(s, currentUser)).join('');

        // Setup Logic
        setupStoryInteractions();

    } catch (e) {
        container.innerHTML = Loading.error('Stories unavailable', 'We could not load community stories. Please try again.', { actionLabel: 'Try again' });
        container.querySelector('[data-state-action="retry"]')?.addEventListener('click', loadStories);
    }
}

export function renderStoryCard(rawStory, currentUser) {
    const story = escapeHtmlDeep(rawStory);
    const isHyped = rawStory.hypes.includes(currentUser._id);
    const date = new Date(story.createdAt).toLocaleDateString();

    return `
        <div id="story-${story._id}" class="story-card glass-card fade-in-up" data-id="${story._id}">
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
                ${rawStory.media?.length ? `<div class="story-media-gallery">${rawStory.media.map(renderStoryMedia).join('')}</div>` : ''}
            </div>

            <div class="story-actions">
                <button class="action-btn hype-btn ${isHyped ? 'active' : ''}" onclick="toggleHype('${escapeJsString(rawStory._id)}', this)">
                    <span class="icon">🔥</span> <span class="count">${story.hypes.length}</span> Hype
                </button>
                <button class="action-btn comment-btn" onclick="toggleComments('${escapeJsString(rawStory._id)}')">
                    <span class="icon">💬</span> <span class="count">${story.comments.length}</span> Comment
                </button>
                <button class="action-btn share-btn" onclick="shareStory('${escapeJsString(rawStory._id)}', '${escapeJsString(rawStory.title)}', this)">
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
                    <input type="text" placeholder="Add a comment..." onkeypress="handleComment(event, '${escapeJsString(rawStory._id)}')">
                </div>
            </div>
        </div>
    `;
}

function renderStoryMedia(media) {
    const url = safeUrl(media?.url);
    if (!url) return '';
    const label = escapeHtml(media.originalName || media.filename || 'Story attachment');
    if (media.type === 'image') return `<img src="${url}" alt="${label}" loading="lazy">`;
    if (media.type === 'video') return `<video src="${url}" controls preload="metadata" aria-label="${label}"></video>`;
    if (media.type === 'audio') return `<audio src="${url}" controls preload="metadata" aria-label="${label}"></audio>`;
    return `<a class="story-media-document" href="${url}" target="_blank" rel="noopener noreferrer">Open ${label}</a>`;
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
            e.target.disabled = true;
            const response = await storiesService.addComment(id, text);
            const comment = response.data;
            const card = e.target.closest('.story-card');
            const item = document.createElement('div');
            item.className = 'comment-item';
            const author = document.createElement('strong');
            author.textContent = `${comment.user?.firstName || 'You'}:`;
            item.append(author, ` ${comment.text}`);
            card.querySelector('.comments-list').appendChild(item);
            const count = card.querySelector('.comment-btn .count');
            count.textContent = String(Number(count.textContent) + 1);
            e.target.value = '';
            window.appFeedback.notify('Comment added.', { type: 'success' });
        } catch (err) {
            window.appFeedback.notify('Failed to add the comment.', { type: 'error' });
        } finally {
            e.target.disabled = false;
            e.target.focus();
        }
    }
};

window.shareStory = async (id, title, button) => {
    const shareData = {
        title: `Support this cause: ${title}`,
        text: `I just hyped this issue on Meri Shikayat! Check it out.`,
        url: `${window.location.origin}/stories#story-${encodeURIComponent(id)}`
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            const response = await storiesService.trackShare(id);
            button.querySelector('.count').textContent = response.shares;
            window.appFeedback.notify('Shared successfully.', { type: 'success' });
        } else {
            // Fallback
            await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
            const response = await storiesService.trackShare(id);
            button.querySelector('.count').textContent = response.shares;
            window.appFeedback.notify('Link copied to clipboard.', { type: 'success' });
        }
    } catch (e) {
        console.log('Share canceled');
    }
};

function setupStoryInteractions() {
    // Additional generic setups if needed
}
