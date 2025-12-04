/**
 * Community Guidelines Page
 */

export function renderGuidelinesPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Community Guidelines</h1>
                    <p class="last-updated">Last Updated: December 4, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <section class="legal-section">
                        <h2>Welcome to Meri Shikayat Community</h2>
                        <p>Our platform is built on the principles of transparency, accountability, and civic engagement. These guidelines help ensure a respectful and productive environment for all users.</p>
                    </section>

                    <section class="legal-section">
                        <h2>1. Be Respectful and Civil</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Treat all community members with respect and dignity</li>
                            <li>Use polite and professional language</li>
                            <li>Focus on issues, not personal attacks</li>
                            <li>Acknowledge different perspectives</li>
                        </ul>
                        <p><strong>Don't:</strong></p>
                        <ul>
                            <li>Use abusive, threatening, or offensive language</li>
                            <li>Engage in personal attacks or harassment</li>
                            <li>Discriminate based on race, religion, gender, or other protected characteristics</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>2. Provide Accurate Information</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Submit truthful and verifiable complaints</li>
                            <li>Include relevant evidence (photos, videos, documents)</li>
                            <li>Provide accurate location and contact information</li>
                            <li>Update complaints if circumstances change</li>
                        </ul>
                        <p><strong>Don't:</strong></p>
                        <ul>
                            <li>Submit false or misleading information</li>
                            <li>Exaggerate or fabricate details</li>
                            <li>Impersonate others or organizations</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>3. No Spam or Abuse</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Submit one complaint per genuine issue</li>
                            <li>Use the platform for its intended purpose</li>
                            <li>Report duplicate or spam content</li>
                        </ul>
                        <p><strong>Don't:</strong></p>
                        <ul>
                            <li>Submit duplicate complaints for the same issue</li>
                            <li>Flood the platform with repetitive content</li>
                            <li>Use the platform for advertising or promotional purposes</li>
                            <li>Create multiple accounts to manipulate the system</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>4. Respect Privacy</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Protect the privacy of individuals in your complaints</li>
                            <li>Blur faces in photos when appropriate</li>
                            <li>Focus on issues rather than individuals</li>
                        </ul>
                        <p><strong>Don't:</strong></p>
                        <ul>
                            <li>Share personal information of others without consent</li>
                            <li>Post private conversations or documents</li>
                            <li>Engage in doxxing or public shaming</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>5. Stay Within Legal Boundaries</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Use the platform for legitimate civic grievances</li>
                            <li>Respect intellectual property rights</li>
                            <li>Comply with local laws and regulations</li>
                        </ul>
                        <p><strong>Don't:</strong></p>
                        <ul>
                            <li>Use the platform for illegal activities</li>
                            <li>Share copyrighted content without permission</li>
                            <li>Incite violence or illegal actions</li>
                            <li>Submit complaints about matters outside our scope</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>6. Appropriate Content</h2>
                        <p><strong>Acceptable:</strong></p>
                        <ul>
                            <li>Photos and videos documenting civic issues</li>
                            <li>Factual descriptions of problems</li>
                            <li>Evidence supporting your complaint</li>
                        </ul>
                        <p><strong>Not Acceptable:</strong></p>
                        <ul>
                            <li>Graphic violence or gore (unless essential to the complaint)</li>
                            <li>Sexually explicit content</li>
                            <li>Content promoting hate or extremism</li>
                            <li>Malicious software or harmful links</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>7. Constructive Engagement</h2>
                        <p><strong>Do:</strong></p>
                        <ul>
                            <li>Suggest solutions when possible</li>
                            <li>Engage constructively with authorities</li>
                            <li>Provide updates on complaint resolution</li>
                            <li>Share positive outcomes to inspire others</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>8. Reporting Violations</h2>
                        <p>If you encounter content or behavior that violates these guidelines:</p>
                        <ul>
                            <li>Use the "Report" feature on the platform</li>
                            <li>Provide specific details about the violation</li>
                            <li>Do not engage with or retaliate against violators</li>
                        </ul>
                        <p>Our moderation team will review reports and take appropriate action.</p>
                    </section>

                    <section class="legal-section">
                        <h2>9. Consequences of Violations</h2>
                        <p>Violations of these guidelines may result in:</p>
                        <ul>
                            <li><strong>Warning:</strong> First-time minor violations</li>
                            <li><strong>Content Removal:</strong> Deletion of violating complaints or comments</li>
                            <li><strong>Temporary Suspension:</strong> Limited access for repeated violations</li>
                            <li><strong>Permanent Ban:</strong> Account termination for serious or repeated violations</li>
                            <li><strong>Legal Action:</strong> In cases of illegal activity or severe harm</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>10. Updates to Guidelines</h2>
                        <p>We may update these guidelines to reflect community needs and platform evolution. Continued use of the platform constitutes acceptance of updated guidelines.</p>
                    </section>

                    <section class="legal-section">
                        <h2>Contact Us</h2>
                        <p>Questions about these guidelines? Contact us at:</p>
                        <p><strong>Email:</strong> community@merishikayat.in<br>
                        <strong>Report Violations:</strong> Use the in-platform reporting feature</p>
                    </section>

                    <div class="guidelines-footer">
                        <p><em>Thank you for helping us build a respectful and effective platform for civic engagement!</em></p>
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
