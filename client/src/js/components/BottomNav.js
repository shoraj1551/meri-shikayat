const HIDDEN_ROUTE_PREFIXES = [
    '/login', '/register', '/register-gateway', '/forgot-password',
    '/forgot-password-verify', '/forgot-password-reset', '/location-setup',
    '/verify-account', '/admin', '/contractor'
];

const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    add: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    community: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M14 14.5a4.5 4.5 0 0 1 6.5 4V20"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
};

const items = [
    { href: '/', label: 'Home', icon: icons.home, matches: ['/'] },
    { href: '/dashboard', label: 'Dashboard', icon: icons.dashboard, matches: ['/dashboard'] },
    { href: '/submit-complaint', label: 'File complaint', icon: icons.add, matches: ['/submit-complaint'], primary: true },
    { href: '/community', label: 'Community', icon: icons.community, matches: ['/community', '/messages', '/stories'] },
    { href: '/profile', label: 'Profile', icon: icons.profile, matches: ['/profile'] }
];

function safelyReadUser(storage) {
    try {
        return JSON.parse(storage.getItem('user') || 'null');
    } catch {
        return null;
    }
}

export function getNavigationIdentity(storage) {
    if (storage.getItem('adminToken')) return 'admin';
    if (!storage.getItem('token')) return 'anonymous';
    const userType = safelyReadUser(storage)?.userType;
    if (userType === 'contractor') return 'contractor';
    if (['admin', 'super_admin'].includes(userType)) return 'admin';
    return userType && userType !== 'general_user' ? 'unsupported' : 'user';
}

export function shouldShowBottomNavigation(path, storage) {
    if (getNavigationIdentity(storage) !== 'user') return false;
    return !HIDDEN_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isNavigationItemActive(path, matches) {
    return matches.some((match) => path === match || (match !== '/' && path.startsWith(`${match}/`)));
}

export class BottomNav {
    constructor({ storage = globalThis.localStorage, documentRef = globalThis.document } = {}) {
        this.storage = storage;
        this.document = documentRef;
        this.container = null;
        this.unsubscribe = null;
        this.router = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleStorage = this.handleStorage.bind(this);
    }

    initialize(router) {
        this.router = router;
        this.unsubscribe?.();
        this.unsubscribe = router.subscribe((path) => this.render(path));
        globalThis.addEventListener?.('storage', this.handleStorage);
        this.render(globalThis.location?.pathname || '/');
    }

    handleStorage(event) {
        if (['token', 'adminToken', 'user'].includes(event.key)) {
            this.render(globalThis.location?.pathname || '/');
        }
    }

    handleClick(event) {
        const link = event.target.closest('[data-bottom-nav-link]');
        if (!link || !this.container?.contains(link)) return;
        event.preventDefault();
        this.router?.navigate(link.getAttribute('href'));
    }

    render(path = globalThis.location?.pathname || '/') {
        if (!shouldShowBottomNavigation(path, this.storage)) {
            this.remove();
            return;
        }

        if (!this.container) {
            this.container = this.document.createElement('nav');
            this.container.className = 'bottom-nav hide-on-desktop';
            this.container.setAttribute('aria-label', 'Primary mobile navigation');
            this.container.addEventListener('click', this.handleClick);
            this.document.body.appendChild(this.container);
        }

        this.container.innerHTML = items.map((item) => {
            const active = isNavigationItemActive(path, item.matches);
            const classes = ['bottom-nav__item', active ? 'active' : '', item.primary ? 'fab-container' : '']
                .filter(Boolean).join(' ');
            const current = active ? ' aria-current="page"' : '';

            if (item.primary) {
                return `<a href="${item.href}" class="${classes}" data-bottom-nav-link aria-label="${item.label}"${current}>
                    <span class="fab bottom-nav__icon">${item.icon}</span>
                    <span class="visually-hidden">${item.label}</span>
                </a>`;
            }

            return `<a href="${item.href}" class="${classes}" data-bottom-nav-link${current}>
                <span class="bottom-nav__icon">${item.icon}</span><span>${item.label}</span>
            </a>`;
        }).join('');

        this.document.body.classList.add('has-bottom-nav');
    }

    remove() {
        if (this.container) {
            this.container.removeEventListener('click', this.handleClick);
            this.container.remove();
            this.container = null;
        }
        this.document?.body?.classList.remove('has-bottom-nav');
    }

    destroy() {
        this.unsubscribe?.();
        this.unsubscribe = null;
        globalThis.removeEventListener?.('storage', this.handleStorage);
        this.remove();
    }
}

export const bottomNav = new BottomNav();
