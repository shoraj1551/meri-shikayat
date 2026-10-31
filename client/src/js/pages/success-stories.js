import { storiesService } from '../api/stories.service.js';
import { escapeHtmlDeep } from '../utils/html.js';

const number = value => new Intl.NumberFormat('en-IN').format(Number(value) || 0);

export async function renderSuccessStoriesPage() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="success-stories-page"><main class="container"><p>Loading verified impact data...</p></main></div>';

    try {
        const impact = (await storiesService.getImpact()).data;
        let stories = [];
        if (localStorage.getItem('token')) {
            stories = (await storiesService.getFeed()).data || [];
        }
        const safeStories = escapeHtmlDeep(stories);

        app.innerHTML = `
            <div class="success-stories-page">
                <header class="success-header"><div class="container"><nav class="success-navbar">
                    <div class="logo"><h1>Meri Shikayat</h1></div>
                    <div class="nav-links"><a href="/">Home</a><a href="/dashboard">Dashboard</a></div>
                </nav></div></header>
                <section class="success-hero"><div class="container"><div class="hero-content">
                    <h1 class="hero-title">Verified Platform Impact</h1>
                    <p class="hero-subtitle">These figures are calculated from persisted complaints.</p>
                    <div class="impact-stats">
                        <div class="stat-box"><div class="stat-number">${number(impact.complaintsFiled)}</div><div class="stat-label">Complaints Filed</div></div>
                        <div class="stat-box"><div class="stat-number">${number(impact.issuesResolved)}</div><div class="stat-label">Issues Resolved</div></div>
                        <div class="stat-box"><div class="stat-number">${impact.resolutionRate}%</div><div class="stat-label">Resolution Rate</div></div>
                        <div class="stat-box"><div class="stat-number">${impact.averageResolutionDays}</div><div class="stat-label">Average Days</div></div>
                    </div>
                </div></div></section>
                <section class="featured-stories"><div class="container">
                    <h2 class="section-title">Resolved Community Stories</h2>
                    ${safeStories.length ? `<div class="stories-grid">${safeStories.map(story => `
                        <article class="story-card">
                            <div class="story-header"><span class="category-badge">${story.category?.name || 'Other'}</span><span class="resolution-time">Resolved</span></div>
                            <h3>${story.title}</h3><p>${story.description}</p>
                            <div class="story-author"><strong>${story.user?.firstName || 'Citizen'} ${story.user?.lastName || ''}</strong></div>
                            <div class="story-stats"><span>${new Date(story.updatedAt).toLocaleDateString()}</span><span>${story.hypes?.length || 0} community hypes</span></div>
                        </article>`).join('')}</div>` : `<div class="empty-state"><p>${localStorage.getItem('token')
                            ? 'No resolved stories have been published yet.'
                            : 'Sign in to view published resolved stories.'}</p></div>`}
                </div></section>
            </div>`;
    } catch (error) {
        app.innerHTML = '<div class="success-stories-page"><main class="container"><div class="error-state"><h1>Impact data unavailable</h1><p>Persisted impact information could not be loaded.</p></div></main></div>';
    }
}
