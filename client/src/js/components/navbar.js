/**
 * Shared Navigation Component
 * Provides consistent navigation across all pages
 */
import { initializeMobileDrawer } from './mobile-drawer.js';

/**
 * Generate navigation HTML
 * @param {Object} options - Configuration options
 * @param {boolean} options.showAuth - Show login/signup buttons (default: true)
 * @returns {string} Navigation HTML
 */
export function generateNavbar(options = {}) {
    const { showAuth = true } = options;

    return `
        <header class="home-header">
            <div class="container">
                <nav class="home-navbar">
                    <div class="logo">
                        <a href="/" style="text-decoration: none; color: inherit;">
                            <h1 class="logo-gradient" lang="hi">मेरी शिकायत</h1>
                            <p class="tagline">Your Voice, Our Priority</p>
                        </a>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="nav-actions">
                        ${showAuth ? `
                        <a href="/login" class="btn btn-outline-light">Login</a>
                        <a href="/register" class="btn btn-primary">Sign Up</a>
                        ` : ''}
                    </div>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </nav>
            </div>
        </header>

        <!-- Mobile Navigation Drawer -->
        <div class="mobile-nav-overlay" aria-hidden="true"></div>
        <nav class="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" aria-hidden="true" tabindex="-1" inert>
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
export function initializeNavbar(lifecycle) {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    initializeMobileDrawer({ toggle: mobileMenuToggle, drawer: mobileNav, overlay: mobileNavOverlay, lifecycle });
}
