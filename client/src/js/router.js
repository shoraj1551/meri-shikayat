import { renderDataState } from './components/loading.js';

const APP_NAME = 'Meri Shikayat';
const DEFAULT_DESCRIPTION = 'Report, track and resolve civic complaints with Meri Shikayat.';

function titleFromPath(path) {
    if (path === '/') return 'Home';
    return path.split('/').filter(Boolean).filter((part) => !part.startsWith(':'))
        .map((part) => part.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
        .join(' · ');
}

export class Router {
    constructor({ styleApplicator = async () => true, documentRef = globalThis.document, windowRef = globalThis.window } = {}) {
        this.routes = [];
        this.currentRoute = null;
        this.currentCleanup = null;
        this.currentLifecycle = null;
        this.navigationId = 0;
        this.styleApplicator = styleApplicator;
        this.listeners = new Set();
        this.guards = [];
        this.document = documentRef;
        this.window = windowRef;
        this.handlePopState = this.handlePopState.bind(this);
    }

    register(path, handler, styles = [], options = {}) {
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        this.routes.push({
            path,
            regex: new RegExp(`^${regexPath}$`),
            paramNames,
            handler,
            styles,
            title: options.title || titleFromPath(path),
            description: options.description || DEFAULT_DESCRIPTION,
            guard: options.guard
        });
    }

    addGuard(guard) {
        this.guards.push(guard);
        return () => {
            const index = this.guards.indexOf(guard);
            if (index >= 0) this.guards.splice(index, 1);
        };
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(path) {
        this.listeners.forEach((listener) => listener(path));
    }

    parseLocation(target) {
        const base = this.window?.location?.origin || 'http://localhost';
        const url = new URL(target, base);
        return { path: url.pathname, url: `${url.pathname}${url.search}${url.hash}` };
    }

    matchRoute(path) {
        for (const route of this.routes) {
            const match = path.match(route.regex);
            if (!match) continue;

            const params = {};
            try {
                route.paramNames.forEach((name, index) => {
                    params[name] = decodeURIComponent(match[index + 1]);
                });
            } catch {
                return null;
            }
            return { route, params };
        }
        return null;
    }

    async runGuards(context) {
        for (const guard of [...this.guards, context.route.guard].filter(Boolean)) {
            const result = await guard(context);
            if (result !== true && result !== undefined) return result;
        }
        return true;
    }

    ensureAnnouncer() {
        if (!this.document) return null;
        let announcer = this.document.getElementById('route-announcer');
        if (!announcer) {
            announcer = this.document.createElement('div');
            announcer.id = 'route-announcer';
            announcer.className = 'visually-hidden';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            this.document.body.appendChild(announcer);
        }
        return announcer;
    }

    updateMetadata(route) {
        if (!this.document) return;
        this.document.title = `${route.title} | ${APP_NAME}`;
        let description = this.document.querySelector('meta[name="description"]');
        if (!description) {
            description = this.document.createElement('meta');
            description.setAttribute('name', 'description');
            this.document.head.appendChild(description);
        }
        description.setAttribute('content', route.description);
    }

    renderLoading() {
        const app = this.document?.getElementById('app');
        if (app) {
            app.innerHTML = '<main class="route-state route-loading" aria-busy="true"><div class="route-spinner" aria-hidden="true"></div><p role="status">Loading page…</p></main>';
        }
        if (app) app.innerHTML = `<main class="route-state route-loading">${renderDataState('loading', { message: 'Loading page', count: 3 })}</main>`;
    }

    renderError(error) {
        const app = this.document?.getElementById('app');
        if (!app) return;
        app.innerHTML = `<main class="route-state route-error">${renderDataState('error', { title: 'Page unavailable', message: 'We could not load this page. Please try again.', actionLabel: 'Try again' })}</main>`;
        app.querySelector('[data-state-action="retry"]')?.addEventListener?.('click', () => this.navigate(this.window.location.href, { replace: true }));
        console.error('Route rendering failed:', error);
    }

    renderNotFound(url, { updateHistory = true } = {}) {
        this.navigationId += 1;
        if (updateHistory) globalThis.history?.pushState?.({}, '', url);
        this.teardownCurrent();
        const location = this.parseLocation(url);
        this.currentRoute = location.path;
        this.notify(location.path);
        const route = { title: 'Page not found', description: 'The requested Meri Shikayat page could not be found.' };
        this.updateMetadata(route);
        const app = this.document?.getElementById('app');
        if (app) {
            app.innerHTML = '<main class="route-state route-not-found"><p class="route-error-code">404</p><h1 tabindex="-1">Page not found</h1><p>The page may have moved or the address may be incorrect.</p><a class="btn btn-primary" href="/" data-route-home>Return home</a></main>';
            app.querySelector('[data-route-home]')?.addEventListener('click', (event) => {
                event.preventDefault();
                this.navigate('/');
            });
        }
        this.finishTransition(route.title, { scroll: [0, 0] });
    }

    teardownCurrent() {
        if (this.currentLifecycle) {
            this.currentLifecycle.controller.abort();
            [...this.currentLifecycle.cleanups].reverse().forEach((cleanup) => {
                try {
                    cleanup();
                } catch (error) {
                    console.error('Route cleanup failed:', error);
                }
            });
            this.currentLifecycle = null;
        }
        if (typeof this.currentCleanup === 'function') {
            try {
                this.currentCleanup();
            } catch (error) {
                console.error('Route cleanup failed:', error);
            }
        }
        this.currentCleanup = null;
        if (this.document?.body) this.document.body.style.overflow = '';
    }

    createLifecycle() {
        const controller = new AbortController();
        const cleanups = [];
        return {
            controller,
            cleanups,
            signal: controller.signal,
            onCleanup(cleanup) {
                if (typeof cleanup !== 'function') return cleanup;
                if (controller.signal.aborted) cleanup();
                else cleanups.push(cleanup);
                return cleanup;
            },
            setInterval(callback, delay) {
                const id = globalThis.setInterval(callback, delay);
                cleanups.push(() => globalThis.clearInterval(id));
                return id;
            },
            setTimeout(callback, delay) {
                const id = globalThis.setTimeout(callback, delay);
                cleanups.push(() => globalThis.clearTimeout(id));
                return id;
            },
            trackMediaStream(stream) {
                if (stream?.getTracks) cleanups.push(() => stream.getTracks().forEach((track) => track.stop()));
                return stream;
            },
            trackObjectUrl(url) {
                if (url) cleanups.push(() => URL.revokeObjectURL(url));
                return url;
            }
        };
    }

    finishTransition(title, { scroll = [0, 0] } = {}) {
        const app = this.document?.getElementById('app');
        const focusTarget = app?.querySelector('[data-route-focus], main h1, h1, main');
        if (focusTarget) {
            if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
            focusTarget.focus({ preventScroll: true });
        }
        this.window?.scrollTo?.(...scroll);
        const announcer = this.ensureAnnouncer();
        if (announcer) announcer.textContent = `${title} page loaded`;
    }

    saveScrollPosition() {
        if (!globalThis.history?.replaceState || !this.window) return;
        const state = { ...(globalThis.history.state || {}), scroll: [this.window.scrollX || 0, this.window.scrollY || 0] };
        globalThis.history.replaceState(state, '', this.window.location.href);
    }

    async renderMatchedRoute(location, matched, { scroll = [0, 0] } = {}) {
        const navigationId = ++this.navigationId;
        const context = { path: location.path, url: location.url, params: matched.params, route: matched.route };
        const guardResult = await this.runGuards(context);
        if (navigationId !== this.navigationId) return;
        if (typeof guardResult === 'string') return this.navigate(guardResult, { replace: true });
        if (guardResult === false) return;

        this.renderLoading();
        try {
            const stylesApplied = await this.styleApplicator(matched.route.styles);
            if (!stylesApplied || navigationId !== this.navigationId) return;

            this.teardownCurrent();
            this.currentRoute = location.path;
            this.updateMetadata(matched.route);
            this.notify(location.path);
            const lifecycle = this.createLifecycle();
            this.currentLifecycle = lifecycle;
            const cleanup = await matched.route.handler(matched.params, lifecycle);

            if (navigationId !== this.navigationId) {
                if (typeof cleanup === 'function') cleanup();
                return;
            }
            if (typeof cleanup === 'function') lifecycle.onCleanup(cleanup);
            this.finishTransition(matched.route.title, { scroll });
        } catch (error) {
            if (navigationId === this.navigationId) {
                this.teardownCurrent();
                this.renderError(error);
                this.finishTransition('Page unavailable', { scroll: [0, 0] });
            }
        }
    }

    navigate(target, { replace = false, updateHistory = true, scroll = [0, 0] } = {}) {
        const location = this.parseLocation(target);
        const matched = this.matchRoute(location.path);
        if (!matched) {
            this.renderNotFound(location.url, { updateHistory });
            return Promise.resolve();
        }

        if (updateHistory) {
            this.saveScrollPosition();
            const method = replace ? 'replaceState' : 'pushState';
            globalThis.history?.[method]?.({}, '', location.url);
        }
        return this.renderMatchedRoute(location, matched, { scroll });
    }

    handlePopState(event) {
        const target = `${this.window.location.pathname}${this.window.location.search}${this.window.location.hash}`;
        const scroll = Array.isArray(event.state?.scroll) ? event.state.scroll : [0, 0];
        return this.navigate(target, { updateHistory: false, scroll });
    }

    init() {
        if (globalThis.history && 'scrollRestoration' in globalThis.history) {
            globalThis.history.scrollRestoration = 'manual';
        }
        this.window?.addEventListener('popstate', this.handlePopState);
        this.ensureAnnouncer();

        const target = `${this.window?.location?.pathname || '/'}${this.window?.location?.search || ''}${this.window?.location?.hash || ''}`;
        return this.navigate(target, { updateHistory: false });
    }

    destroy() {
        this.window?.removeEventListener('popstate', this.handlePopState);
        this.teardownCurrent();
        this.listeners.clear();
        this.guards = [];
    }
}

export const router = new Router();
