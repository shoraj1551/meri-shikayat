/**
 * Simple router for single-page application with dynamic route support
 */

export class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
    }

    /**
     * Register a route
     */
    register(path, handler) {
        // Convert path with parameters to regex
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        this.routes.push({
            path,
            regex: new RegExp(`^${regexPath}$`),
            paramNames,
            handler
        });
    }

    /**
     * Match a path to a route
     */
    matchRoute(path) {
        for (const route of this.routes) {
            const match = path.match(route.regex);
            if (match) {
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return { route, params };
            }
        }
        return null;
    }

    /**
     * Navigate to a route
     */
    navigate(path) {
        const matched = this.matchRoute(path);
        if (matched) {
            this.currentRoute = path;
            history.pushState(null, '', path);
            matched.route.handler(matched.params);
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
            const matched = this.matchRoute(path);
            if (matched) {
                this.currentRoute = path;
                matched.route.handler(matched.params);
            }
        });

        // Handle initial route
        const initialPath = window.location.pathname || '/';
        const matched = this.matchRoute(initialPath);
        if (matched) {
            this.navigate(initialPath);
        } else {
            this.navigate('/');
        }
    }
}

export const router = new Router();
