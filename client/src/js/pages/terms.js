/**
 * Terms of Service Page - Professional Redesign
 * [U] UI/UX Engineer Implementation
 */

export function renderTermsPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page terms-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Terms of Service</h1>
                    <p class="page-subtitle">Rules and guidelines for using Meri Shikayat</p>
                    <p class="last-updated">Last Updated: December 4, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Introduction -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">📜</div>
                            <div class="info-content">
                                <h3>Agreement to Terms</h3>
                                <p>By accessing and using Meri Shikayat, you accept and agree to be bound by these Terms of Service. Please read them carefully before using our platform.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Acceptance of Terms -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">1</span>
                            <h2>Acceptance of Terms</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>By accessing and using Meri Shikayat ("the Platform"), you accept and agree to be bound by these Terms of Service.</p>
                            <p><strong>If you do not agree to these terms, please do not use our services.</strong></p>
                        </div>
                    </section>

                    <!-- User Eligibility -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">2</span>
                            <h2>User Eligibility</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>You must be at least <strong>13 years old</strong> to use this Platform.</p>
                            <p>By using our services, you represent and warrant that you:</p>
                            <ul class="check-list">
                                <li>✓ Meet the minimum age requirement</li>
                                <li>✓ Have the legal capacity to enter into these Terms</li>
                                <li>✓ Are not prohibited from using the Platform by law</li>
                                <li>✓ Will comply with all applicable laws and regulations</li>
                            </ul>
                        </div>
                    </section>

                    <!-- User Account -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">3</span>
                            <h2>User Account</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>To submit complaints, you must create an account. You are responsible for:</p>
                            
                            <div class="responsibility-grid">
                                <div class="responsibility-item">
                                    <span class="resp-icon">🔐</span>
                                    <h4>Account Security</h4>
                                    <p>Maintaining confidentiality of your credentials</p>
                                </div>
                                <div class="responsibility-item">
                                    <span class="resp-icon">👤</span>
                                    <h4>Account Activity</h4>
                                    <p>All activities that occur under your account</p>
                                </div>
                                <div class="responsibility-item">
                                    <span class="resp-icon">🚨</span>
                                    <h4>Unauthorized Access</h4>
                                    <p>Notifying us immediately of any breach</p>
                                </div>
                                <div class="responsibility-item">
                                    <span class="resp-icon">✅</span>
                                    <h4>Accurate Information</h4>
                                    <p>Providing truthful and up-to-date details</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Complaint Submission Rules -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">4</span>
                            <h2>Complaint Submission Rules</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>When submitting complaints, you agree to:</p>
                            <ul class="check-list">
                                <li>✓ Provide truthful and accurate information</li>
                                <li>✓ Submit complaints only for legitimate grievances</li>
                                <li>✓ Include relevant evidence and documentation</li>
                                <li>✓ Not submit duplicate or spam complaints</li>
                                <li>✓ Respect the privacy of others</li>
                                <li>✓ Use appropriate language and tone</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Prohibited Activities -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">5</span>
                            <h2>Prohibited Activities</h2>
                        </div>
                        
                        <div class="content-card warning-card">
                            <div class="warning-badge">⚠️ Strictly Prohibited</div>
                            <p>You agree <strong>NOT</strong> to:</p>
                            <ul class="cross-list">
                                <li>✗ Submit false, misleading, or fraudulent complaints</li>
                                <li>✗ Harass, threaten, or defame individuals or organizations</li>
                                <li>✗ Upload malicious content or viruses</li>
                                <li>✗ Attempt to gain unauthorized access to the Platform</li>
                                <li>✗ Use the Platform for any illegal purposes</li>
                                <li>✗ Impersonate others or misrepresent your identity</li>
                                <li>✗ Interfere with the proper functioning of the Platform</li>
                                <li>✗ Scrape or harvest data without permission</li>
                            </ul>
                            <p class="highlight-text">Violation of these rules may result in immediate account suspension and legal action.</p>
                        </div>
                    </section>

                    <!-- Content Ownership -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">6</span>
                            <h2>Content Ownership and License</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Your Content</h3>
                            <p>You retain ownership of the content you submit.</p>
                            
                            <h3>License Grant</h3>
                            <p>By submitting content, you grant us a <strong>non-exclusive, worldwide, royalty-free license</strong> to:</p>
                            <ul>
                                <li>Use and display your content</li>
                                <li>Share it with relevant authorities</li>
                                <li>Process it for complaint resolution</li>
                                <li>Improve our services and AI/ML models</li>
                            </ul>
                            
                            <div class="legal-note">
                                <strong>Note:</strong> This license is necessary to fulfill the platform's purpose of resolving your complaints.
                            </div>
                        </div>
                    </section>

                    <!-- Platform Availability -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">7</span>
                            <h2>Platform Availability</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We strive to maintain continuous availability but do not guarantee uninterrupted access.</p>
                            <p>We reserve the right to:</p>
                            <ul>
                                <li>Modify features or functionality</li>
                                <li>Suspend service for maintenance</li>
                                <li>Discontinue any part of the Platform</li>
                                <li>Update system requirements</li>
                            </ul>
                            <p>We will provide notice when possible, but may make changes without prior notification for security or legal reasons.</p>
                        </div>
                    </section>

                    <!-- Disclaimer of Warranties -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">8</span>
                            <h2>Disclaimer of Warranties</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>The Platform is provided <strong>"as is"</strong> without warranties of any kind.</p>
                            <p>We do not guarantee:</p>
                            <ul class="cross-list">
                                <li>✗ Resolution of all submitted complaints</li>
                                <li>✗ Specific response times from authorities</li>
                                <li>✗ Accuracy of third-party information</li>
                                <li>✗ Uninterrupted or error-free service</li>
                                <li>✗ Particular outcomes or results</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Limitation of Liability -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">9</span>
                            <h2>Limitation of Liability</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>To the maximum extent permitted by law, Meri Shikayat shall <strong>not be liable</strong> for:</p>
                            <ul>
                                <li>Indirect, incidental, or consequential damages</li>
                                <li>Loss of profits, data, or business opportunities</li>
                                <li>Actions or inactions of government authorities</li>
                                <li>User-generated content or third-party actions</li>
                                <li>Service interruptions or data loss</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Account Termination -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">10</span>
                            <h2>Account Termination</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Our Rights</h3>
                            <p>We reserve the right to suspend or terminate your account if you:</p>
                            <ul>
                                <li>Violate these Terms of Service</li>
                                <li>Engage in prohibited activities</li>
                                <li>Harm the Platform or other users</li>
                                <li>Fail to respond to our inquiries</li>
                            </ul>
                            
                            <h3>Your Rights</h3>
                            <p>You may request account deletion at any time through your profile settings or by contacting support.</p>
                        </div>
                    </section>

                    <!-- Changes to Terms -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">11</span>
                            <h2>Changes to Terms</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We may modify these Terms at any time. When we do:</p>
                            <ul>
                                <li>We'll post the updated Terms on this page</li>
                                <li>Update the "Last Updated" date</li>
                                <li>Notify users of significant changes via email</li>
                                <li>Provide 30 days notice for material changes</li>
                            </ul>
                            <p><strong>Continued use of the Platform after changes constitutes acceptance of the modified Terms.</strong></p>
                        </div>
                    </section>

                    <!-- Governing Law -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">12</span>
                            <h2>Governing Law</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>These Terms shall be governed by and construed in accordance with the <strong>laws of India</strong>.</p>
                            <p>Any disputes shall be subject to the exclusive jurisdiction of courts in <strong>New Delhi, India</strong>.</p>
                        </div>
                    </section>

                    <!-- Contact Information -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">13</span>
                            <h2>Contact Information</h2>
                        </div>
                        
                        <div class="content-card contact-card">
                            <p>For questions about these Terms, please contact us:</p>
                            <div class="contact-methods">
                                <div class="contact-method">
                                    <span class="contact-icon">📧</span>
                                    <div>
                                        <strong>Legal Team</strong>
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
                                        <p>Meri Shikayat Office, New Delhi, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Related Pages -->
                    <section class="related-pages">
                        <h3>Related Legal Documents</h3>
                        <div class="related-links">
                            <a href="/privacy" class="related-link">
                                <span class="link-icon">🔒</span>
                                <span>Privacy Policy</span>
                            </a>
                            <a href="/disclaimer" class="related-link">
                                <span class="link-icon">⚠️</span>
                                <span>Disclaimer</span>
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
}
