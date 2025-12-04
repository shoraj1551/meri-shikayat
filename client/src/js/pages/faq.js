/**
 * FAQ Page
 */

export function renderFAQPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Frequently Asked Questions</h1>
                    <p class="last-updated">Quick answers to common questions</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <h2 class="faq-category-title">General Questions</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>What is Meri Shikayat?</h3>
                            <p>Meri Shikayat is a citizen complaint platform that connects you directly with local authorities to report and resolve civic issues like sanitation problems, road damage, water supply issues, and more.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Is Meri Shikayat free to use?</h3>
                            <p>Yes! Meri Shikayat is completely free for all citizens. There are no hidden charges or subscription fees.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Who can use this platform?</h3>
                            <p>Any Indian citizen aged 13 or above can register and submit complaints. You need a valid email address or phone number to create an account.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Which areas are covered?</h3>
                            <p>We currently cover [areas to be updated]. We're continuously expanding to new regions.</p>
                        </div>
                    </div>

                    <h2 class="faq-category-title">Account & Registration</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>Do I need to register to submit a complaint?</h3>
                            <p>Yes, registration is required to submit complaints. This helps us verify complaints and keep you updated on progress.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Can I use email OR phone number?</h3>
                            <p>Yes! You can register with either an email address or phone number - you don't need both.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>I forgot my password. What should I do?</h3>
                            <p>Click "Forgot Password" on the login page. Enter your email/phone and we'll send you a reset link via OTP.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Can I have multiple accounts?</h3>
                            <p>No, each person should have only one account. Multiple accounts may be flagged and suspended.</p>
                        </div>
                    </div>

                    <h2 class="faq-category-title">Submitting Complaints</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>What types of complaints can I submit?</h3>
                            <p>You can report issues related to: Sanitation, Roads, Water supply, Electricity, Public safety, and other civic issues.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>How many complaints can I submit?</h3>
                            <p>There's no limit! You can submit as many legitimate complaints as needed. However, duplicate or spam complaints may be removed.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Can I submit anonymous complaints?</h3>
                            <p>No, all complaints must be linked to a registered account for accountability and follow-up.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>What if my issue isn't in the category list?</h3>
                            <p>Select "Other" and provide detailed description. We review these regularly to add new categories.</p>
                        </div>
                    </div>

                    <h2 class="faq-category-title">Complaint Status & Resolution</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>How long does it take to resolve a complaint?</h3>
                            <p>Resolution time varies by issue type and severity. Simple issues may be resolved in 2-7 days, while complex ones may take 2-4 weeks.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Who handles my complaint?</h3>
                            <p>Your complaint is automatically routed to the appropriate local authority based on category and location.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>What if my complaint isn't resolved?</h3>
                            <p>If there's no progress after a reasonable time, you can escalate by contacting our support team with your complaint ID.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Can I update my complaint after submission?</h3>
                            <p>You can add comments or additional media, but cannot edit the original complaint. Contact support if critical information needs correction.</p>
                        </div>
                    </div>

                    <h2 class="faq-category-title">Privacy & Security</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>Is my personal information safe?</h3>
                            <p>Yes! We use industry-standard encryption and security measures. See our <a href="/privacy">Privacy Policy</a> for details.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Who can see my complaints?</h3>
                            <p>Your complaints are visible to relevant authorities and our moderation team. Personal details like email/phone are kept private.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Can I delete my account?</h3>
                            <p>Yes, contact support to request account deletion. Note that submitted complaints may be retained for record-keeping.</p>
                        </div>
                    </div>

                    <h2 class="faq-category-title">Technical Issues</h2>
                    <div class="faq-grid">
                        <div class="faq-card">
                            <h3>Which browsers are supported?</h3>
                            <p>We support Chrome, Firefox, Safari, and Edge (latest versions). Mobile browsers are also supported.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>Is there a mobile app?</h3>
                            <p>Not yet, but our website is fully mobile-responsive. A mobile app is in development.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>My upload is failing. Why?</h3>
                            <p>Check that your file size is within limits (Images: 5MB, Videos: 50MB, Audio: 10MB) and format is supported.</p>
                        </div>
                    </div>

                    <section class="legal-section">
                        <h2>Still Have Questions?</h2>
                        <p>Can't find your answer here?</p>
                        <ul>
                            <li>Visit our <a href="/help">Help Center</a></li>
                            <li>Contact us at <a href="/contact">Contact Us</a></li>
                            <li>Email: support@merishikayat.in</li>
                        </ul>
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
