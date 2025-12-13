/**
 * Terms of Service Page
 */

export function renderTermsPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Terms of Service</h1>
                    <p class="last-updated">Last Updated: December 4, 2025</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <section class="legal-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using Meri Shikayat ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section class="legal-section">
                        <h2>2. User Eligibility</h2>
                        <p>You must be at least 13 years old to use this Platform. By using our services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
                    </section>

                    <section class="legal-section">
                        <h2>3. User Account</h2>
                        <p>To submit complaints, you must create an account. You are responsible for:</p>
                        <ul>
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized access</li>
                            <li>Providing accurate and up-to-date information</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>4. Complaint Submission Rules</h2>
                        <p>When submitting complaints, you agree to:</p>
                        <ul>
                            <li>Provide truthful and accurate information</li>
                            <li>Submit complaints only for legitimate grievances</li>
                            <li>Include relevant evidence and documentation</li>
                            <li>Not submit duplicate or spam complaints</li>
                            <li>Respect the privacy of others</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>5. Prohibited Activities</h2>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Submit false, misleading, or fraudulent complaints</li>
                            <li>Harass, threaten, or defame individuals or organizations</li>
                            <li>Upload malicious content or viruses</li>
                            <li>Attempt to gain unauthorized access to the Platform</li>
                            <li>Use the Platform for any illegal purposes</li>
                            <li>Impersonate others or misrepresent your identity</li>
                            <li>Interfere with the proper functioning of the Platform</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>6. Content Ownership and License</h2>
                        <p>You retain ownership of the content you submit. However, by submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and share your content for the purpose of processing your complaints and improving our services.</p>
                    </section>

                    <section class="legal-section">
                        <h2>7. Platform Availability</h2>
                        <p>We strive to maintain continuous availability but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without prior notice.</p>
                    </section>

                    <section class="legal-section">
                        <h2>8. Disclaimer of Warranties</h2>
                        <p>The Platform is provided "as is" without warranties of any kind. We do not guarantee:</p>
                        <ul>
                            <li>Resolution of all submitted complaints</li>
                            <li>Specific response times from authorities</li>
                            <li>Accuracy of third-party information</li>
                            <li>Uninterrupted or error-free service</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>9. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law, Meri Shikayat shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.</p>
                    </section>

                    <section class="legal-section">
                        <h2>10. Account Termination</h2>
                        <p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in activities that harm the Platform or other users. You may also request account deletion at any time.</p>
                    </section>

                    <section class="legal-section">
                        <h2>11. Changes to Terms</h2>
                        <p>We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms. We will notify users of significant changes.</p>
                    </section>

                    <section class="legal-section">
                        <h2>12. Governing Law</h2>
                        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [Location to be updated].</p>
                    </section>

                    <section class="legal-section">
                        <h2>13. Contact Information</h2>
                        <p>For questions about these Terms, please contact us at:</p>
                        <p><strong>Email:</strong> legal@merishikayat.in<br>
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
