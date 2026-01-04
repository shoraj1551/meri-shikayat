/**
 * Privacy Policy Page - Professional Redesign
 * [U] UI/UX Engineer Implementation
 */

export function renderPrivacyPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page privacy-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Privacy Policy</h1>
                    <p class="page-subtitle">How we collect, use, and protect your personal information</p>
                    <p class="last-updated">Last Updated: December 4, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Introduction -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">🔒</div>
                            <div class="info-content">
                                <h3>Your Privacy Matters</h3>
                                <p>At Meri Shikayat, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your data.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Information We Collect -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">1</span>
                            <h2>Information We Collect</h2>
                        </div>
                        
                        <div class="content-card">
                            <h3>Personal Information</h3>
                            <p>We collect information that you provide directly to us when you:</p>
                            <ul class="check-list">
                                <li>✓ Register for an account on Meri Shikayat</li>
                                <li>✓ Submit a complaint or grievance</li>
                                <li>✓ Contact our support team</li>
                                <li>✓ Participate in surveys or feedback forms</li>
                                <li>✓ Update your profile or preferences</li>
                            </ul>
                            
                            <h3>Types of Data Collected</h3>
                            <div class="data-types-grid">
                                <div class="data-type-card">
                                    <div class="data-icon">👤</div>
                                    <h4>Identity Data</h4>
                                    <p>Name, email, phone number, age</p>
                                </div>
                                <div class="data-type-card">
                                    <div class="data-icon">📍</div>
                                    <h4>Location Data</h4>
                                    <p>GPS coordinates, address, pincode</p>
                                </div>
                                <div class="data-type-card">
                                    <div class="data-icon">📝</div>
                                    <h4>Complaint Data</h4>
                                    <p>Text, images, videos, audio files</p>
                                </div>
                                <div class="data-type-card">
                                    <div class="data-icon">📊</div>
                                    <h4>Usage Data</h4>
                                    <p>Login times, features used, interactions</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- How We Use Your Information -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">2</span>
                            <h2>How We Use Your Information</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We use the information we collect to:</p>
                            <div class="usage-grid">
                                <div class="usage-item">
                                    <span class="usage-icon">🎯</span>
                                    <div>
                                        <h4>Process Complaints</h4>
                                        <p>Route your complaints to appropriate authorities</p>
                                    </div>
                                </div>
                                <div class="usage-item">
                                    <span class="usage-icon">💬</span>
                                    <div>
                                        <h4>Communication</h4>
                                        <p>Send updates and notifications about your complaints</p>
                                    </div>
                                </div>
                                <div class="usage-item">
                                    <span class="usage-icon">🔧</span>
                                    <div>
                                        <h4>Improve Services</h4>
                                        <p>Enhance user experience and platform features</p>
                                    </div>
                                </div>
                                <div class="usage-item">
                                    <span class="usage-icon">🛡️</span>
                                    <div>
                                        <h4>Security</h4>
                                        <p>Prevent fraud and ensure platform safety</p>
                                    </div>
                                </div>
                                <div class="usage-item">
                                    <span class="usage-icon">⚖️</span>
                                    <div>
                                        <h4>Legal Compliance</h4>
                                        <p>Meet legal and regulatory obligations</p>
                                    </div>
                                </div>
                                <div class="usage-item">
                                    <span class="usage-icon">📈</span>
                                    <div>
                                        <h4>Analytics</h4>
                                        <p>Understand usage patterns and trends</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Data Security -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">3</span>
                            <h2>Data Security</h2>
                        </div>
                        
                        <div class="content-card security-card">
                            <div class="security-badge">🔐 Bank-Level Security</div>
                            <p>We implement <strong>industry-leading security measures</strong> to protect your personal information:</p>
                            
                            <div class="security-features">
                                <div class="security-feature">
                                    <span class="feature-icon">🔒</span>
                                    <div>
                                        <h4>Encryption</h4>
                                        <p>All data encrypted in transit (SSL/TLS) and at rest (AES-256)</p>
                                    </div>
                                </div>
                                <div class="security-feature">
                                    <span class="feature-icon">🔍</span>
                                    <div>
                                        <h4>Regular Audits</h4>
                                        <p>Periodic security assessments and penetration testing</p>
                                    </div>
                                </div>
                                <div class="security-feature">
                                    <span class="feature-icon">🚪</span>
                                    <div>
                                        <h4>Access Controls</h4>
                                        <p>Multi-factor authentication and role-based access</p>
                                    </div>
                                </div>
                                <div class="security-feature">
                                    <span class="feature-icon">💾</span>
                                    <div>
                                        <h4>Secure Storage</h4>
                                        <p>Data stored in certified, compliant data centers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Information Sharing -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">4</span>
                            <h2>Information Sharing</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We may share your information with:</p>
                            
                            <div class="sharing-grid">
                                <div class="sharing-card">
                                    <div class="sharing-icon">🏛️</div>
                                    <h4>Government Authorities</h4>
                                    <p>To process and resolve your complaints</p>
                                    <span class="sharing-badge necessary">Necessary</span>
                                </div>
                                <div class="sharing-card">
                                    <div class="sharing-icon">🔧</div>
                                    <h4>Service Providers</h4>
                                    <p>Who assist us in operating our platform</p>
                                    <span class="sharing-badge controlled">Controlled</span>
                                </div>
                                <div class="sharing-card">
                                    <div class="sharing-icon">⚖️</div>
                                    <h4>Legal Requirements</h4>
                                    <p>When required by law or legal process</p>
                                    <span class="sharing-badge mandatory">Mandatory</span>
                                </div>
                            </div>
                            
                            <div class="important-note">
                                <strong>Important:</strong> We <strong>DO NOT</strong> sell your personal information to third parties.
                            </div>
                        </div>
                    </section>

                    <!-- Your Rights -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">5</span>
                            <h2>Your Rights</h2>
                        </div>
                        
                        <div class="content-card rights-card">
                            <p>You have the following rights regarding your personal data:</p>
                            
                            <div class="rights-grid">
                                <div class="right-item">
                                    <div class="right-icon">👁️</div>
                                    <h4>Right to Access</h4>
                                    <p>View all personal information we hold about you</p>
                                </div>
                                <div class="right-item">
                                    <div class="right-icon">✏️</div>
                                    <h4>Right to Correct</h4>
                                    <p>Update or correct inaccurate data</p>
                                </div>
                                <div class="right-item">
                                    <div class="right-icon">🗑️</div>
                                    <h4>Right to Delete</h4>
                                    <p>Request deletion of your data (subject to legal requirements)</p>
                                </div>
                                <div class="right-item">
                                    <div class="right-icon">📥</div>
                                    <h4>Right to Export</h4>
                                    <p>Download your data in a portable format</p>
                                </div>
                                <div class="right-item">
                                    <div class="right-icon">🚫</div>
                                    <h4>Right to Opt-Out</h4>
                                    <p>Unsubscribe from marketing communications</p>
                                </div>
                                <div class="right-item">
                                    <div class="right-icon">📢</div>
                                    <h4>Right to Complain</h4>
                                    <p>Lodge complaints with data protection authorities</p>
                                </div>
                            </div>
                            
                            <p class="exercise-rights">To exercise any of these rights, please contact us at <a href="mailto:privacy@merishikayat.in">privacy@merishikayat.in</a></p>
                        </div>
                    </section>

                    <!-- Cookies and Tracking -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">6</span>
                            <h2>Cookies and Tracking</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We use cookies and similar technologies to enhance your experience:</p>
                            
                            <div class="cookie-types">
                                <div class="cookie-type">
                                    <h4>🍪 Essential Cookies</h4>
                                    <p>Required for platform functionality (login, security)</p>
                                    <span class="cookie-status required">Required</span>
                                </div>
                                <div class="cookie-type">
                                    <h4>📊 Analytics Cookies</h4>
                                    <p>Help us understand how you use our platform</p>
                                    <span class="cookie-status optional">Optional</span>
                                </div>
                                <div class="cookie-type">
                                    <h4>⚙️ Preference Cookies</h4>
                                    <p>Remember your settings and preferences</p>
                                    <span class="cookie-status optional">Optional</span>
                                </div>
                            </div>
                            
                            <p>You can control cookie preferences through your browser settings.</p>
                        </div>
                    </section>

                    <!-- Data Retention -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">7</span>
                            <h2>Data Retention</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We retain your personal information for as long as necessary to:</p>
                            <ul>
                                <li>Fulfill the purposes outlined in this policy</li>
                                <li>Comply with legal obligations</li>
                                <li>Resolve disputes and enforce agreements</li>
                                <li>Maintain complaint history for accountability</li>
                            </ul>
                            
                            <div class="retention-timeline">
                                <div class="timeline-item">
                                    <div class="timeline-duration">Active Account</div>
                                    <p>Data retained while your account is active</p>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-duration">After Deletion</div>
                                    <p>30 days grace period, then permanent deletion</p>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-duration">Legal Hold</div>
                                    <p>Extended retention if required by law</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Changes to Policy -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">8</span>
                            <h2>Changes to This Policy</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>We may update this Privacy Policy from time to time. When we do:</p>
                            <ul>
                                <li>We'll post the new policy on this page</li>
                                <li>Update the "Last Updated" date</li>
                                <li>Notify you via email for material changes</li>
                                <li>Give you 30 days notice before changes take effect</li>
                            </ul>
                            <p>Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
                        </div>
                    </section>

                    <!-- Contact Us -->
                    <section class="legal-section">
                        <div class="section-header">
                            <span class="section-number">9</span>
                            <h2>Contact Us</h2>
                        </div>
                        
                        <div class="content-card contact-card">
                            <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                            <div class="contact-methods">
                                <div class="contact-method">
                                    <span class="contact-icon">📧</span>
                                    <div>
                                        <strong>Privacy Team</strong>
                                        <p>privacy@merishikayat.in</p>
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
                            <a href="/terms" class="related-link">
                                <span class="link-icon">📄</span>
                                <span>Terms of Service</span>
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
