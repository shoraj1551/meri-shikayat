/** Shared, accessible loading, empty and error states. */
const encode = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const icons = {
    empty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v12H4zM8 10h8M8 14h5"/></svg>',
    error: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>'
};

export function renderDataState(type, { title, message, actionLabel, action = 'retry', compact = false, count = 3 } = {}) {
    if (type === 'loading') {
        const rows = Array.from({ length: Math.max(1, Math.min(Number(count) || 3, 6)) }, () => `
            <div class="ui-skeleton__row" aria-hidden="true"><span class="ui-skeleton__avatar"></span><span class="ui-skeleton__content"><i></i><i></i><i></i></span></div>`).join('');
        return `<div class="ui-state ui-state--loading${compact ? ' ui-state--compact' : ''}" role="status" aria-live="polite" aria-busy="true"><span class="visually-hidden">${encode(message || 'Loading content')}</span><div class="ui-skeleton">${rows}</div></div>`;
    }

    const safeType = type === 'error' ? 'error' : 'empty';
    const defaultTitle = safeType === 'error' ? 'Unable to load content' : 'Nothing here yet';
    const heading = compact ? 'h3' : 'h2';
    return `<div class="ui-state ui-state--${safeType}${compact ? ' ui-state--compact' : ''}" role="${safeType === 'error' ? 'alert' : 'status'}">
        <span class="ui-state__icon">${icons[safeType]}</span>
        <${heading} class="ui-state__title">${encode(title || defaultTitle)}</${heading}>
        ${message ? `<p class="ui-state__message">${encode(message)}</p>` : ''}
        ${actionLabel ? `<button class="btn btn-primary ui-state__action" type="button" data-state-action="${encode(action)}">${encode(actionLabel)}</button>` : ''}
    </div>`;
}

export class Loading {
    static state(type, options) { return renderDataState(type, options); }
    static skeleton(_height, _width, count = 3) { return renderDataState('loading', { count, compact: true }); }
    static createSkeleton(count = 3) { return renderDataState('loading', { count }); }
    static empty(title, message, options = {}) { return renderDataState('empty', { title, message, ...options }); }
    static error(title, message, options = {}) { return renderDataState('error', { title, message, ...options }); }
    static inline(container, message = 'Loading content') {
        if (container) container.innerHTML = renderDataState('loading', { message, compact: true, count: 1 });
    }
    static buttonLoading(button, loadingText = 'Processing…') {
        if (!button || button.dataset.loading === 'true') return;
        button.dataset.originalContent = button.innerHTML;
        button.dataset.originalDisabled = String(button.disabled);
        button.dataset.loading = 'true';
        button.disabled = true;
        button.classList.add('btn-loading');
        button.innerHTML = `<span class="ui-spinner" aria-hidden="true"></span><span>${encode(loadingText)}</span>`;
    }
    static buttonReset(button) {
        if (!button || button.dataset.loading !== 'true') return;
        button.disabled = button.dataset.originalDisabled === 'true';
        button.classList.remove('btn-loading');
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
        delete button.dataset.originalDisabled;
        delete button.dataset.loading;
    }
    static spinner(message = 'Loading…') {
        return `<span class="ui-inline-loading" role="status"><span class="ui-spinner" aria-hidden="true"></span>${encode(message)}</span>`;
    }
    static show(message = 'Loading…') { this.showOverlay(message); }
    static hide() { this.hideOverlay(); }
    static showOverlay(message = 'Loading…') {
        this.hideOverlay();
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');
        overlay.innerHTML = `<div class="loading-content"><span class="ui-spinner ui-spinner--large" aria-hidden="true"></span><p>${encode(message)}</p></div>`;
        document.body.appendChild(overlay);
        document.body.classList.add('is-loading');
    }
    static hideOverlay() {
        document.getElementById('loading-overlay')?.remove();
        document.body?.classList.remove('is-loading');
    }
}
