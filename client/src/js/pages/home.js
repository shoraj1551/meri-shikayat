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
                            <div class="language-selector">
                                <button class="lang-option active" data-lang="en">English</button>
                                <button class="lang-option" data-lang="hi">हिन्दी</button>
                            </div>
                            <a href="/login" class="btn btn-outline">Login</a>
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

            <!-- Enhanced Footer -->
            <!-- Enhanced Footer -->
            <footer class="enhanced-footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <div class="footer-logo">
                                <h2>मेरी शिकायत</h2>
                                <p>Empowering citizens to resolve local issues effectively.</p>
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

    // Language selector toggle
    const langOptions = app.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            langOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            // TODO: Implement actual language switching in future version
            console.log('Language switched to:', option.dataset.lang);
        });
    });

    // Scroll to "How It Works" section
    document.getElementById('howItWorksBtn')?.addEventListener('click', () => {
        document.getElementById('how-it-works').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}
