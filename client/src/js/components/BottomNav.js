
/**
 * Bottom Navigation Component for Mobile
 */
export class BottomNav {
    constructor() {
        this.container = null;
    }

    render() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'bottom-nav hide-on-desktop';
            document.body.appendChild(this.container);
        }

        this.container.innerHTML = `
            <a href="/" class="nav-item ${this.isActive('/') ? 'active' : ''}" data-link>
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="/dashboard" class="nav-item ${this.isActive('/dashboard') ? 'active' : ''}" data-link>
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="/file-complaint" class="nav-item ${this.isActive('/file-complaint') ? 'active' : ''} fab-container" data-link>
                <div class="fab">
                    <i class="fas fa-plus"></i>
                </div>
            </a>
             <a href="/community" class="nav-item ${this.isActive('/community') ? 'active' : ''}" data-link>
                <i class="fas fa-users"></i>
                <span>Community</span>
            </a>
            <a href="/profile" class="nav-item ${this.isActive('/profile') ? 'active' : ''}" data-link>
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </a>
        `;

        this.attachEvents();
    }

    isActive(path) {
        return window.location.pathname === path;
    }

    attachEvents() {
        // Delegate click events for navigation
        this.container.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = e.currentTarget.getAttribute('href');
                if (window.router) {
                    window.router.navigate(path);
                    this.updateActiveState(path);
                }
            });
        });
    }

    updateActiveState(path) {
        const links = this.container.querySelectorAll('.nav-item');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Export singleton instance
export const bottomNav = new BottomNav();
