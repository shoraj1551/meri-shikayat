/**
 * Loading Component
 * Provides loading states for buttons, pages, and data fetching
 */

export class Loading {
    /**
     * Show button loading state
     */
    static buttonLoading(button, loadingText = 'Processing...') {
        if (!button) return;

        // Store original content
        button.dataset.originalContent = button.innerHTML;
        button.dataset.originalDisabled = button.disabled;

        // Set loading state
        button.disabled = true;
        button.classList.add('btn-loading');
        button.innerHTML = `
            <span class="spinner"></span>
            <span>${loadingText}</span>
        `;
    }

    /**
     * Reset button to original state
     */
    static buttonReset(button) {
        if (!button || !button.dataset.originalContent) return;

        button.disabled = button.dataset.originalDisabled === 'true';
        button.classList.remove('btn-loading');
        button.innerHTML = button.dataset.originalContent;

        delete button.dataset.originalContent;
        delete button.dataset.originalDisabled;
    }

    /**
     * Show page loading overlay
     */
    static showOverlay(message = 'Loading...') {
        // Remove existing overlay if any
        this.hideOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner-large"></div>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('loading-overlay-visible');
        });
    }

    /**
     * Hide page loading overlay
     */
    static hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('loading-overlay-visible');
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 200);
        }
    }

    /**
     * Create skeleton loader for lists
     */
    static createSkeleton(count = 3) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(`
                <div class="skeleton-card">
                    <div class="skeleton-header">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-text-group">
                            <div class="skeleton-text skeleton-text-title"></div>
                            <div class="skeleton-text skeleton-text-subtitle"></div>
                        </div>
                    </div>
                    <div class="skeleton-body">
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text skeleton-text-short"></div>
                    </div>
                </div>
            `);
        }
        return skeletons.join('');
    }

    /**
     * Show inline loading indicator
     */
    static inline(container, message = 'Loading...') {
        if (!container) return;

        container.innerHTML = `
            <div class="loading-inline">
                <span class="spinner-small"></span>
                <span>${message}</span>
            </div>
        `;
    }
}

// Add global loading styles
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    /* Button Loading */
    .btn-loading {
        position: relative;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }

    .spinner-small {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(102, 51, 153, 0.3);
        border-top-color: #663399;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }

    .spinner-large {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(102, 51, 153, 0.2);
        border-top-color: #663399;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Page Overlay */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .loading-overlay-visible {
        opacity: 1;
    }

    .loading-content {
        background: white;
        padding: 32px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .loading-content p {
        margin: 0;
        color: #666;
        font-size: 16px;
    }

    /* Inline Loading */
    .loading-inline {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: #666;
    }

    /* Skeleton Loaders */
    .skeleton-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .skeleton-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }

    .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        margin-right: 12px;
    }

    .skeleton-text-group {
        flex: 1;
    }

    .skeleton-text {
        height: 12px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .skeleton-text-title {
        width: 60%;
        height: 16px;
    }

    .skeleton-text-subtitle {
        width: 40%;
    }

    .skeleton-text-short {
        width: 80%;
    }

    .skeleton-body .skeleton-text:last-child {
        margin-bottom: 0;
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
`;

document.head.appendChild(loadingStyles);

export default Loading;
