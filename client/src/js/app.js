/**
 * Main application initialization and routing
 */

import { router } from './router.js';
import { applyRouteStyles } from './route-styles.js';

export function lazyPage(loadModule, exportName) {
    let modulePromise;
    return async (...args) => {
        modulePromise ||= loadModule().catch(error => {
            modulePromise = null;
            throw error;
        });
        const module = await modulePromise;
        const render = module[exportName];
        if (typeof render !== 'function') throw new Error(`Route module does not export ${exportName}`);
        return render(...args);
    };
}

const pages = {
    home: lazyPage(() => import('./pages/home.js'), 'renderHomePage'),
    login: lazyPage(() => import('./pages/login.js'), 'renderLoginPage'),
    locationSetup: lazyPage(() => import('./pages/location-setup.js'), 'renderLocationSetupPage'),
    dashboard: lazyPage(() => import('./pages/dashboard.js'), 'renderDashboardPage'),
    adminLogin: lazyPage(() => import('./pages/admin-login.js'), 'renderAdminLoginPage'),
    adminRegister: lazyPage(() => import('./pages/admin-register.js'), 'renderAdminRegisterPage'),
    adminDashboard: lazyPage(() => import('./pages/admin-dashboard.js'), 'renderAdminDashboard'),
    adminPending: lazyPage(() => import('./pages/admin-pending.js'), 'renderAdminPendingPage'),
    adminPermissions: lazyPage(() => import('./pages/admin-permissions.js'), 'renderAdminPermissionsPage'),
    permissionRequests: lazyPage(() => import('./pages/admin-permission-requests.js'), 'renderPermissionRequestsPage'),
    adminComplaints: lazyPage(() => import('./pages/admin-complaints.js'), 'renderAdminComplaintsPage'),
    profile: lazyPage(() => import('./pages/profile.js'), 'renderProfilePage'),
    privacy: lazyPage(() => import('./pages/privacy.js'), 'renderPrivacyPage'),
    terms: lazyPage(() => import('./pages/terms.js'), 'renderTermsPage'),
    guidelines: lazyPage(() => import('./pages/guidelines.js'), 'renderGuidelinesPage'),
    help: lazyPage(() => import('./pages/help.js'), 'renderHelpPage'),
    faq: lazyPage(() => import('./pages/faq.js'), 'renderFAQPage'),
    contact: lazyPage(() => import('./pages/contact.js'), 'renderContactPage'),
    howItWorks: lazyPage(() => import('./pages/how-it-works.js'), 'renderHowItWorksPage'),
    features: lazyPage(() => import('./pages/features.js'), 'renderFeaturesPage'),
    forgotPassword: lazyPage(() => import('./pages/forgot-password.js'), 'renderForgotPasswordPage'),
    forgotPasswordVerify: lazyPage(() => import('./pages/forgot-password-verify.js'), 'renderForgotPasswordVerifyPage'),
    forgotPasswordReset: lazyPage(() => import('./pages/forgot-password-reset.js'), 'renderForgotPasswordResetPage'),
    successStories: lazyPage(() => import('./pages/success-stories.js'), 'renderSuccessStoriesPage'),
    community: lazyPage(() => import('./pages/community-hub.js'), 'renderCommunityPage'),
    messages: lazyPage(() => import('./pages/messages.js'), 'renderMessagesPage'),
    stories: lazyPage(() => import('./pages/stories-feed.js'), 'renderStoriesPage'),
    followUs: lazyPage(() => import('./pages/follow-us.js'), 'renderFollowUsPage'),
    disclaimer: lazyPage(() => import('./pages/disclaimer.js'), 'renderDisclaimerPage'),
    about: lazyPage(() => import('./pages/about.js'), 'renderAboutPage'),
    authorities: lazyPage(() => import('./pages/authorities.js'), 'renderAuthoritiesPage'),
    authorityDetail: lazyPage(() => import('./pages/authority-detail.js'), 'renderAuthorityDetailPage'),
    contractors: lazyPage(() => import('./pages/contractors.js'), 'renderContractorsPage'),
    register: lazyPage(() => import('./pages/multi-role-register.js'), 'renderMultiRoleRegisterPage'),
    verifyAccount: lazyPage(() => import('./pages/verify-account.js'), 'renderVerifyAccountPage'),
    submitComplaint: lazyPage(() => import('./pages/file-complaint-new.js'), 'renderFileComplaintNew'),
    contractorDashboard: lazyPage(() => import('./pages/contractor-dashboard.js'), 'renderContractorDashboard')
};

