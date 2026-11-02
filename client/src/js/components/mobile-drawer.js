const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initializeMobileDrawer({ toggle, drawer, overlay, lifecycle }) {
    if (!toggle || !drawer || !overlay) return () => {};

    const backgroundState = new Map();
    const pageRoot = drawer.parentElement;

    const backgroundElements = () => {
        const pageSiblings = pageRoot
            ? [...pageRoot.children].filter((element) => ![drawer, overlay].includes(element) && !element.contains(toggle))
            : [];
        return [...new Set([
            ...pageSiblings,
            toggle.closest('header')?.querySelector('.logo'),
            toggle.closest('header')?.querySelector('.nav-actions'),
            document.querySelector('.bottom-nav')
        ].filter(Boolean))];
    };

    const setBackgroundDisabled = (disabled) => {
        if (disabled) {
            backgroundElements().forEach((element) => {
                backgroundState.set(element, {
                    inert: element.inert,
                    ariaHidden: element.getAttribute('aria-hidden')
                });
                element.inert = true;
                element.setAttribute('aria-hidden', 'true');
            });
            return;
        }

        backgroundState.forEach((state, element) => {
            element.inert = state.inert;
            if (state.ariaHidden === null) element.removeAttribute('aria-hidden');
            else element.setAttribute('aria-hidden', state.ariaHidden);
        });
        backgroundState.clear();
    };

    const isOpen = () => drawer.classList.contains('active');

    const close = ({ restoreFocus = true } = {}) => {
        toggle.classList.remove('active');
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.inert = true;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setBackgroundDisabled(false);
        if (restoreFocus && toggle.isConnected) toggle.focus();
    };

    const open = () => {
        toggle.classList.add('active');
        drawer.classList.add('active');
        overlay.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
        drawer.setAttribute('aria-hidden', 'false');
        drawer.inert = false;
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setBackgroundDisabled(true);
        drawer.querySelector(FOCUSABLE)?.focus();
    };

    const onKeyDown = (event) => {
        if (!isOpen()) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = [...drawer.querySelectorAll(FOCUSABLE)].filter((element) => !element.hidden);
        if (!focusable.length) {
            event.preventDefault();
            drawer.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    toggle.addEventListener('click', () => isOpen() ? close() : open(), { signal: lifecycle?.signal });
    overlay.addEventListener('click', () => close(), { signal: lifecycle?.signal });
    drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => close({ restoreFocus: false }), { signal: lifecycle?.signal });
    });
    document.addEventListener('keydown', onKeyDown, { signal: lifecycle?.signal });
    lifecycle?.onCleanup(() => close({ restoreFocus: false }));
    return close;
}
