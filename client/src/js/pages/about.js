/**
 * About Us Page - Professional Design
 * [U] UI/UX Engineer Implementation
 */

export function renderAboutPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page about-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">About Meri Shikayat</h1>
                    <p class="page-subtitle">Empowering citizens, strengthening communities</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Mission Section -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">🎯</div>
                            <div class="info-content">
                                <h3>Our Mission</h3>
                                <p>To bridge the gap between citizens and government authorities by providing a transparent, efficient, and accountable platform for civic grievance resolution.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Who We Are -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">1</span>
                            <h2>Who We Are</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>Meri Shikayat is India's leading <strong>citizen engagement platform</strong> that connects people directly with local government authorities to report and resolve civic issues.</p>
                            
                            <p>Founded with the vision of making governance more accessible and responsive, we leverage technology to ensure that every citizen's voice is heard and every complaint receives the attention it deserves.</p>
                            
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-number">50,000+</div>
                                    <div class="stat-label">Active Users</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">1,00,000+</div>
                                    <div class="stat-label">Complaints Resolved</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">500+</div>
                                    <div class="stat-label">Partner Departments</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">85%</div>
                                    <div class="stat-label">Resolution Rate</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- What We Do -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">2</span>
                            <h2>What We Do</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We provide a comprehensive platform for civic engagement:</p>
                            
                            <div class="features-grid">
                                <div class="feature-card">
                                    <div class="feature-icon">📝</div>
                                    <h4>Easy Complaint Submission</h4>
                                    <p>Submit complaints with photos, videos, or audio in under 2 minutes</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🤖</div>
                                    <h4>AI-Powered Routing</h4>
                                    <p>Intelligent categorization and automatic routing to relevant authorities</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">📊</div>
                                    <h4>Real-Time Tracking</h4>
                                    <p>Monitor your complaint status from submission to resolution</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🔔</div>
                                    <h4>Instant Notifications</h4>
                                    <p>Get SMS/Email updates at every stage of the process</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🏛️</div>
                                    <h4>Direct Authority Connect</h4>
                                    <p>Your complaints reach the right department without intermediaries</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">⭐</div>
                                    <h4>Accountability System</h4>
                                    <p>Rate services and ensure quality through feedback</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Our Values -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">3</span>
                            <h2>Our Values</h2>
                        </div>
                        
                        <div class="values-grid">
                            <div class="value-card">
                                <div class="value-icon">🔍</div>
                                <h4>Transparency</h4>
                                <p>Every step of the complaint process is visible and trackable</p>
                            </div>
                            <div class="value-card">
                                <div class="value-icon">⚡</div>
                                <h4>Efficiency</h4>
                                <p>Quick routing and resolution through automated systems</p>
                            </div>
                            <div class="value-card">
                                <div class="value-icon">🤝</div>
                                <h4>Accountability</h4>
                                <p>Both citizens and authorities are held responsible</p>
                            </div>
                            <div class="value-card">
                                <div class="value-icon">🌟</div>
                                <h4>Inclusivity</h4>
                                <p>Free and accessible to all citizens across India</p>
                            </div>
                        </div>
                    </section>

                    <!-- How We're Different -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">4</span>
                            <h2>How We're Different</h2>
                        </div>
                        
                        <div class="content-card">
                            <div class="comparison-grid">
                                <div class="comparison-item">
                                    <h4>✓ Direct Communication</h4>
                                    <p>No middlemen - complaints go straight to authorities</p>
                                </div>
                                <div class="comparison-item">
                                    <h4>✓ AI-Powered</h4>
                                    <p>Smart categorization and priority detection</p>
                                </div>
                                <div class="comparison-item">
                                    <h4>✓ Multimedia Support</h4>
                                    <p>Submit evidence via photos, videos, or audio</p>
                                </div>
                                <div class="comparison-item">
                                    <h4>✓ Real-Time Updates</h4>
                                    <p>Know exactly what's happening with your complaint</p>
                                </div>
                                <div class="comparison-item">
                                    <h4>✓ Mobile-Friendly</h4>
                                    <p>Works perfectly on all devices</p>
                                </div>
                                <div class="comparison-item">
                                    <h4>✓ Completely Free</h4>
                                    <p>No charges, no premium tiers</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Our Impact -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">5</span>
                            <h2>Our Impact</h2>
                        </div>
                        
                        <div class="content-card impact-card">
                            <h3>Making a Real Difference</h3>
                            <p>Since our launch, we've helped transform communities across India:</p>
                            
                            <div class="impact-stats">
                                <div class="impact-item">
                                    <span class="impact-icon">🚮</span>
                                    <div>
                                        <strong>25,000+</strong>
                                        <p>Sanitation issues resolved</p>
                                    </div>
                                </div>
                                <div class="impact-item">
                                    <span class="impact-icon">🛣️</span>
                                    <div>
                                        <strong>15,000+</strong>
                                        <p>Road repairs completed</p>
                                    </div>
                                </div>
                                <div class="impact-item">
                                    <span class="impact-icon">💧</span>
                                    <div>
                                        <strong>10,000+</strong>
                                        <p>Water supply issues fixed</p>
                                    </div>
                                </div>
                                <div class="impact-item">
                                    <span class="impact-icon">⚡</span>
                                    <div>
                                        <strong>8,000+</strong>
                                        <p>Electricity problems solved</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Team Section -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">6</span>
                            <h2>Our Team</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>Meri Shikayat is built and maintained by a dedicated team of:</p>
                            <ul>
                                <li><strong>Software Engineers</strong> - Building robust, scalable technology</li>
                                <li><strong>AI/ML Specialists</strong> - Developing intelligent routing systems</li>
                                <li><strong>UI/UX Designers</strong> - Creating intuitive user experiences</li>
                                <li><strong>Community Managers</strong> - Supporting users and authorities</li>
                                <li><strong>Legal Advisors</strong> - Ensuring compliance and data protection</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Contact CTA -->
                    <section class="support-cta">
                        <h2>Want to Learn More?</h2>
                        <p>Get in touch with us or explore our platform</p>
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
}
