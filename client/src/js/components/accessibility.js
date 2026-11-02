const ERROR_SELECTOR = '.error-message, .error-state, .error-text, .validation-error, [data-error]';
const SUCCESS_SELECTOR = '.success-message, .success-state, [data-success]';

function applyLiveRegion(element, role, politeness) {
    if (!element.hasAttribute('role')) element.setAttribute('role', role);
    if (!element.hasAttribute('aria-live')) element.setAttribute('aria-live', politeness);
    element.setAttribute('aria-atomic', 'true');
}

export function enhanceStatusRegions(root = document) {
    const candidates = [];
    if (root.matches?.(ERROR_SELECTOR) || root.matches?.(SUCCESS_SELECTOR)) candidates.push(root);
    candidates.push(...(root.querySelectorAll?.(`${ERROR_SELECTOR}, ${SUCCESS_SELECTOR}`) || []));
    candidates.forEach((element) => {
        if (element.matches(ERROR_SELECTOR)) applyLiveRegion(element, 'alert', 'assertive');
        else applyLiveRegion(element, 'status', 'polite');
    });
}

export function installAccessibilityEnhancements(app = document.getElementById('app')) {
    if (!app) return () => {};
    enhanceStatusRegions(app);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') enhanceStatusRegions(mutation.target);
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) enhanceStatusRegions(node);
            });
        });
    });
    observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
}
