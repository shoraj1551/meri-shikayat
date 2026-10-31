export function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function escapeHtmlDeep(value) {
    if (typeof value === 'string') return escapeHtml(value);
    if (Array.isArray(value)) return value.map(escapeHtmlDeep);
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeHtmlDeep(item)]));
    }
    return value;
}

export function escapeJsString(value) {
    return String(value ?? '').replace(/[\\'"<>&\u2028\u2029]/g, character =>
        `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
    );
}

export function safeUrl(value, { allowBlob = false } = {}) {
    if (!value) return '';
    try {
        const base = globalThis.window?.location?.origin || 'https://invalid.local';
        const url = new URL(String(value), base);
        const allowed = ['http:', 'https:'];
        if (allowBlob) allowed.push('blob:');
        return allowed.includes(url.protocol) ? escapeHtml(String(value)) : '';
    } catch {
        return '';
    }
}
