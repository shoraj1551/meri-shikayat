/**
 * FAQ Page - Professional Redesign with Accordion
 * [U] UI/UX Engineer Implementation
 */

export function renderFAQPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page faq-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Frequently Asked Questions</h1>
                    <p class="page-subtitle">Quick answers to common questions</p>
                    
                    <!-- Search Bar -->
                    <div class="faq-search">
                        <input type="text" class="search-input" placeholder="Search FAQs..." id="faqSearch">
                        <button class="search-btn">🔍</button>
                    </div>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <!-- General Questions -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">❓</span>
                            General Questions
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>What is Meri Shikayat?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Meri Shikayat is a citizen complaint platform that connects you directly with local authorities to report and resolve civic issues like sanitation problems, road damage, water supply issues, electricity problems, and more. We act as a bridge between citizens and government departments.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Is Meri Shikayat free to use?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Yes! Meri Shikayat is <strong>completely free</strong> for all citizens. There are no hidden charges, subscription fees, or premium tiers. Our mission is to make civic engagement accessible to everyone.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Who can use this platform?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Any Indian citizen aged <strong>13 or above</strong> can register and submit complaints. You need a valid email address or phone number to create an account. Government officials can also register for admin access.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Which areas are covered?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>We currently cover major cities and towns across India. We're continuously expanding to new regions. Check your location during registration to see if your area is supported.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Account & Registration -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">👤</span>
                            Account & Registration
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Do I need to register to submit a complaint?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Yes, registration is required to submit complaints. This helps us:</p>
                                    <ul>
                                        <li>Verify the authenticity of complaints</li>
                                        <li>Keep you updated on progress</li>
                                        <li>Prevent spam and abuse</li>
                                        <li>Maintain accountability</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can I use email OR phone number?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Yes! You can register with either an email address or phone number - you don't need both. Choose whichever is more convenient for you.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>I forgot my password. What should I do?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Click <strong>"Forgot Password"</strong> on the login page. Enter your email/phone and we'll send you a reset link via OTP. Follow the instructions to create a new password.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can I have multiple accounts?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>No, each person should have only one account. Multiple accounts may be flagged and suspended to prevent abuse.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Submitting Complaints -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">📝</span>
                            Submitting Complaints
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>What types of complaints can I submit?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>You can report issues related to:</p>
                                    <ul>
                                        <li>🚮 Sanitation (garbage, cleanliness)</li>
                                        <li>🛣️ Roads (potholes, damage)</li>
                                        <li>💧 Water supply</li>
                                        <li>⚡ Electricity</li>
                                        <li>🚨 Public safety</li>
                                        <li>🏗️ Infrastructure</li>
                                        <li>📋 Other civic issues</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>How many complaints can I submit?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>There's no limit! You can submit as many legitimate complaints as needed. However, duplicate or spam complaints may be removed.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can I submit anonymous complaints?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>No, all complaints must be linked to a registered account for accountability and follow-up. However, your personal contact details (email/phone) are kept private and not shared publicly.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>What if my issue isn't in the category list?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Select <strong>"Other"</strong> and provide a detailed description. We review these regularly to add new categories based on common issues.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Complaint Status & Resolution -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">📊</span>
                            Complaint Status & Resolution
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>How long does it take to resolve a complaint?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Resolution time varies by issue type and severity:</p>
                                    <ul>
                                        <li><strong>Simple issues:</strong> 2-7 days</li>
                                        <li><strong>Moderate issues:</strong> 1-2 weeks</li>
                                        <li><strong>Complex issues:</strong> 2-4 weeks</li>
                                    </ul>
                                    <p>You'll receive updates at each stage of the process.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Who handles my complaint?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Your complaint is automatically routed to the appropriate local authority based on category and location. Our AI helps ensure it reaches the right department.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>What if my complaint isn't resolved?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>If there's no progress after a reasonable time, you can escalate by contacting our support team with your complaint ID. We'll follow up with the relevant authorities.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can I update my complaint after submission?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>You can add comments or additional media to provide more information, but cannot edit the original complaint. Contact support if critical information needs correction.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Privacy & Security -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">🔒</span>
                            Privacy & Security
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Is my personal information safe?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Yes! We use industry-standard encryption and security measures including:</p>
                                    <ul>
                                        <li>SSL/TLS encryption for data in transit</li>
                                        <li>AES-256 encryption for data at rest</li>
                                        <li>Regular security audits</li>
                                        <li>Multi-factor authentication</li>
                                    </ul>
                                    <p>See our <a href="/privacy">Privacy Policy</a> for complete details.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Who can see my complaints?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Your complaints are visible to relevant authorities and our moderation team. Personal details like email/phone are kept private and not displayed publicly.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can I delete my account?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Yes, you can request account deletion through your profile settings or by contacting support. Note that submitted complaints may be retained for record-keeping purposes as required by law.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Technical Issues -->
                    <section class="faq-category">
                        <h2 class="category-title">
                            <span class="category-icon">🔧</span>
                            Technical Issues
                        </h2>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Which browsers are supported?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>We support the latest versions of:</p>
                                    <ul>
                                        <li>Google Chrome</li>
                                        <li>Mozilla Firefox</li>
                                        <li>Safari</li>
                                        <li>Microsoft Edge</li>
                                    </ul>
                                    <p>Mobile browsers are also fully supported.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Is there a mobile app?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Not yet, but our website is fully mobile-responsive and works great on all devices. A dedicated mobile app is in development and coming soon!</p>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>My upload is failing. Why?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <p>Check that your file meets these requirements:</p>
                                    <ul>
                                        <li><strong>Images:</strong> JPG, PNG (max 5MB each)</li>
                                        <li><strong>Videos:</strong> MP4, MOV (max 50MB)</li>
                                        <li><strong>Audio:</strong> MP3, WAV (max 10MB)</li>
                                    </ul>
                                    <p>If issues persist, try a different browser or contact support.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Still Have Questions -->
                    <section class="support-cta">
                        <h2>Still Have Questions?</h2>
                        <p>Can't find your answer here? We're here to help!</p>
                        <div class="support-buttons">
                            <a href="/help" class="btn btn-primary">Visit Help Center</a>
                            <a href="/contact" class="btn btn-outline-primary">Contact Support</a>
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

    // Add FAQ accordion functionality
    const faqItems = app.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Add search functionality
    const searchInput = app.querySelector('#faqSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            faqItems.forEach(item => {
                const question = item.querySelector('h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

                if (question.includes(searchTerm) || answer.includes(searchTerm) || searchTerm === '') {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}
