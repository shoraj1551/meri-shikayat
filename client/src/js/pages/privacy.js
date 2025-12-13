/**
 * Privacy Policy Page
 */

export function renderPrivacyPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Privacy Policy</h1>
                    <p class="last-updated">Last Updated: December 4, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <section class="legal-section">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information that you provide directly to us when you:</p>
                        <ul>
                            <li>Register for an account on Meri Shikayat</li>
                            <li>Submit a complaint or grievance</li>
                            <li>Contact our support team</li>
                            <li>Participate in surveys or feedback forms</li>
                        </ul>
                        <p>This information may include your name, email address, phone number, location data, and any content you submit through our platform.</p>
                    </section>

                    <section class="legal-section">
                        <h2>2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Process and route your complaints to appropriate authorities</li>
                            <li>Communicate with you about your complaints and account</li>
                            <li>Improve our services and user experience</li>
                            <li>Ensure platform security and prevent fraud</li>
                            <li>Comply with legal obligations</li>
                            <li>Send you updates and notifications about your complaints</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>3. Data Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Secure data storage practices</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>4. Information Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong>Government Authorities:</strong> To process and resolve your complaints</li>
                            <li><strong>Service Providers:</strong> Who assist us in operating our platform</li>
                            <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
                        </ul>
                        <p>We do not sell your personal information to third parties.</p>
                    </section>

                    <section class="legal-section">
                        <h2>5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data (subject to legal requirements)</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Lodge a complaint with data protection authorities</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>6. Cookies and Tracking</h2>
                        <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.</p>
                    </section>

                    <section class="legal-section">
                        <h2>7. Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
                    </section>

                    <section class="legal-section">
                        <h2>8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                    </section>

                    <section class="legal-section">
                        <h2>9. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
                        <p><strong>Email:</strong> privacy@merishikayat.in<br>
                        <strong>Address:</strong> [To be updated]</p>
                    </section>
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
