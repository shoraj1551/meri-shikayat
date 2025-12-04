/**
 * Home page component - High-conversion landing page
 */

export function renderHomePage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="home-page">
            <!-- Enhanced Header -->
            <header class="home-header">
                <div class="container">
                    <nav class="home-navbar">
                        <div class="logo">
                            <h1>मेरी शिकायत</h1>
                            <p class="tagline">Your Voice, Our Priority</p>
                        </div>
                        <div class="nav-actions">
                            <div class="language-toggle">
                                <button class="lang-btn active" data-lang="en">English</button>
                                <span class="lang-divider">|</span>
                                <button class="lang-btn" data-lang="hi">हिन्दी</button>
                            </div>
                            <a href="/login" class="btn btn-outline-light">Login</a>
                            <a href="/register" class="btn btn-primary">Register</a>
                        </div>
                    </nav>
                </div>
            </header>

            <!-- Enhanced Hero Section -->
            <section class="enhanced-hero">
                <div class="container">
                    <div class="hero-content-wrapper">
                        <h2 class="hero-main-title">Get Local Community Issues Resolved. Fast.</h2>
                        <p class="hero-description">
                            Submit complaints on sanitation, road issues, safety, and more. 
                            We connect your voice directly to the resolving authorities.
                        </p>
                        <div class="hero-cta-group">
                            <a href="/file-complaint" class="btn btn-primary btn-lg">File Your First Complaint</a>
                            <button id="howItWorksBtn" class="btn btn-primary btn-lg">How It Works</button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Trust & Social Proof Section -->
            <section class="trust-section">
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-number">5,480+</div>
                            <div class="stat-label">Complaints Filed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-number">4,100+</div>
                            <div class="stat-label">Issues Resolved</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-number">3.5</div>
                            <div class="stat-label">Days Avg. Resolution Time</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="how-it-works-section" id="how-it-works">
                <div class="container">
                    <h2 class="section-title">Simple Steps to Resolution</h2>
                    <div class="steps-container">
                        <div class="step-card">
                            <div class="step-number">1</div>
                            <div class="step-icon">📋</div>
                            <h3 class="step-title">Lodge Complaint</h3>
                            <p class="step-description">
                                Submit via Text, Audio, or Video. Choose the method that works best for you.
                            </p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">2</div>
                            <div class="step-icon">⚙️</div>
                            <h3 class="step-title">Review & Assign</h3>
                            <p class="step-description">
                                The issue is verified and routed to the relevant Admin for action.
                            </p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">3</div>
                            <div class="step-icon">🎯</div>
                            <h3 class="step-title">Track & Resolve</h3>
                            <p class="step-description">
                                Follow real-time status updates until the problem is solved.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Feature Showcase Section -->
            <section class="features-section">
                <div class="container">
                    <h2 class="section-title">Multiple Ways to Submit</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">📝</div>
                            <h3>Text Complaints</h3>
                            <p>Write detailed descriptions of your issues</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎤</div>
                            <h3>Audio Recording</h3>
                            <p>Record your voice to explain the problem</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📹</div>
                            <h3>Video Upload</h3>
                            <p>Upload video evidence of your complaint</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📷</div>
                            <h3>Image Attachments</h3>
                            <p>Attach photos to support your case</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Working with Local Authorities Section -->
            <section class="authorities-section">
                <div class="container">
                    <h2 class="section-title">Working with Your Local Authorities</h2>
                    <p class="section-subtitle">Meri Shikayat partners with official government bodies to ensure your issues are addressed effectively.</p>
                    <div class="authorities-logos">
                        <div class="authority-logo">
                            <div class="logo-placeholder">🏛️</div>
                            <span>Municipal Corporation</span>
                        </div>
                        <div class="authority-logo">
                            <div class="logo-placeholder">🏗️</div>
                            <span>Public Works Dept</span>
                        </div>
                        <div class="authority-logo">
                            <div class="logo-placeholder">👮</div>
                            <span>Local Police</span>
                        </div>
                        <div class="authority-logo">
                            <div class="logo-placeholder">💧</div>
                            <span>Water Board</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Recent Community Impact Section -->
            <section class="impact-section">
                <div class="container">
                    <h2 class="section-title">Recent Community Impact</h2>
                    <div class="impact-feed-container">
                        <div class="impact-feed" id="impactFeed">
                            <!-- Dynamic content will be populated/scrolled here -->
                            <div class="impact-card resolved">
                                <div class="impact-header">
                                    <span class="status-badge resolved">Resolved</span>
                                    <span class="timestamp">1 hour ago</span>
                                </div>
                                <p class="impact-text">Pothole repaired on MG Road (Sector 12).</p>
                            </div>
                            <div class="impact-card in-progress">
                                <div class="impact-header">
                                    <span class="status-badge in-progress">In Progress</span>
                                    <span class="timestamp">3 hours ago</span>
                                </div>
                                <p class="impact-text">Streetlight issue reported near City Park.</p>
                            </div>
                            <div class="impact-card resolved">
                                <div class="impact-header">
                                    <span class="status-badge resolved">Resolved</span>
                                    <span class="timestamp">Yesterday</span>
                                </div>
                                <p class="impact-text">Waste collection improved in Ward 5.</p>
                            </div>
                            <div class="impact-card new">
                                <div class="impact-header">
                                    <span class="status-badge new">New Complaint</span>
                                    <span class="timestamp">Yesterday</span>
                                </div>
                                <p class="impact-text">Water leakage reported on Main Street.</p>
                            </div>
                            <div class="impact-card resolved">
                                <div class="impact-header">
                                    <span class="status-badge resolved">Resolved</span>
                                    <span class="timestamp">2 days ago</span>
                                </div>
                                <p class="impact-text">Public sanitation improved in Market Area.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- User Feedback Section -->
            <section class="feedback-section">
                <div class="container">
                    <h2 class="section-title">Citizen Voices</h2>
                    <div class="feedback-carousel">
                        <div class="feedback-card active">
                            <p class="feedback-text">"Finally a way to get potholes fixed! The response was quicker than I expected."</p>
                            <div class="feedback-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <h4>Rahul Sharma</h4>
                                    <span>Resident, Sector 4</span>
                                </div>
                            </div>
                        </div>
                        <div class="feedback-card">
                            <p class="feedback-text">"The video upload feature makes it so easy to show the exact problem. Great initiative!"</p>
                            <div class="feedback-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <h4>Priya Singh</h4>
                                    <span>Resident, Ward 12</span>
                                </div>
                            </div>
                        </div>
                        <div class="feedback-card">
                            <p class="feedback-text">"I can see my complaint status in real-time. Very transparent process."</p>
                            <div class="feedback-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <h4>Amit Patel</h4>
                                    <span>Shop Owner, Main Market</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Scope of Service Section -->
            <section class="scope-section">
                <div class="container">
                    <h2 class="section-title">What Meri Shikayat Can Help With</h2>
                    <div class="scope-grid">
                        <div class="scope-column yes-scope">
                            <div class="scope-header">
                                <span class="scope-icon">✅</span>
                                <h3>What We Address</h3>
                            </div>
                            <ul class="scope-list">
                                <li>Roads & Infrastructure (Potholes, broken footpaths)</li>
                                <li>Sanitation & Waste Management (Garbage, drainage)</li>
                                <li>Public Utilities (Streetlights, water leaks)</li>
                                <li>Public Safety (Non-emergency concerns)</li>
                                <li>Parks & Public Spaces Maintenance</li>
                            </ul>
                        </div>
                        <div class="scope-column no-scope">
                            <div class="scope-header">
                                <span class="scope-icon">❌</span>
                                <h3>What We Don't Address</h3>
                            </div>
                            <ul class="scope-list">
                                <li>Private Disputes</li>
                                <li>Financial Complaints</li>
                                <li class="emergency-item">Medical Emergencies (Call 102/108)</li>
                                <li class="emergency-item">Police Emergencies (Call 100)</li>
                                <li>Legal Matters & Court Cases</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Enhanced Footer (Dark Theme & Parallel Layout) -->
            <footer class="enhanced-footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <div class="footer-logo">
                                <h2>मेरी शिकायत</h2>
                                <p>Empowering citizens to resolve local issues effectively. Your voice matters.</p>
                            </div>
                        </div>
                        <div class="footer-col">
                            <h3>Platform</h3>
                            <ul class="footer-links-list">
                                <li><a href="/how-it-works">How It Works</a></li>
                                <li><a href="/features">Features</a></li>
                                <li><a href="/success-stories">Success Stories</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3>Support</h3>
                            <ul class="footer-links-list">
                                <li><a href="/help">Help Center</a></li>
                                <li><a href="/faq">FAQ</a></li>
                                <li><a href="/contact">Contact Us</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3>Legal</h3>
                            <ul class="footer-links-list">
                                <li><a href="/privacy">Privacy Policy</a></li>
                                <li><a href="/terms">Terms of Service</a></li>
                                <li><a href="/guidelines">Community Guidelines</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2025 Meri Shikayat. All rights reserved.</p>
                        <div class="social-section">
                            <p class="social-tagline">Follow Us</p>
                            <div class="social-links">
                                <a href="https://facebook.com/placeholder" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="https://instagram.com/placeholder" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a href="https://youtube.com/placeholder" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                    <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </a>
                                <a href="https://linkedin.com/company/placeholder" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;

    // Add event listeners for navigation
    app.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href');
            window.router.navigate(path);
        });
    });

    // Language selector toggle logic
    const langBtns = app.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // TODO: Implement actual language switching
            console.log('Language switched to:', btn.dataset.lang);
        });
    });

    // Feedback Carousel Logic
    const feedbackCards = app.querySelectorAll('.feedback-card');
    if (feedbackCards.length > 0) {
        let currentFeedback = 0;
        setInterval(() => {
            feedbackCards[currentFeedback].classList.remove('active');
            currentFeedback = (currentFeedback + 1) % feedbackCards.length;
            feedbackCards[currentFeedback].classList.add('active');
        }, 5000); // Switch every 5 seconds
    }

    // Scroll to "How It Works" section
    document.getElementById('howItWorksBtn')?.addEventListener('click', () => {
        document.getElementById('how-it-works').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}
