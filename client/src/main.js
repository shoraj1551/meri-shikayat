/**
 * Main entry point for Meri Shikayat client application
 */

import './styles/main.css';
import { initializeApp } from './js/app.js';
import { bottomNav } from './js/components/BottomNav.js';
import './js/utils/pwa.js'; // Initialize PWA features

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    bottomNav.render();
});
