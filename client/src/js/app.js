/**
 * Main application initialization and routing
 */

import { router } from './router.js';
import { renderHomePage } from './pages/home.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderLocationSetupPage } from './pages/location-setup.js';
import { renderDashboardPage } from './pages/dashboard.js';

export function initializeApp() {
    console.log('Meri Shikayat application initialized');

    // Make router globally accessible
    window.router = router;

    // Register routes
    router.register('/', renderHomePage);
    router.register('/login', renderLoginPage);
    router.register('/register', renderRegisterPage);
    router.register('/location-setup', renderLocationSetupPage);
    router.register('/dashboard', renderDashboardPage);

    // Initialize router
    router.init();
}
