/**
 * Help Center Page - Professional Redesign
 * [U] UI/UX Engineer Implementation
 */

export function renderHelpPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="help-center-page">
            <header class="help-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="page-title">Help Center</h1>
                    <p class="page-subtitle">Everything you need to know about using Meri Shikayat</p>
                    
                    <!-- Search Bar -->
                    <div class="help-search">
                        <input type="text" class="search-input" placeholder="Search for help..." id="helpSearch">
                        <button class="search-btn">🔍</button>
                    </div>
                </div>
            </header>
            
            <main class="help-content">
                <div class="container">
                    <!-- Quick Links -->
                    <section class="quick-links-section">
                        <h2 class="section-title">Popular Topics</h2>
                        <div class="quick-links-grid">
                            <a href="#getting-started" class="quick-link-card">
                                <div class="quick-link-icon">🚀</div>
                                <h3>Getting Started</h3>
                                <p>Learn the basics</p>
                            </a>
                            <a href="#submit-complaint" class="quick-link-card">
                                <div class="quick-link-icon">📝</div>
                                <h3>Submit Complaint</h3>
                                <p>Step-by-step guide</p>
                            </a>
                            <a href="#track-status" class="quick-link-card">
                                <div class="quick-link-icon">📊</div>
                                <h3>Track Status</h3>
                                <p>Monitor progress</p>
                            </a>
                            <a href="#account" class="quick-link-card">
                                <div class="quick-link-icon">👤</div>
                                <h3>Account</h3>
                                <p>Manage profile</p>
                            </a>
                        </div>
                    </section>

                    <!-- Getting Started -->
                    <section class="help-section" id="getting-started">
                        <div class="section-header">
                            <div class="section-icon">🚀</div>
                            <h2>Getting Started</h2>
                        </div>
                        
                        <div class="help-card">
                            <h3>How to Register</h3>
                            <p>Follow these simple steps to create your account:</p>
                            <ol class="help-steps">
                                <li>
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Click "Register"</strong>
                                        <p>Find the Register button in the top navigation</p>
                                    </div>
                                </li>
                                <li>
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>Fill Your Details</strong>
                                        <p>Enter name, email/phone, and age</p>
                                    </div>
                                </li>
                                <li>
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Set Location</strong>
                                        <p>Use pincode, GPS, or manual selection</p>
                                    </div>
                                </li>
                                <li>
                                    <span class="step-number">4</span>
                                    <div class="step-content">
                                        <strong>Verify Account</strong>
                                        <p>Enter the OTP sent to your email/phone</p>
                                    </div>
                                </li>
                                <li>
                                    <span class="step-number">5</span>
                                    <div class="step-content">
                                        <strong>Start Using!</strong>
                                        <p>You're all set to submit complaints</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </section>

                    <!-- Submit Complaint -->
                    <section class="help-section" id="submit-complaint">
                        <div class="section-header">
                            <div class="section-icon">📝</div>
                            <h2>Submitting a Complaint</h2>
                        </div>
                        
                        <div class="help-card">
                            <h3>Step-by-Step Guide</h3>
                            <div class="process-grid">
                                <div class="process-step">
                                    <div class="process-icon">1️⃣</div>
                                    <h4>Choose Category</h4>
                                    <p>Select issue type: Sanitation, Roads, Water, Electricity, etc.</p>
                                </div>
                                <div class="process-step">
                                    <div class="process-icon">2️⃣</div>
                                    <h4>Add Location</h4>
                                    <p>Use GPS, enter pincode, or select on map</p>
                                </div>
                                <div class="process-step">
                                    <div class="process-icon">3️⃣</div>
                                    <h4>Describe Issue</h4>
                                    <p>Provide clear details (up to 500 characters)</p>
                                </div>
                                <div class="process-step">
                                    <div class="process-icon">4️⃣</div>
                                    <h4>Attach Evidence</h4>
                                    <p>Add photos, videos, or audio recordings</p>
                                </div>
                                <div class="process-step">
                                    <div class="process-icon">5️⃣</div>
                                    <h4>Review & Submit</h4>
                                    <p>Double-check and submit your complaint</p>
                                </div>
                            </div>
                        </div>

                        <div class="help-card tips-card">
                            <h3>💡 Tips for Effective Complaints</h3>
                            <ul class="tips-list">
                                <li>✅ Be specific and factual</li>
                                <li>✅ Include clear photos showing the issue</li>
                                <li>✅ Provide exact location details</li>
                                <li>✅ Mention any safety concerns</li>
                                <li>✅ Avoid emotional or offensive language</li>
                            </ul>
                        </div>
                    </section>

                    <!-- Track Status -->
                    <section class="help-section" id="track-status">
                        <div class="section-header">
                            <div class="section-icon">📊</div>
                            <h2>Tracking Your Complaints</h2>
                        </div>
                        
                        <div class="help-card">
                            <h3>Complaint Status Explained</h3>
                            <div class="status-grid">
                                <div class="status-card new">
                                    <div class="status-badge">New</div>
                                    <p>Just submitted, awaiting review by authorities</p>
                                </div>
                                <div class="status-card progress">
                                    <div class="status-badge">In Progress</div>
                                    <p>Being actively addressed by the department</p>
                                </div>
                                <div class="status-card resolved">
                                    <div class="status-badge">Resolved</div>
                                    <p>Issue has been successfully fixed</p>
                                </div>
                                <div class="status-card closed">
                                    <div class="status-badge">Closed</div>
                                    <p>No action required or out of scope</p>
                                </div>
                            </div>
                            <p class="notification-note">📱 You'll receive email/SMS notifications for all status updates</p>
                        </div>
                    </section>

                    <!-- Account Management -->
                    <section class="help-section" id="account">
                        <div class="section-header">
                            <div class="section-icon">👤</div>
                            <h2>Account Management</h2>
                        </div>
                        
                        <div class="help-grid">
                            <div class="help-card">
                                <h3>Updating Your Profile</h3>
                                <p>Navigate to <strong>Profile → Edit</strong> to update:</p>
                                <ul>
                                    <li>Personal information</li>
                                    <li>Contact details</li>
                                    <li>Location preferences</li>
                                    <li>Notification settings</li>
                                </ul>
                            </div>
                            
                            <div class="help-card">
                                <h3>Changing Password</h3>
                                <p>Go to <strong>Profile → Security → Change Password</strong></p>
                                <p>You'll need your current password to set a new one.</p>
                                <p class="security-tip">🔒 Use a strong password with letters, numbers, and symbols</p>
                            </div>
                        </div>
                    </section>

                    <!-- Media Guidelines -->
                    <section class="help-section">
                        <div class="section-header">
                            <div class="section-icon">📸</div>
                            <h2>Media Guidelines</h2>
                        </div>
                        
                        <div class="help-card">
                            <h3>Supported Formats & Sizes</h3>
                            <div class="media-grid">
                                <div class="media-card">
                                    <div class="media-icon">🖼️</div>
                                    <h4>Images</h4>
                                    <p>JPG, PNG</p>
                                    <span class="size-limit">Max 5MB each</span>
                                </div>
                                <div class="media-card">
                                    <div class="media-icon">🎥</div>
                                    <h4>Videos</h4>
                                    <p>MP4, MOV</p>
                                    <span class="size-limit">Max 50MB</span>
                                </div>
                                <div class="media-card">
                                    <div class="media-icon">🎵</div>
                                    <h4>Audio</h4>
                                    <p>MP3, WAV</p>
                                    <span class="size-limit">Max 10MB</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Troubleshooting -->
                    <section class="help-section">
                        <div class="section-header">
                            <div class="section-icon">🔧</div>
                            <h2>Troubleshooting</h2>
                        </div>
                        
                        <div class="faq-accordion">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Can't Submit Complaint?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <ul>
                                        <li>Check your internet connection</li>
                                        <li>Ensure all required fields are filled</li>
                                        <li>Verify media file sizes are within limits</li>
                                        <li>Try refreshing the page</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="faq-item">
                                <div class="faq-question">
                                    <h4>Not Receiving Notifications?</h4>
                                    <span class="faq-toggle">+</span>
                                </div>
                                <div class="faq-answer">
                                    <ul>
                                        <li>Check your spam/junk folder</li>
                                        <li>Verify email/phone in your profile</li>
                                        <li>Enable notifications in settings</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Contact Support -->
                    <section class="support-cta">
                        <h2>Still Need Help?</h2>
                        <p>Our support team is here to assist you</p>
                        <div class="support-buttons">
                            <a href="/contact" class="btn btn-primary">Contact Support</a>
                            <a href="/faq" class="btn btn-outline-primary">View FAQ</a>
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
            item.classList.toggle('active');
        });
    });

    // Add search functionality
    const searchInput = app.querySelector('#helpSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const sections = app.querySelectorAll('.help-section');

            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm) || searchTerm === '') {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    }
}
