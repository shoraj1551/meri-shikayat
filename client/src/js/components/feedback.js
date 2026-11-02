const TYPE_LABELS = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
};

let activeDialog = null;

function ensureToastRegion() {
    let region = document.getElementById('feedback-toast-region');
    if (!region) {
        region = document.createElement('div');
        region.id = 'feedback-toast-region';
        region.className = 'feedback-toast-region';
        region.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(region);
    }
    return region;
}

export function notify(message, options = {}) {
    const { type = 'info', duration = type === 'error' ? 7000 : 4500 } = options;
    const toast = document.createElement('div');
    toast.className = `feedback-toast feedback-toast--${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const content = document.createElement('div');
    content.className = 'feedback-toast__content';
    const heading = document.createElement('strong');
    heading.textContent = TYPE_LABELS[type] || TYPE_LABELS.info;
    const text = document.createElement('span');
    text.textContent = String(message || '');
    content.append(heading, text);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'feedback-toast__close';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '\u00d7';

    let timeoutId;
    const dismiss = () => {
        clearTimeout(timeoutId);
        toast.classList.add('feedback-toast--leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 250);
    };
    closeButton.addEventListener('click', dismiss);
    toast.append(content, closeButton);
    ensureToastRegion().appendChild(toast);
    if (duration > 0) timeoutId = setTimeout(dismiss, duration);
    return dismiss;
}

function openDialog(options) {
    if (activeDialog) activeDialog(null);

    const previouslyFocused = document.activeElement;
    const backdrop = document.createElement('div');
    backdrop.className = 'feedback-dialog-backdrop';

    const dialog = document.createElement('section');
    dialog.className = 'feedback-dialog';
    dialog.tabIndex = -1;
    dialog.setAttribute('role', options.tone === 'danger' ? 'alertdialog' : 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const titleId = `feedback-title-${Date.now()}`;
    const messageId = `feedback-message-${Date.now()}`;
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.setAttribute('aria-describedby', messageId);

    const title = document.createElement('h2');
    title.id = titleId;
    title.textContent = options.title;
    const message = document.createElement('p');
    message.id = messageId;
    message.className = 'feedback-dialog__message';
    message.textContent = options.message || '';
    dialog.append(title, message);

    return new Promise(resolve => {
        let settled = false;
        const backgroundState = [...document.body.children].map(element => ({
            element,
            inert: element.inert
        }));
        backgroundState.forEach(({ element }) => { element.inert = true; });
        const finish = value => {
            if (settled) return;
            settled = true;
            document.removeEventListener('keydown', onKeydown, true);
            backdrop.remove();
            document.body.classList.remove('feedback-dialog-open');
            backgroundState.forEach(({ element, inert }) => {
                if (element.isConnected) element.inert = inert;
            });
            activeDialog = null;
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
            resolve(value);
        };
        activeDialog = finish;

        const onKeydown = event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                finish(null);
                return;
            }
            if (event.key !== 'Tab') return;
            const controls = [...dialog.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')]
                .filter(element => !element.disabled && element.getAttribute('aria-hidden') !== 'true');
            if (!controls.length) return;
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        options.build(dialog, finish);
        backdrop.appendChild(dialog);
        document.body.appendChild(backdrop);
        document.body.classList.add('feedback-dialog-open');
        document.addEventListener('keydown', onKeydown, true);
        requestAnimationFrame(() => (dialog.querySelector('[autofocus], input, textarea, button') || dialog).focus());
    });
}

function addActions(dialog, finish, options) {
    const actions = document.createElement('div');
    actions.className = 'feedback-dialog__actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-outline';
    cancel.textContent = options.cancelLabel || 'Cancel';
    cancel.addEventListener('click', () => finish(null));
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = `btn ${options.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`;
    confirm.textContent = options.confirmLabel || 'Confirm';
    actions.append(cancel, confirm);
    dialog.appendChild(actions);
    return confirm;
}

export async function confirmAction(options = {}) {
    const result = await openDialog({
        title: options.title || 'Confirm action',
        message: options.message || 'Are you sure you want to continue?',
        tone: options.tone,
        build(dialog, finish) {
            const confirm = addActions(dialog, finish, options);
            confirm.autofocus = true;
            confirm.addEventListener('click', () => finish(true));
        }
    });
    return result === true;
}

export function requestText(options = {}) {
    return openDialog({
        title: options.title || 'Additional information',
        message: options.message || '',
        tone: options.tone,
        build(dialog, finish) {
            const fieldId = `feedback-field-${Date.now()}`;
            const label = document.createElement('label');
            label.className = 'feedback-dialog__label';
            label.htmlFor = fieldId;
            label.textContent = options.label || 'Response';
            const input = options.multiline === false ? document.createElement('input') : document.createElement('textarea');
            input.id = fieldId;
            input.className = 'form-control feedback-dialog__input';
            input.value = options.defaultValue || '';
            input.placeholder = options.placeholder || '';
            input.autofocus = true;
            if (input instanceof HTMLTextAreaElement) input.rows = 4;
            const error = document.createElement('p');
            error.className = 'feedback-dialog__error';
            error.setAttribute('role', 'alert');
            label.appendChild(input);
            dialog.append(label, error);
            const confirm = addActions(dialog, finish, options);
            const submit = () => {
                const value = input.value.trim();
                const validationMessage = options.validate?.(value) || (options.required && !value ? 'This field is required.' : '');
                if (validationMessage) {
                    error.textContent = validationMessage;
                    input.setAttribute('aria-invalid', 'true');
                    input.focus();
                    return;
                }
                finish(value);
            };
            confirm.addEventListener('click', submit);
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter' && (input instanceof HTMLInputElement || event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    submit();
                }
            });
        }
    });
}
