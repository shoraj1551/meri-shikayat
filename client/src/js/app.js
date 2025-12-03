/**
 * Main application initialization and routing
 */

import { router } from './router.js';
import { renderHomePage } from './pages/home.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderLocationSetupPage } from './pages/location-setup.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderSubmitComplaintPage } from './pages/submit-complaint.js';
import { renderAdminLoginPage } from './pages/admin-login.js';
import { renderAdminRegisterPage } from './pages/admin-register.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderAdminPendingPage } from './pages/admin-pending.js';
import { renderAdminPermissionsPage } from './pages/admin-permissions.js';
import { renderPermissionRequestsPage } from './pages/admin-permission-requests.js';
import { renderAdminComplaintsPage } from './pages/admin-complaints.js';
import { renderProfilePage } from './pages/profile.js';

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
    router.register('/submit-complaint', renderSubmitComplaintPage);
    router.register('/profile', renderProfilePage);

    // Admin Routes
    router.register('/admin/login', renderAdminLoginPage);
    router.register('/admin/register', renderAdminRegisterPage);
    router.register('/admin/dashboard', renderAdminDashboard);
    router.register('/admin/complaints', renderAdminComplaintsPage);
    router.register('/admin/pending', renderAdminPendingPage);
    router.register('/admin/my-permissions', renderAdminPermissionsPage);
    router.register('/admin/permission-requests', renderPermissionRequestsPage);

    // Initialize router
    router.init();
}
