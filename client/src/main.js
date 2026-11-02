/**
 * Main entry point for Meri Shikayat client application
 */

import './styles/tokens/design-tokens.css';
import './styles/main.css';
import { initializeApp } from './js/app.js';
import { bottomNav } from './js/components/BottomNav.js';
import './js/utils/pwa.js'; // Initialize PWA features
import { installAccessibilityEnhancements } from './js/components/accessibility.js';
import * as appFeedback from './js/components/feedback.js';

// Shared feedback API for page modules and legacy event handlers.
window.appFeedback = appFeedback;
document.documentElement.lang = 'en';
try {
    localStorage.removeItem('language');
} catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    installAccessibilityEnhancements();
    initializeApp();
    bottomNav.initialize(window.router);
});
