const css = {
    about: () => import('../styles/about.css?inline'),
    admin: () => import('../styles/admin-portal.css?inline'),
    authorities: () => import('../styles/authorities.css?inline'),
    authorityDetail: () => import('../styles/authority-detail.css?inline'),
    community: () => import('../styles/community-feed.css?inline'),
    complaintForm: () => import('../styles/complaint-form.css?inline'),
    complaintWizard: () => import('../styles/complaint-wizard.css?inline'),
    contact: () => import('../styles/contact.css?inline'),
    contractors: () => import('../styles/contractors.css?inline'),
    dashboardPremium: () => import('../styles/dashboard-premium.css?inline'),
    dashboardEnhanced: () => import('../styles/dashboard-enhanced.css?inline'),
    dashboardFooter: () => import('../styles/dashboard-footer.css?inline'),
    disclaimer: () => import('../styles/disclaimer.css?inline'),
    faq: () => import('../styles/faq.css?inline'),
    followUs: () => import('../styles/follow-us.css?inline'),
    footerSocial: () => import('../styles/footer-social.css?inline'),
    formValidation: () => import('../styles/form-validation.css?inline'),
    help: () => import('../styles/help-center.css?inline'),
    home: () => import('../styles/home.css?inline'),
    howItWorks: () => import('../styles/how-it-works.css?inline'),
    legal: () => import('../styles/legal-pages.css?inline'),
    multiRoleRegister: () => import('../styles/multi-role-register.css?inline'),
    privacy: () => import('../styles/privacy.css?inline'),
    profile: () => import('../styles/profile.css?inline'),
    profilePremium: () => import('../styles/profile-premium.css?inline'),
    registrationEnhanced: () => import('../styles/registration-enhanced.css?inline'),
    roleSelector: () => import('../styles/role-selector.css?inline'),
    skeleton: () => import('../styles/skeleton.css?inline'),
    social: () => import('../styles/social-features.css?inline'),
    stories: () => import('../styles/stories-feed.css?inline'),
    successStories: () => import('../styles/success-stories.css?inline'),
    terms: () => import('../styles/terms.css?inline'),
    timeline: () => import('../styles/timeline.css?inline'),
    uiImprovements: () => import('../styles/ui-improvements.css?inline'),
    verificationBanner: () => import('../styles/verification-banner.css?inline'),
    verifyAccount: () => import('../styles/verify-account.css?inline')
};

let transitionId = 0;

export async function applyRouteStyles(styleNames = []) {
    const currentTransition = ++transitionId;
    const uniqueNames = [...new Set(styleNames)];
    const unknownName = uniqueNames.find((name) => !css[name]);

    if (unknownName) {
        throw new Error(`Unknown route style: ${unknownName}`);
    }

    const modules = await Promise.all(uniqueNames.map((name) => css[name]()));

    // A slower, superseded navigation must never overwrite the newest page styles.
    if (currentTransition !== transitionId) return false;

    const fragment = document.createDocumentFragment();
    modules.forEach((module, index) => {
        const element = document.createElement('style');
        element.dataset.routeStyle = uniqueNames[index];
        element.textContent = module.default;
        fragment.appendChild(element);
    });

    document.querySelectorAll('style[data-route-style]').forEach((element) => element.remove());
    document.head.appendChild(fragment);
    return true;
}

export function resetRouteStyleTransitionForTests() {
    transitionId = 0;
}
