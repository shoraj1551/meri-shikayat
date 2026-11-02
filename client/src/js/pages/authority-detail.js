/**
 * Individual Authority Detail Page - API Integrated
 * Shows detailed information about a specific department with real-time data
 */

import { fetchDepartmentByCode } from '../services/authorities.service.js';
import { Loading } from '../components/loading.js';

export async function renderAuthorityDetailPage(params) {
    const app = document.getElementById('app');
    const authorityId = params.id;

    // Show loading state
    app.innerHTML = `<main class="legal-page authority-detail-page">${Loading.state('loading', { message: 'Loading department information', count: 3 })}</main>`;

    try {
        // Fetch real data from API
        const authority = await fetchDepartmentByCode(authorityId);

        if (!authority) {
            app.innerHTML = `<main class="legal-page container">${Loading.empty('Department not found', 'The requested department is unavailable or may have been removed.')}</main>`;
            return;
        }

        // Render page with real data
        app.innerHTML = `
            <div class="legal-page authority-detail-page">
                <header class="legal-header" style="background: linear-gradient(135deg, ${authority.color} 0%, ${adjustColor(authority.color, -20)} 100%)">
                    <div class="container">
                        <a href="/authorities" class="back-link">← Back to Authorities</a>
                        <div class="authority-header-content">
                            <div class="authority-icon-large">${authority.icon}</div>
                            <div>
                                <h1 class="page-title">${authority.name}</h1>
                                <p class="page-subtitle" lang="hi">${authority.nameHindi}</p>
                            </div>
                        </div>
                    </div>
                </header>
                
                <main class="legal-content">
                    <div class="container">
                        ${authority.statistics ? renderStatistics(authority.statistics) : ''}
                        ${authority.offices && authority.offices.length > 0 ? renderOffices(authority.offices) : ''}
                        ${authority.personnel && authority.personnel.length > 0 ? renderPersonnel(authority.personnel) : ''}
                        ${renderCTA(authority)}
                    </div>
                </main>
            </div>
        `;

        // Add event listener for back link
        app.querySelector('.back-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/authorities');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    } catch (error) {
        console.error('Error loading authority details:', error);
        app.innerHTML = `<main class="legal-page container">${Loading.error('Department unavailable', 'We could not load this department. Please try again.', { actionLabel: 'Try again' })}</main>`;
        app.querySelector('[data-state-action="retry"]')?.addEventListener('click', () => renderAuthorityDetailPage(params));
    }
}

// Render statistics dashboard
function renderStatistics(stats) {
    return `
        <section class="legal-section">
            <div class="section-header">
                <h2>Performance Statistics</h2>
            </div>
            
            <div class="dept-stats-grid">
                <div class="dept-stat-card received">
                    <div class="dept-stat-icon">📥</div>
                    <div class="dept-stat-number">${stats.received.toLocaleString()}</div>
                    <div class="dept-stat-label">Received</div>
                </div>
                <div class="dept-stat-card in-progress">
                    <div class="dept-stat-icon">⏳</div>
                    <div class="dept-stat-number">${stats.inProgress.toLocaleString()}</div>
                    <div class="dept-stat-label">In Progress</div>
                </div>
                <div class="dept-stat-card resolved">
                    <div class="dept-stat-icon">✅</div>
                    <div class="dept-stat-number">${stats.resolved.toLocaleString()}</div>
                    <div class="dept-stat-label">Resolved</div>
                </div>
                <div class="dept-stat-card response-time">
                    <div class="dept-stat-icon">⏱️</div>
                    <div class="dept-stat-number">${stats.avgResponseTime}</div>
                    <div class="dept-stat-label">Avg Response Time</div>
                </div>
                <div class="dept-stat-card resolution-time">
                    <div class="dept-stat-icon">🕐</div>
                    <div class="dept-stat-number">${stats.avgResolutionTime}</div>
                    <div class="dept-stat-label">Avg Resolution Time</div>
                </div>
                <div class="dept-stat-card rating">
                    <div class="dept-stat-icon">⭐</div>
                    <div class="dept-stat-number">${stats.avgRating}</div>
                    <div class="dept-stat-label">Average Rating</div>
                </div>
            </div>
        </section>
    `;
}

// Render offices list
function renderOffices(offices) {
    return `
        <section class="legal-section">
            <div class="section-header">
                <span class="section-number">1</span>
                <h2>Offices & Contact Information</h2>
            </div>
            
            <div class="offices-grid">
                ${offices.map(office => `
                    <div class="office-card">
                        <h4>${office.name}</h4>
                        ${office.nameHindi ? `<p class="hindi-name" lang="hi">${office.nameHindi}</p>` : ''}
                        
                        <div class="office-details">
                            <div class="office-detail-item">
                                <span class="detail-icon">📍</span>
                                <div>
                                    <strong>Address</strong>
                                    <p>${office.address}</p>
                                    ${office.city ? `<p>${office.city}, ${office.state} - ${office.pincode}</p>` : ''}
                                </div>
                            </div>
                            
                            ${office.phones && office.phones.length > 0 ? `
                                <div class="office-detail-item">
                                    <span class="detail-icon">📞</span>
                                    <div>
                                        <strong>Phone Numbers</strong>
                                        ${office.phones.map(phone => `
                                            <p><a href="tel:${phone}">${phone}</a></p>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${office.emails && office.emails.length > 0 ? `
                                <div class="office-detail-item">
                                    <span class="detail-icon">📧</span>
                                    <div>
                                        <strong>Email Addresses</strong>
                                        ${office.emails.map(email => `
                                            <p><a href="mailto:${email}">${email}</a></p>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="office-detail-item">
                                <span class="detail-icon">🕐</span>
                                <div>
                                    <strong>Office Hours</strong>
                                    <p>${office.officeHours}</p>
                                    ${office.is24x7 ? '<span class="badge-24x7">24/7 Available</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// Render personnel directory
function renderPersonnel(personnel) {
    return `
        <section class="legal-section">
            <div class="section-header">
                <span class="section-number">2</span>
                <h2>Key Personnel</h2>
            </div>
            
            <div class="personnel-grid">
                ${personnel.map(person => `
                    <div class="personnel-card">
                        <div class="personnel-avatar">👤</div>
                        <h4>${person.designation}</h4>
                        ${person.designationHindi ? `<p class="designation-hindi" lang="hi">${person.designationHindi}</p>` : ''}
                        <p class="personnel-name">${person.name}</p>
                        <div class="personnel-contact">
                            ${person.email ? `
                                <a href="mailto:${person.email}" class="personnel-email">
                                    📧 ${person.email}
                                </a>
                            ` : ''}
                            ${person.phone ? `
                                <a href="tel:${person.phone}" class="personnel-phone">
                                    📞 ${person.phone}
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// Render CTA section
function renderCTA(authority) {
    return `
        <section class="support-cta" style="background: linear-gradient(135deg, ${authority.color}15 0%, ${authority.color}05 100%)">
            <h2>Need to File a Complaint?</h2>
            <p>Report issues related to ${authority.name}</p>
            <div class="support-buttons">
                <a href="/submit-complaint?dept=${authority.code}" class="btn btn-primary" style="background: ${authority.color}">
                    File Complaint with ${authority.name}
                </a>
                <a href="/authorities" class="btn btn-outline-primary">View All Departments</a>
            </div>
        </section>
    `;
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    const clamp = (num) => Math.min(Math.max(num, 0), 255);
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
