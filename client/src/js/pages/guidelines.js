/**
 * Community Guidelines Page
 */

export function renderGuidelinesPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="disclaimer-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Community Guidelines</h1>
                    <p class="page-subtitle">Building a Respectful and Effective Civic Platform</p>
                    <p class="last-updated">Last Updated: December 16, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Introduction -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">🤝</div>
                            <div class="info-content">
                                <h3>Welcome to Meri Shikayat Community</h3>
                                <p>Our platform is built on the principles of transparency, accountability, and civic engagement. These guidelines help ensure a respectful and productive environment for all users to report issues and collaborate on solutions.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Section 1: Be Respectful and Civil -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">1</div>
                            <h2>Be Respectful and Civil</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Do:</h3>
                            <ul class="check-list">
                                <li>✓ Treat all community members with respect and dignity</li>
                                <li>✓ Use polite and professional language</li>
                                <li>✓ Focus on issues, not personal attacks</li>
                                <li>✓ Acknowledge different perspectives</li>
                            </ul>
                        </div>
                        <div class="content-card">
                            <h3>❌ Don't:</h3>
                            <ul class="cross-list">
                                <li>✗ Use abusive, threatening, or offensive language</li>
                                <li>✗ Engage in personal attacks or harassment</li>
                                <li>✗ Discriminate based on race, religion, gender, or other protected characteristics</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 2: Provide Accurate Information -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">2</div>
                            <h2>Provide Accurate Information</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Do:</h3>
                            <ul class="check-list">
                                <li>✓ Submit truthful and verifiable complaints</li>
                                <li>✓ Include relevant evidence (photos, videos, documents)</li>
                                <li>✓ Provide accurate location and contact information</li>
                                <li>✓ Update complaints if circumstances change</li>
                            </ul>
                        </div>
                        <div class="content-card">
                            <h3>❌ Don't:</h3>
                            <ul class="cross-list">
                                <li>✗ Submit false or misleading information</li>
                                <li>✗ Exaggerate or fabricate details</li>
                                <li>✗ Impersonate others or organizations</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 3: No Spam or Abuse -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">3</div>
                            <h2>No Spam or Abuse</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Do:</h3>
                            <ul class="check-list">
                                <li>✓ Submit one complaint per genuine issue</li>
                                <li>✓ Use the platform for its intended purpose</li>
                                <li>✓ Report duplicate or spam content</li>
                            </ul>
                        </div>
                        <div class="content-card">
                            <h3>❌ Don't:</h3>
                            <ul class="cross-list">
                                <li>✗ Submit duplicate complaints for the same issue</li>
                                <li>✗ Flood the platform with repetitive content</li>
                                <li>✗ Use the platform for advertising or promotional purposes</li>
                                <li>✗ Create multiple accounts to manipulate the system</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 4: Respect Privacy -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">4</div>
                            <h2>Respect Privacy</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Do:</h3>
                            <ul class="check-list">
                                <li>✓ Protect the privacy of individuals in your complaints</li>
                                <li>✓ Blur faces in photos when appropriate</li>
                                <li>✓ Focus on issues rather than individuals</li>
                            </ul>
                        </div>
                        <div class="content-card">
                            <h3>❌ Don't:</h3>
                            <ul class="cross-list">
                                <li>✗ Share personal information of others without consent</li>
                                <li>✗ Post private conversations or documents</li>
                                <li>✗ Engage in doxxing or public shaming</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 5: Stay Within Legal Boundaries -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">5</div>
                            <h2>Stay Within Legal Boundaries</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Do:</h3>
                            <ul class="check-list">
                                <li>✓ Use the platform for legitimate civic grievances</li>
                                <li>✓ Respect intellectual property rights</li>
                                <li>✓ Comply with local laws and regulations</li>
                            </ul>
                        </div>
                        <div class="content-card">
                            <h3>❌ Don't:</h3>
                            <ul class="cross-list">
                                <li>✗ Use the platform for illegal activities</li>
                                <li>✗ Share copyrighted content without permission</li>
                                <li>✗ Incite violence or illegal actions</li>
                                <li>✗ Submit complaints about matters outside our scope</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 6: Appropriate Content -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">6</div>
                            <h2>Appropriate Content</h2>
                        </div>
                        <div class="content-card">
                            <h3>✅ Acceptable:</h3>
                            <ul class="check-list">
                                <li>✓ Photos and videos documenting civic issues</li>
                                <li>✓ Factual descriptions of problems</li>
                                <li>✓ Evidence supporting your complaint</li>
                            </ul>
                        </div>
                        <div class="content-card warning-card">
                            <span class="warning-badge">⚠️ Not Acceptable</span>
                            <ul class="cross-list">
                                <li>✗ Graphic violence or gore (unless essential to the complaint)</li>
                                <li>✗ Sexually explicit content</li>
                                <li>✗ Content promoting hate or extremism</li>
                                <li>✗ Malicious software or harmful links</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 7: Constructive Engagement -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">7</div>
                            <h2>Constructive Engagement</h2>
                        </div>
                        <div class="content-card">
                            <h3>💡 Best Practices:</h3>
                            <ul class="check-list">
                                <li>✓ Suggest solutions when possible</li>
                                <li>✓ Engage constructively with authorities</li>
                                <li>✓ Provide updates on complaint resolution</li>
                                <li>✓ Share positive outcomes to inspire others</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 8: Reporting Violations -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">8</div>
                            <h2>Reporting Violations</h2>
                        </div>
                        <div class="info-box">
                            <div class="info-icon">🚨</div>
                            <div class="info-content">
                                <h3>How to Report</h3>
                                <p>If you encounter content or behavior that violates these guidelines:</p>
                                <ul>
                                    <li>Use the "Report" feature on the platform</li>
                                    <li>Provide specific details about the violation</li>
                                    <li>Do not engage with or retaliate against violators</li>
                                </ul>
                                <div class="legal-note">
                                    <strong>Note:</strong> Our moderation team will review all reports and take appropriate action within 24-48 hours.
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Section 9: Consequences -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">9</div>
                            <h2>Consequences of Violations</h2>
                        </div>
                        <div class="content-card warning-card">
                            <span class="warning-badge">⚖️ Enforcement Actions</span>
                            <p>Violations of these guidelines may result in:</p>
                            <ul>
                                <li><strong>⚠️ Warning:</strong> First-time minor violations</li>
                                <li><strong>🗑️ Content Removal:</strong> Deletion of violating complaints or comments</li>
                                <li><strong>⏸️ Temporary Suspension:</strong> Limited access for repeated violations</li>
                                <li><strong>🚫 Permanent Ban:</strong> Account termination for serious or repeated violations</li>
                                <li><strong>⚖️ Legal Action:</strong> In cases of illegal activity or severe harm</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Section 10: Updates -->
                    <section class="legal-section">
                        <div class="section-header">
                            <div class="section-number">10</div>
                            <h2>Updates to Guidelines</h2>
                        </div>
                        <div class="content-card">
                            <p>We may update these guidelines periodically to reflect community needs and platform evolution. Continued use of the platform constitutes acceptance of updated guidelines. We will notify users of significant changes via email or platform notifications.</p>
                        </div>
                    </section>

                    <!-- Contact Section -->
                    <section class="legal-section contact-card">
                        <h2>📧 Contact Us</h2>
                        <p>Questions about these guidelines? We're here to help!</p>
                        <div class="contact-methods">
                            <div class="contact-method">
                                <div class="contact-icon">📧</div>
                                <div>
                                    <strong>Email</strong>
                                    <p>community@merishikayat.in</p>
                                </div>
                            </div>
                            <div class="contact-method">
                                <div class="contact-icon">🚨</div>
                                <div>
                                    <strong>Report Violations</strong>
                                    <p>Use the in-platform reporting feature</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Related Pages -->
                    <div class="related-pages">
                        <h3>📚 Related Documents</h3>
                        <div class="related-links">
                            <a href="/privacy" class="related-link">
                                <span class="link-icon">🔒</span>
                                Privacy Policy
                            </a>
                            <a href="/terms" class="related-link">
                                <span class="link-icon">📜</span>
                                Terms of Service
                            </a>
                            <a href="/disclaimer" class="related-link">
                                <span class="link-icon">⚠️</span>
                                Disclaimer
                            </a>
                            <a href="/help" class="related-link">
                                <span class="link-icon">❓</span>
                                Help Center
                            </a>
                        </div>
                    </div>

                    <!-- Thank You Footer -->
                    <div class="acceptance-section">
                        <div class="acceptance-box">
                            <h3>🙏 Thank You!</h3>
                            <p style="color: white; font-size: 1.125rem; margin: 0;">Thank you for helping us build a respectful and effective platform for civic engagement. Together, we can make our communities better!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Add event listener for back link
    app.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}
