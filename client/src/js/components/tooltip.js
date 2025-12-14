/**
 * Tooltip Component
 * Provides accessible, easy-to-use tooltips for help text
 */

export class Tooltip {
    constructor() {
        this.activeTooltip = null;
        this.init();
    }

    init() {
        // Add global styles if not already added
        if (!document.getElementById('tooltip-styles')) {
            const style = document.createElement('style');
            style.id = 'tooltip-styles';
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }

        // Initialize tooltips on page load
        this.initializeTooltips();
    }

    initializeTooltips() {
        // Find all elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            // Desktop: hover
            element.addEventListener('mouseenter', (e) => this.show(e.target));
            element.addEventListener('mouseleave', () => this.hide());
            
            // Mobile: tap
            element.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    this.toggle(e.target);
                }
            });

            // Keyboard: focus
            element.addEventListener('focus', (e) => this.show(e.target));
            element.addEventListener('blur', () => this.hide());

            // Make focusable if not already
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }

            // Add ARIA attributes
            element.setAttribute('aria-describedby', `tooltip-${this.generateId()}`);
        });
    }

    show(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        const position = element.getAttribute('data-tooltip-position') || 'top';
        
        if (!tooltipText) return;

        // Remove any existing tooltip
        this.hide();

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = tooltipText;
        tooltip.setAttribute('role', 'tooltip');
        
        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;

        // Position tooltip
        this.position(tooltip, element, position);

        // Animate in
        requestAnimationFrame(() => {
            tooltip.classList.add('tooltip-visible');
        });
    }

    hide() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('tooltip-visible');
            setTimeout(() => {
                if (this.activeTooltip) {
                    this.activeTooltip.remove();
                    this.activeTooltip = null;
                }
            }, 200);
        }
    }

    toggle(element) {
        if (this.activeTooltip) {
            this.hide();
        } else {
            this.show(element);
        }
    }

    position(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 8;
                break;
            default:
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        }

        // Keep tooltip within viewport
        const padding = 8;
        if (left < padding) left = padding;
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = window.innerWidth - tooltipRect.width - padding;
        }
        if (top < padding) top = rect.bottom + 8; // Flip to bottom if no space on top

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getStyles() {
        return `
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                line-height: 1.4;
                max-width: 250px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(4px);
                transition: opacity 0.2s ease, transform 0.2s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .tooltip-visible {
                opacity: 1;
                transform: translateY(0);
            }

            .tooltip::before {
                content: '';
                position: absolute;
                width: 0;
                height: 0;
                border: 6px solid transparent;
            }

            .tooltip-top::before {
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-top-color: rgba(0, 0, 0, 0.9);
            }

            .tooltip-bottom::before {
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-bottom-color: rgba(0, 0, 0, 0.9);
            }

            .tooltip-left::before {
                right: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-left-color: rgba(0, 0, 0, 0.9);
            }

            .tooltip-right::before {
                left: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-right-color: rgba(0, 0, 0, 0.9);
            }

            @media (max-width: 768px) {
                .tooltip {
                    max-width: 200px;
                    font-size: 13px;
                }
            }
        `;
    }
}

// Initialize tooltips globally
export const tooltip = new Tooltip();
