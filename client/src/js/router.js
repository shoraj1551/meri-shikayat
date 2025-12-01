/**
 * Simple router for single-page application
 */

export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }

    /**
     * Register a route
     */
    register(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navigate to a route
     */
    navigate(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            history.pushState(null, '', path);
            this.routes[path]();
        } else {
            console.error(`Route not found: ${path}`);
        }
    }

    /**
     * Initialize router
     */
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const path = window.location.pathname;
            if (this.routes[path]) {
                this.currentRoute = path;
                this.routes[path]();
            }
        });

        // Handle initial route
        const initialPath = window.location.pathname || '/';
        if (this.routes[initialPath]) {
            this.navigate(initialPath);
        } else {
            this.navigate('/');
        }
    }
}

export const router = new Router();
