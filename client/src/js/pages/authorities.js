/**
 * Authorities Directory - Main Page - API Integrated
 * Shows all connected government departments with real data
 */

import { fetchAllDepartments } from '../services/authorities.service.js';

export async function renderAuthoritiesPage() {
    const app = document.getElementById('app');

    // Show loading state
    app.innerHTML = `
        <div class="legal-page authorities-page">
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading departments...</p>
            </div>
        </div>
    `;

    try {
        // Fetch real data from API
        const allAuthorities = await fetchAllDepartments();
        const primaryAuthorities = allAuthorities.filter(auth => auth.category === 'Primary');
        const additionalAuthorities = allAuthorities.filter(auth => auth.category === 'Additional');

        // Calculate stats
        const stats = {
            totalDepartments: allAuthorities.length,
            totalComplaints: 0,
            totalResolved: 0,
            avgResolutionRate: 0
        };

        app.innerHTML = `
            <div class="legal-page authorities-page">
                <header class="legal-header">
                    <div class="container">
                        <a href="/" class="back-link">← Back to Home</a>
                        <h1 class="page-title">Connected Authorities</h1>
                        <p class="page-subtitle">Government departments working with Meri Shikayat</p>
                    </div>
                </header>
                
                <main class="legal-content">
                    <div class="container">
                        <!-- Stats Overview -->
                        <section class="legal-section intro-section">
                            <div class="authorities-stats-grid">
                                <div class="auth-stat-card">
                                    <div class="stat-icon">🏛️</div>
                                    <div class="stat-number">${stats.totalDepartments}</div>
                                    <div class="stat-label">Connected Departments</div>
                                </div>
                                <div class="auth-stat-card">
                                    <div class="stat-icon">📝</div>
                                    <div class="stat-number">Real-Time</div>
                                    <div class="stat-label">Live Statistics</div>
                                </div>
                                <div class="auth-stat-card">
                                    <div class="stat-icon">✅</div>
                                    <div class="stat-number">Active</div>
                                    <div class="stat-label">All Departments Active</div>
                                </div>
                                <div class="auth-stat-card">
                                    <div class="stat-icon">⭐</div>
                                    <div class="stat-number">24/7</div>
                                    <div class="stat-label">Support Available</div>
                                </div>
                            </div>
                        </section>

                        <!-- Primary Authorities -->
                        <section class="legal-section">
                            <div class="section-header">
                                <h2>Primary Departments</h2>
                            </div>
                            
                            <div class="authorities-grid">
                                ${primaryAuthorities.map(auth => `
                                    <a href="/authorities/${auth.code}" class="authority-card" data-id="${auth.code}">
                                        <div class="authority-icon" style="background: ${auth.color}">
                                            ${auth.icon}
                                        </div>
                                        <h3>${auth.name}</h3>
                                        <p class="hindi-name">${auth.nameHindi}</p>
                                        <div class="view-details">View Details →</div>
                                    </a>
                                `).join('')}
                            </div>
                        </section>

                        <!-- Additional Authorities -->
                        ${additionalAuthorities.length > 0 ? `
                            <section class="legal-section">
                                <div class="section-header">
                                    <h2>Additional Departments</h2>
                                </div>
                                
                                <div class="authorities-grid">
                                    ${additionalAuthorities.map(auth => `
                                        <a href="/authorities/${auth.code}" class="authority-card" data-id="${auth.code}">
                                            <div class="authority-icon" style="background: ${auth.color}">
                                                ${auth.icon}
                                            </div>
                                            <h3>${auth.name}</h3>
                                            <p class="hindi-name">${auth.nameHindi}</p>
                                            <div class="view-details">View Details →</div>
                                        </a>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                        <!-- CTA Section -->
                        <section class="support-cta">
                            <h2>Need to File a Complaint?</h2>
                            <p>Our connected departments are ready to help resolve your issues</p>
                            <div class="support-buttons">
                                <a href="/file-complaint" class="btn btn-primary">File Complaint</a>
                                <a href="/how-it-works" class="btn btn-outline-primary">How It Works</a>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        `;

        // Add event listener for back link
        app.querySelector('.back-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });

        // Add click handlers for authority cards
        const authorityCards = app.querySelectorAll('.authority-card');
        authorityCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const id = card.dataset.id;
                window.history.pushState({}, '', `/authorities/${id}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        });
    } catch (error) {
        console.error('Error loading authorities:', error);
        app.innerHTML = `
            <div class="legal-page">
                <div class="container">
                    <h1>Error Loading Departments</h1>
                    <p>Sorry, we couldn't load the departments. Please try again later.</p>
                    <a href="/" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;
    }
}
