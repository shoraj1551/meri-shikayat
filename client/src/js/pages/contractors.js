/**
 * Contractors Page - API Integrated
 * Shows all verified contractors working with Meri Shikayat
 */

import { fetchAllContractors } from '../services/contractors.service.js';

export async function renderContractorsPage() {
    const app = document.getElementById('app');

    // Show loading state
    app.innerHTML = `
        <div class="legal-page contractors-page">
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading contractors...</p>
            </div>
        </div>
    `;

    try {
        // Fetch real data from API
        const contractors = await fetchAllContractors();

        app.innerHTML = `
            <div class="legal-page contractors-page">
                <header class="legal-header">
                    <div class="container">
                        <a href="/" class="back-link">← Back to Home</a>
                        <h1 class="page-title">Our Partner Contractors</h1>
                        <p class="page-subtitle">Verified professionals working with Meri Shikayat</p>
                    </div>
                </header>
                
                <main class="legal-content">
                    <div class="container">
                        <!-- Stats Overview -->
                        <section class="legal-section intro-section">
                            <div class="info-box">
                                <div class="info-icon">🏗️</div>
                                <div class="info-content">
                                    <h3>Trusted Partners</h3>
                                    <p>We work with ${contractors.length} verified contractors across Delhi NCR to ensure quick and quality resolution of complaints.</p>
                                </div>
                            </div>
                        </section>

                        <!-- Contractors Grid -->
                        <section class="legal-section">
                            <div class="section-header">
                                <h2>All Contractors (${contractors.length})</h2>
                            </div>
                            
                            <div class="contractors-grid">
                                ${contractors.map(contractor => `
                                    <div class="contractor-card">
                                        <div class="contractor-header">
                                            <div class="contractor-icon">🏢</div>
                                            ${contractor.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                                        </div>
                                        
                                        <h3>${contractor.companyName}</h3>
                                        ${contractor.companyNameHindi ? `<p class="hindi-name">${contractor.companyNameHindi}</p>` : ''}
                                        
                                        <div class="contractor-specialization">
                                            ${contractor.specialization.map(spec => `
                                                <span class="spec-badge">${formatSpecialization(spec)}</span>
                                            `).join('')}
                                        </div>
                                        
                                        <div class="contractor-stats">
                                            <div class="contractor-stat">
                                                <span class="stat-icon">⭐</span>
                                                <span class="stat-value">${contractor.avgRating.toFixed(1)}</span>
                                            </div>
                                            <div class="contractor-stat">
                                                <span class="stat-icon">✅</span>
                                                <span class="stat-value">${contractor.totalJobsCompleted}</span>
                                                <span class="stat-label">Jobs</span>
                                            </div>
                                        </div>
                                        
                                        <div class="contractor-service-areas">
                                            <strong>Service Areas:</strong>
                                            <p>${contractor.serviceAreas.join(', ')}</p>
                                        </div>
                                        
                                        <div class="contractor-contact">
                                            <a href="tel:${contractor.phone}" class="contact-link">
                                                📞 ${contractor.phone}
                                            </a>
                                            <a href="mailto:${contractor.email}" class="contact-link">
                                                📧 ${contractor.email}
                                            </a>
                                        </div>
                                        
                                        <div class="contractor-footer">
                                            <p class="contractor-contact-person">
                                                <strong>Contact:</strong> ${contractor.primaryContact}
                                            </p>
                                            ${contractor.establishedYear ? `
                                                <p class="contractor-established">
                                                    Est. ${contractor.establishedYear}
                                                </p>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <!-- CTA Section -->
                        <section class="support-cta">
                            <h2>Want to Become a Partner?</h2>
                            <p>Join our network of verified contractors and help resolve civic issues</p>
                            <div class="support-buttons">
                                <a href="/contact" class="btn btn-primary">Contact Us</a>
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
    } catch (error) {
        console.error('Error loading contractors:', error);
        app.innerHTML = `
            <div class="legal-page">
                <div class="container">
                    <h1>Error Loading Contractors</h1>
                    <p>Sorry, we couldn't load the contractors. Please try again later.</p>
                    <a href="/" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;
    }
}

// Helper function to format specialization
function formatSpecialization(spec) {
    const map = {
        'sanitation': 'Sanitation',
        'road_repair': 'Road Repair',
        'electrical': 'Electrical',
        'plumbing': 'Plumbing',
        'construction': 'Construction',
        'maintenance': 'Maintenance',
        'other': 'Other'
    };
    return map[spec] || spec;
}
