/**
 * Features Page
 */

export function renderFeaturesPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="platform-page">
            <header class="platform-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="animate-fade-up">Powerful Tools for Active Citizens</h1>
                    <p class="subtitle animate-fade-up delay-100">Everything you need to report, track, and resolve civic issues.</p>
                </div>
            </header>
            
            <main class="platform-content">
                <div class="container">
                    <!-- Bento Grid Layout -->
                    <div class="bento-grid">
                        <!-- Feature 1: Multi-Channel -->
                        <div class="bento-card large animate-fade-up">
                            <div class="card-content">
                                <div class="feature-icon">📱</div>
                                <h3>Multi-Channel Reporting</h3>
                                <p>Report issues your way. Whether it's a quick text, a photo of a pothole, a video of a leak, or an audio note describing the problem - we support it all.</p>
                                <div class="media-icons">
                                    <span>📷 Image</span>
                                    <span>🎥 Video</span>
                                    <span>🎤 Audio</span>
                                    <span>📝 Text</span>
                                </div>
                            </div>
                        </div>

                        <!-- Feature 2: Real-time Tracking -->
                        <div class="bento-card animate-fade-up delay-100">
                            <div class="card-content">
                                <div class="feature-icon">⚡</div>
                                <h3>Real-time Tracking</h3>
                                <p>Never wonder about the status of your complaint. Get instant updates at every stage of the resolution process.</p>
                            </div>
                        </div>

                        <!-- Feature 3: Geo-Tagging -->
                        <div class="bento-card animate-fade-up delay-200">
                            <div class="card-content">
                                <div class="feature-icon">📍</div>
                                <h3>Smart Geo-Tagging</h3>
                                <p>Pinpoint the exact location of the issue using GPS or manual map selection for accurate resolution.</p>
                            </div>
                        </div>

                        <!-- Feature 4: AI Categorization -->
                        <div class="bento-card animate-fade-up">
                            <div class="card-content">
                                <div class="feature-icon">🧠</div>
                                <h3>AI Categorization</h3>
                                <p>Our intelligent system automatically categorizes your complaint to ensure it reaches the right department instantly.</p>
                            </div>
                        </div>

                        <!-- Feature 5: Privacy -->
                        <div class="bento-card large animate-fade-up delay-100">
                            <div class="card-content">
                                <div class="feature-icon">🛡️</div>
                                <h3>Secure & Private</h3>
                                <p>Your data is encrypted and secure. We protect your personal information while ensuring your voice is heard by the authorities. You can control what information is shared publicly.</p>
                            </div>
                        </div>
                        
                        <!-- Feature 6: Analytics -->
                        <div class="bento-card animate-fade-up delay-200">
                            <div class="card-content">
                                <div class="feature-icon">📊</div>
                                <h3>Community Analytics</h3>
                                <p>See what's happening in your area. View trends, common issues, and resolution rates in your neighborhood.</p>
                            </div>
                        </div>
                    </div>

                    <!-- CTA Section -->
                    <section class="platform-cta animate-fade-up">
                        <h2>Experience the power of Meri Shikayat</h2>
                        <p>Start using these features today to improve your city.</p>
                        <a href="/register" class="btn btn-primary btn-lg">Get Started</a>
                    </section>
                </div>
            </main>
        </div>
    `;

    // Add event listener for back link
    app.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/');
    });

    // Add event listener for register button
    app.querySelector('.btn-primary').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/register');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}
