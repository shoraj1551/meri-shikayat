/**
 * Home page component
 */

export function renderHomePage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="home-page">
            <header class="header">
                <div class="container">
                    <nav class="navbar">
                        <div class="logo">
                            <h1>मेरी शिकायत</h1>
                            <p class="tagline">Your Voice, Our Priority</p>
                        </div>
                        <div class="nav-links">
                            <a href="/login" class="nav-link">Login</a>
                            <a href="/register" class="btn btn-primary">Register</a>
                        </div>
                    </nav>
                </div>
            </header>

            <main class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h2 class="hero-title">Register Your Complaints</h2>
                        <p class="hero-subtitle">
                            Submit your complaints through multiple channels - Text, Audio, Video, or Images
                        </p>
                        <div class="hero-actions">
                            <a href="/register" class="btn btn-primary btn-lg">Get Started</a>
                            <button id="learnMoreBtn" class="btn btn-secondary btn-lg">Learn More</button>
                        </div>
                    </div>

                    <div class="features">
                        <div class="feature-card">
                            <div class="feature-icon">📝</div>
                            <h3>Text Complaints</h3>
                            <p>Write detailed descriptions of your issues</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎤</div>
                            <h3>Audio Recording</h3>
                            <p>Record your voice to explain the problem</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📹</div>
                            <h3>Video Upload</h3>
                            <p>Upload video evidence of your complaint</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📷</div>
                            <h3>Image Attachments</h3>
                            <p>Attach photos to support your case</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer class="footer">
                <div class="container">
                    <p>&copy; 2024 Meri Shikayat. All rights reserved.</p>
                </div>
            </footer>
        </div>
    `;

    // Add event listeners for navigation
    app.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href');
            window.router.navigate(path);
        });
    });

    // Scroll to features
    document.getElementById('learnMoreBtn')?.addEventListener('click', () => {
        document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    });
}
