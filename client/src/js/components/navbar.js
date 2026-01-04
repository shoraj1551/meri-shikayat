/**
 * Shared Navigation Component
 * Provides consistent navigation across all pages
 */

/**
 * Generate navigation HTML
 * @param {Object} options - Configuration options
 * @param {boolean} options.showAuth - Show login/signup buttons (default: true)
 * @param {boolean} options.showLanguage - Show language toggle (default: false)
 * @returns {string} Navigation HTML
 */
export function generateNavbar(options = {}) {
    const { showAuth = true, showLanguage = false } = options;

    return `
        <header class="home-header">
            <div class="container">
                <nav class="home-navbar">
                    <div class="logo">
                        <a href="/" style="text-decoration: none; color: inherit;">
                            <h1 class="logo-gradient">मेरी शिकायत</h1>
                            <p class="tagline">Your Voice, Our Priority</p>
                        </a>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="nav-actions">
                        ${showLanguage ? `
                        <div class="language-toggle">
                            <button class="lang-btn active" data-lang="en">English</button>
                            <span class="lang-divider">|</span>
                            <button class="lang-btn" data-lang="hi">हिन्दी</button>
                        </div>
                        ` : ''}
                        ${showAuth ? `
                        <a href="/login" class="btn btn-outline-light">Login</a>
                        <a href="/register" class="btn btn-primary">Sign Up</a>
                        ` : ''}
                    </div>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </nav>
            </div>
        </header>

        <!-- Mobile Navigation Drawer -->
        <div class="mobile-nav-overlay"></div>
        <nav class="mobile-nav">
            <div class="mobile-nav-items">
                <a href="/" class="mobile-nav-link">🏠 Home</a>
                <a href="/about" class="mobile-nav-link">ℹ️ About</a>
                <a href="/how-it-works" class="mobile-nav-link">📖 How It Works</a>
                <a href="/faq" class="mobile-nav-link">❓ FAQ</a>
                <a href="/contact" class="mobile-nav-link">📞 Contact</a>
                <div class="mobile-nav-divider"></div>
                ${showAuth ? `
                <a href="/login" class="btn btn-outline-light">Login</a>
                <a href="/register" class="btn btn-primary">Sign Up</a>
                ` : ''}
            </div>
        </nav>
    `;
}

/**
 * Initialize navigation event listeners
 * Must be called after navbar is rendered to DOM
 */
export function initializeNavbar() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    if (mobileMenuToggle && mobileNav && mobileNavOverlay) {
        // Toggle menu on button click
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on overlay click
        mobileNavOverlay.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu on link click
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}
