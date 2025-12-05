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
import { renderComplaintQuickPage } from './pages/complaint-quick.js';
import { renderRegistrationGatewayPage } from './pages/registration-gateway.js';
import { renderComplaintForm } from './pages/complaint-form.js';
import { renderPrivacyPage } from './pages/privacy.js';
import { renderTermsPage } from './pages/terms.js';
import { renderGuidelinesPage } from './pages/guidelines.js';
import { renderHelpPage } from './pages/help.js';
import { renderFAQPage } from './pages/faq.js';
import { renderContactPage } from './pages/contact.js';
import { renderHowItWorksPage } from './pages/how-it-works.js';
import { renderFeaturesPage } from './pages/features.js';
import { renderForgotPasswordPage } from './pages/forgot-password.js';
import { renderForgotPasswordVerifyPage } from './pages/forgot-password-verify.js';
import { renderForgotPasswordResetPage } from './pages/forgot-password-reset.js';

export function initializeApp() {
    console.log('Meri Shikayat application initialized');

    // Make router globally accessible
    window.router = router;

    // Register routes
    router.register('/', renderHomePage);
    router.register('/login', renderLoginPage);
    router.register('/forgot-password', renderForgotPasswordPage);
    router.register('/forgot-password-verify', renderForgotPasswordVerifyPage);
    router.register('/forgot-password-reset', renderForgotPasswordResetPage);
    router.register('/register', renderRegisterPage);
    router.register('/location-setup', renderLocationSetupPage);
    router.register('/dashboard', renderDashboardPage);
    router.register('/submit-complaint', renderSubmitComplaintPage);
    router.register('/profile', renderProfilePage);
    router.register('/file-complaint', renderComplaintForm);
    router.register('/register-gateway', renderRegistrationGatewayPage);

    // Admin Routes
    router.register('/admin/login', renderAdminLoginPage);
    router.register('/admin/register', renderAdminRegisterPage);
    router.register('/admin/dashboard', renderAdminDashboard);
    router.register('/admin/complaints', renderAdminComplaintsPage);
    router.register('/admin/pending', renderAdminPendingPage);
    router.register('/admin/my-permissions', renderAdminPermissionsPage);
    router.register('/admin/permission-requests', renderPermissionRequestsPage);

    // Legal Pages
    router.register('/privacy', renderPrivacyPage);
    router.register('/terms', renderTermsPage);
    router.register('/guidelines', renderGuidelinesPage);

    // Support Pages
    router.register('/help', renderHelpPage);
    router.register('/faq', renderFAQPage);
    router.register('/contact', renderContactPage);

    // Platform Pages
    router.register('/how-it-works', renderHowItWorksPage);
    router.register('/features', renderFeaturesPage);

    // Initialize router
    router.init();
}
