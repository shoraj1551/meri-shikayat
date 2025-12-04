/**
 * Contact Us Page
 */

export function renderContactPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Contact Us</h1>
                    <p class="last-updated">We're here to help</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <section class="legal-section">
                        <h2>Get in Touch</h2>
                        <p>Have questions, feedback, or need assistance? We're here to help! Choose the best way to reach us:</p>
                    </section>

                    <section class="legal-section">
                        <h2>📧 Email Support</h2>
                        <p><strong>General Inquiries:</strong> <a href="mailto:support@merishikayat.in">support@merishikayat.in</a></p>
                        <p><strong>Technical Issues:</strong> <a href="mailto:tech@merishikayat.in">tech@merishikayat.in</a></p>
                        <p><strong>Partnership Opportunities:</strong> <a href="mailto:partnerships@merishikayat.in">partnerships@merishikayat.in</a></p>
                        <p><strong>Media Inquiries:</strong> <a href="mailto:media@merishikayat.in">media@merishikayat.in</a></p>
                        
                        <p><em>Response time: 24-48 hours on business days</em></p>
                    </section>

                    <section class="legal-section">
                        <h2>📞 Phone Support</h2>
                        <p><strong>Helpline:</strong> [To be updated]</p>
                        <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                        <p><em>Note: For complaint-specific queries, please include your Complaint ID</em></p>
                    </section>

                    <section class="legal-section">
                        <h2>🏢 Office Address</h2>
                        <p>
                            <strong>Meri Shikayat</strong><br>
                            [Address Line 1]<br>
                            [Address Line 2]<br>
                            [City, State - PIN]<br>
                            India
                        </p>
                        <p><em>Office visits by appointment only</em></p>
                    </section>

                    <section class="legal-section">
                        <h2>💬 Live Chat</h2>
                        <p>For immediate assistance, use our live chat feature:</p>
                        <p><strong>Available:</strong> Monday - Friday, 10:00 AM - 5:00 PM IST</p>
                        <p><em>Look for the chat icon in the bottom-right corner of your screen</em></p>
                    </section>

                    <section class="legal-section">
                        <h2>📱 Social Media</h2>
                        <p>Connect with us on social media for updates and quick responses:</p>
                        <ul>
                            <li><strong>Facebook:</strong> <a href="https://facebook.com/placeholder" target="_blank">@MeriShikayat</a></li>
                            <li><strong>Instagram:</strong> <a href="https://instagram.com/placeholder" target="_blank">@MeriShikayat</a></li>
                            <li><strong>YouTube:</strong> <a href="https://youtube.com/placeholder" target="_blank">Meri Shikayat</a></li>
                            <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/company/placeholder" target="_blank">Meri Shikayat</a></li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>🐛 Report a Bug</h2>
                        <p>Found a technical issue? Help us improve!</p>
                        <p>Email: <a href="mailto:bugs@merishikayat.in">bugs@merishikayat.in</a></p>
                        <p>Please include:</p>
                        <ul>
                            <li>Description of the issue</li>
                            <li>Steps to reproduce</li>
                            <li>Browser and device information</li>
                            <li>Screenshots if applicable</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>💡 Feedback & Suggestions</h2>
                        <p>We value your input! Share your ideas to help us improve:</p>
                        <p>Email: <a href="mailto:feedback@merishikayat.in">feedback@merishikayat.in</a></p>
                        <p>Your feedback helps us build a better platform for everyone.</p>
                    </section>

                    <section class="legal-section">
                        <h2>⚠️ Report Abuse</h2>
                        <p>Encountered inappropriate content or behavior?</p>
                        <p>Email: <a href="mailto:abuse@merishikayat.in">abuse@merishikayat.in</a></p>
                        <p>Include the complaint ID or user details for faster action.</p>
                    </section>

                    <section class="legal-section">
                        <h2>📚 Resources</h2>
                        <p>Before reaching out, you might find answers in:</p>
                        <ul>
                            <li><a href="/help">Help Center</a> - Comprehensive guides and tutorials</li>
                            <li><a href="/faq">FAQ</a> - Answers to common questions</li>
                            <li><a href="/guidelines">Community Guidelines</a> - Platform usage rules</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>🕐 Response Times</h2>
                        <p><strong>Email:</strong> 24-48 hours (business days)</p>
                        <p><strong>Phone:</strong> Immediate during business hours</p>
                        <p><strong>Live Chat:</strong> Real-time during availability</p>
                        <p><strong>Social Media:</strong> 2-4 hours during business hours</p>
                        
                        <p><em>We strive to respond as quickly as possible. Thank you for your patience!</em></p>
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
