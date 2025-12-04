/**
 * Help Center Page
 */

export function renderHelpPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page">
            <header class="legal-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1>Help Center</h1>
                    <p class="last-updated">Your guide to using Meri Shikayat</p>
                </div>
            </header>
            
            <main class="legal-content">
                <div class="container">
                    <section class="legal-section">
                        <h2>Getting Started</h2>
                        <h3>How to Register</h3>
                        <p>To start using Meri Shikayat:</p>
                        <ol>
                            <li>Click on "Register" in the top navigation</li>
                            <li>Fill in your details (name, email/phone, age)</li>
                            <li>Set up your location (pincode, GPS, or manual)</li>
                            <li>Verify your account via OTP</li>
                            <li>Start submitting complaints!</li>
                        </ol>
                    </section>

                    <section class="legal-section">
                        <h2>Submitting a Complaint</h2>
                        <h3>Step-by-Step Guide</h3>
                        <p><strong>1. Choose Category:</strong> Select the type of issue (Sanitation, Roads, Water, etc.)</p>
                        <p><strong>2. Add Location:</strong> Use GPS, enter pincode, or manually select location on map</p>
                        <p><strong>3. Describe the Issue:</strong> Provide clear details (up to 500 characters)</p>
                        <p><strong>4. Attach Evidence:</strong> Add photos, videos, or audio recordings</p>
                        <p><strong>5. Submit:</strong> Review and submit your complaint</p>
                        
                        <h3>Tips for Effective Complaints</h3>
                        <ul>
                            <li>Be specific and factual</li>
                            <li>Include clear photos showing the issue</li>
                            <li>Provide exact location details</li>
                            <li>Mention any safety concerns</li>
                            <li>Avoid emotional or offensive language</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>Tracking Your Complaints</h2>
                        <p>Once submitted, you can track your complaint status:</p>
                        <ul>
                            <li><strong>New:</strong> Just submitted, awaiting review</li>
                            <li><strong>In Progress:</strong> Being addressed by authorities</li>
                            <li><strong>Resolved:</strong> Issue has been fixed</li>
                            <li><strong>Closed:</strong> No action required or out of scope</li>
                        </ul>
                        <p>You'll receive email/SMS notifications for status updates.</p>
                    </section>

                    <section class="legal-section">
                        <h2>Account Management</h2>
                        <h3>Updating Your Profile</h3>
                        <p>Go to Profile → Edit to update:</p>
                        <ul>
                            <li>Personal information</li>
                            <li>Contact details</li>
                            <li>Location preferences</li>
                            <li>Notification settings</li>
                        </ul>
                        
                        <h3>Changing Password</h3>
                        <p>Navigate to Profile → Security → Change Password. You'll need your current password to set a new one.</p>
                    </section>

                    <section class="legal-section">
                        <h2>Media Guidelines</h2>
                        <h3>Supported Formats</h3>
                        <ul>
                            <li><strong>Images:</strong> JPG, PNG (max 5MB each)</li>
                            <li><strong>Videos:</strong> MP4, MOV (max 50MB)</li>
                            <li><strong>Audio:</strong> MP3, WAV (max 10MB)</li>
                        </ul>
                        
                        <h3>Best Practices</h3>
                        <ul>
                            <li>Take photos in good lighting</li>
                            <li>Show the full context of the issue</li>
                            <li>Include landmarks for location reference</li>
                            <li>Keep videos under 2 minutes</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>Troubleshooting</h2>
                        <h3>Can't Submit Complaint?</h3>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Ensure all required fields are filled</li>
                            <li>Verify media file sizes are within limits</li>
                            <li>Try refreshing the page</li>
                        </ul>
                        
                        <h3>Not Receiving Notifications?</h3>
                        <ul>
                            <li>Check your spam/junk folder</li>
                            <li>Verify email/phone in your profile</li>
                            <li>Enable notifications in settings</li>
                        </ul>
                    </section>

                    <section class="legal-section">
                        <h2>Need More Help?</h2>
                        <p>If you can't find what you're looking for:</p>
                        <ul>
                            <li>Check our <a href="/faq">FAQ page</a></li>
                            <li>Visit <a href="/contact">Contact Us</a> to reach support</li>
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