export function initializeApp() {
    console.log('Meri Shikayat application initialized');

    // Make router globally accessible
    window.router = router;
    router.styleApplicator = applyRouteStyles;

    const readUserType = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null')?.userType;
        } catch {
            return null;
        }
    };
    const citizenRoutes = new Set(['/dashboard', '/profile', '/submit-complaint', '/file-complaint', '/register-gateway', '/verify-account', '/community', '/messages', '/stories']);
    const protectedAdminRoutes = new Set(['/admin/dashboard', '/admin/complaints', '/admin/pending', '/admin/my-permissions', '/admin/permission-requests']);

    router.addGuard(({ path, url }) => {
        if (protectedAdminRoutes.has(path) && !localStorage.getItem('adminToken')) {
            return `/admin/login?redirect=${encodeURIComponent(url)}`;
        }

        if (path === '/contractor/dashboard') {
            return localStorage.getItem('token') && readUserType() === 'contractor'
                ? true
                : `/login?redirect=${encodeURIComponent(url)}`;
        }

        if (citizenRoutes.has(path)) {
            if (localStorage.getItem('adminToken')) return '/admin/dashboard';
            if (!localStorage.getItem('token')) return `/login?redirect=${encodeURIComponent(url)}`;
            if (readUserType() === 'contractor') return '/contractor/dashboard';
        }
        return true;
    });

    // Register routes
    router.register('/', pages.home, ['home', 'footerSocial', 'uiImprovements']);
    router.register('/login', pages.login, ['registrationEnhanced', 'formValidation', 'uiImprovements']);
    router.register('/forgot-password', pages.forgotPassword, ['registrationEnhanced', 'formValidation']);
    router.register('/forgot-password-verify', pages.forgotPasswordVerify, ['registrationEnhanced', 'formValidation']);
    router.register('/forgot-password-reset', pages.forgotPasswordReset, ['registrationEnhanced', 'formValidation']);
    router.register('/register', pages.register, ['roleSelector', 'multiRoleRegister', 'registrationEnhanced', 'formValidation', 'uiImprovements']);
    router.register('/location-setup', pages.locationSetup, ['registrationEnhanced', 'formValidation']);
    router.register('/dashboard', pages.dashboard, ['dashboardPremium', 'dashboardEnhanced', 'community', 'dashboardFooter', 'skeleton', 'timeline', 'uiImprovements']);
    router.register('/submit-complaint', pages.submitComplaint, ['complaintWizard', 'complaintForm', 'formValidation', 'uiImprovements']);
    router.register('/profile', pages.profile, ['profile', 'profilePremium', 'formValidation', 'uiImprovements']);
    const redirectToComplaintForm = () => window.router.navigate(`/submit-complaint${window.location.search || ''}`, { replace: true });
    router.register('/file-complaint', redirectToComplaintForm);
    router.register('/register-gateway', redirectToComplaintForm);
    router.register('/verify-account', pages.verifyAccount, ['verifyAccount', 'verificationBanner', 'formValidation']);

    // Admin Routes
    router.register('/admin/login', pages.adminLogin, ['admin', 'formValidation']);
    router.register('/admin/register', pages.adminRegister, ['admin', 'formValidation']);
    router.register('/admin/dashboard', pages.adminDashboard, ['admin', 'skeleton', 'timeline']);
    router.register('/admin/complaints', pages.adminComplaints, ['admin', 'formValidation', 'timeline']);
    router.register('/admin/pending', pages.adminPending, ['admin', 'formValidation']);
    router.register('/admin/my-permissions', pages.adminPermissions, ['admin', 'formValidation']);
    router.register('/admin/permission-requests', pages.permissionRequests, ['admin', 'formValidation']);

    // Contractor Routes
    router.register('/contractor/dashboard', pages.contractorDashboard, ['dashboardPremium', 'dashboardEnhanced', 'dashboardFooter']);

    // Legal Pages
    router.register('/privacy', pages.privacy, ['privacy', 'legal', 'footerSocial']);
    router.register('/terms', pages.terms, ['terms', 'legal', 'footerSocial']);
    router.register('/guidelines', pages.guidelines, ['disclaimer', 'legal', 'footerSocial']);
    router.register('/disclaimer', pages.disclaimer, ['disclaimer', 'legal', 'footerSocial']);

    // Support Pages
    router.register('/help', pages.help, ['help', 'footerSocial']);
    router.register('/faq', pages.faq, ['faq', 'help', 'footerSocial']);
    router.register('/contact', pages.contact, ['contact', 'footerSocial', 'formValidation']);
    router.register('/follow-us', pages.followUs, ['followUs', 'footerSocial']);

    // Platform Pages
    router.register('/how-it-works', pages.howItWorks, ['howItWorks', 'footerSocial']);
    router.register('/features', pages.features);
    router.register('/about', pages.about, ['about', 'footerSocial']);
    router.register('/success-stories', pages.successStories, ['successStories', 'footerSocial']);
    router.register('/authorities', pages.authorities, ['authorities', 'footerSocial']);
    router.register('/authorities/:id', pages.authorityDetail, ['authorityDetail', 'footerSocial']);
    router.register('/contractors', pages.contractors, ['contractors', 'footerSocial']);
    router.register('/community', pages.community, ['social', 'community', 'uiImprovements']);
    router.register('/messages', pages.messages, ['social', 'uiImprovements']);
    router.register('/stories', pages.stories, ['social', 'stories', 'uiImprovements']);

    // Initialize router
    router.init();
}
