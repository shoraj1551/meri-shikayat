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
                            <button id="howItWorksBtn" class="btn btn-outline btn-lg">How It Works</button>
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
                        <div class="social-links">
                            <a href="#" aria-label="Twitter">🐦</a>
                            <a href="#" aria-label="Facebook">📘</a>
                            <a href="#" aria-label="Instagram">📷</a>
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
