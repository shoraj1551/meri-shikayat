/**
 * Disclaimer Page - Professional Legal Design
 * [U] UI/UX Engineer Implementation
 */

export function renderDisclaimerPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page disclaimer-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Disclaimer</h1>
                    <p class="page-subtitle">Important information about using Meri Shikayat</p>
                    <p class="last-updated">Last Updated: January 15, 2024</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Introduction -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">ℹ️</div>
                            <div class="info-content">
                                <h3>Please Read Carefully</h3>
                                <p>This disclaimer governs your use of the Meri Shikayat platform. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Platform Role -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">1</span>
                            <h2>Platform Role & Limitations</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>We Are a Facilitator, Not an Authority</h3>
                            <p>Meri Shikayat is a <strong>citizen engagement platform</strong> that facilitates communication between citizens and government authorities. We:</p>
                            <ul class="check-list">
                                <li>✓ Provide a platform to submit and track complaints</li>
                                <li>✓ Forward complaints to relevant authorities</li>
                                <li>✓ Enable transparency in the complaint resolution process</li>
                            </ul>
                            <p><strong>We do NOT:</strong></p>
                            <ul class="cross-list">
                                <li>✗ Have direct authority to resolve complaints</li>
                                <li>✗ Guarantee specific resolution timelines</li>
                                <li>✗ Control government department actions</li>
                                <li>✗ Make decisions on behalf of authorities</li>
                            </ul>
                        </div>
                    </section>

                    <!-- User Responsibility -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">2</span>
                            <h2>User Responsibility</h2>
                        </div>
                        
                        <div class="content-card warning-card">
                            <div class="warning-badge">⚠️ Important</div>
                            <h3>Accuracy of Information</h3>
                            <p>Users are <strong>solely responsible</strong> for:</p>
                            <ul>
                                <li>Providing accurate and truthful information</li>
                                <li>Ensuring complaint details are factual</li>
                                <li>Uploading authentic photos, videos, or audio</li>
                                <li>Respecting community guidelines</li>
                                <li>Not submitting false, defamatory, or malicious complaints</li>
                            </ul>
                            <p class="highlight-text">False complaints may result in account suspension and legal action.</p>
                        </div>
                    </section>

                    <!-- No Guarantees -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">3</span>
                            <h2>No Guarantees or Warranties</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Service Availability</h3>
                            <p>While we strive for 100% uptime, we <strong>do not guarantee</strong>:</p>
                            <ul>
                                <li>Uninterrupted access to the platform</li>
                                <li>Error-free operation</li>
                                <li>Specific complaint resolution times</li>
                                <li>Particular outcomes for complaints</li>
                            </ul>
                            
                            <h3>Third-Party Actions</h3>
                            <p>We cannot control or guarantee:</p>
                            <ul>
                                <li>How government authorities respond to complaints</li>
                                <li>The speed of departmental action</li>
                                <li>The quality of resolution provided</li>
                                <li>Communication from authorities</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Limitation of Liability -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">4</span>
                            <h2>Limitation of Liability</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Platform Liability</h3>
                            <p>To the maximum extent permitted by law, Meri Shikayat and its operators shall <strong>not be liable</strong> for:</p>
                            <ul>
                                <li>Delays or failures in complaint resolution</li>
                                <li>Actions or inactions of government authorities</li>
                                <li>Loss of data or service interruptions</li>
                                <li>Indirect, incidental, or consequential damages</li>
                                <li>User-generated content or third-party actions</li>
                            </ul>
                            
                            <div class="legal-note">
                                <strong>Note:</strong> Our liability is limited to providing the platform service. We are not responsible for outcomes beyond our direct control.
                            </div>
                        </div>
                    </section>

                    <!-- User-Generated Content -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">5</span>
                            <h2>User-Generated Content</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Content Responsibility</h3>
                            <p>All complaints, comments, and media uploaded by users are <strong>their sole responsibility</strong>. We:</p>
                            <ul>
                                <li>Do not pre-screen all user content</li>
                                <li>Are not responsible for accuracy of user submissions</li>
                                <li>Reserve the right to remove inappropriate content</li>
                                <li>May moderate content based on community guidelines</li>
                            </ul>
                            
                            <h3>Intellectual Property</h3>
                            <p>Users retain ownership of their content but grant us a license to display, process, and forward it to relevant authorities.</p>
                        </div>
                    </section>

                    <!-- External Links -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">6</span>
                            <h2>External Links & Third Parties</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>Our platform may contain links to external websites or integrate with third-party services. We:</p>
                            <ul>
                                <li>Do not control external websites</li>
                                <li>Are not responsible for their content or policies</li>
                                <li>Do not endorse linked websites</li>
                                <li>Recommend reviewing their terms and privacy policies</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Technical Limitations -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">7</span>
                            <h2>Technical Limitations</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>AI/ML Features</h3>
                            <p>Our platform uses AI/ML for complaint categorization and priority detection. Please note:</p>
                            <ul>
                                <li>AI suggestions may not always be 100% accurate</li>
                                <li>Users should verify auto-categorization</li>
                                <li>Final decisions rest with authorities, not AI</li>
                            </ul>
                            
                            <h3>Location Services</h3>
                            <p>GPS and location features depend on device capabilities and may have accuracy limitations.</p>
                        </div>
                    </section>

                    <!-- Changes to Disclaimer -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">8</span>
                            <h2>Changes to This Disclaimer</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We reserve the right to modify this disclaimer at any time. Changes will be:</p>
                            <ul>
                                <li>Posted on this page with an updated date</li>
                                <li>Effective immediately upon posting</li>
                                <li>Communicated via email for significant changes</li>
                            </ul>
                            <p>Continued use of the platform after changes constitutes acceptance of the updated disclaimer.</p>
                        </div>
                    </section>

                    <!-- Contact -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">9</span>
                            <h2>Questions or Concerns</h2>
                        </div>
                        
                        <div class="content-card contact-card">
                            <p>If you have questions about this disclaimer, please contact us:</p>
                            <div class="contact-methods">
                                <div class="contact-method">
                                    <span class="contact-icon">📧</span>
                                    <div>
                                        <strong>Email</strong>
                                        <p>legal@merishikayat.in</p>
                                    </div>
                                </div>
                                <div class="contact-method">
                                    <span class="contact-icon">📞</span>
                                    <div>
                                        <strong>Phone</strong>
                                        <p>+91 123 456 7890</p>
                                    </div>
                                </div>
                                <div class="contact-method">
                                    <span class="contact-icon">📍</span>
                                    <div>
                                        <strong>Address</strong>
                                        <p>Meri Shikayat Office, New Delhi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Acceptance -->
                    <section class="acceptance-section">
                        <div class="acceptance-box">
                            <h3>By Using Meri Shikayat, You Acknowledge:</h3>
                            <ul class="acceptance-list">
                                <li>✓ You have read and understood this disclaimer</li>
                                <li>✓ You agree to the terms and limitations stated</li>
                                <li>✓ You accept responsibility for your submissions</li>
                                <li>✓ You understand the platform's role as a facilitator</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Related Pages -->
                    <section class="related-pages">
                        <h3>Related Legal Documents</h3>
                        <div class="related-links">
                            <a href="/terms" class="related-link">
                                <span class="link-icon">📄</span>
                                <span>Terms of Service</span>
                            </a>
                            <a href="/privacy" class="related-link">
                                <span class="link-icon">🔒</span>
                                <span>Privacy Policy</span>
                            </a>
                            <a href="/guidelines" class="related-link">
                                <span class="link-icon">📋</span>
                                <span>Community Guidelines</span>
                            </a>
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

    // Smooth scroll for anchor links
    const anchorLinks = app.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = app.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
