function sanitizeValue(value) {
    if (typeof value === 'string') {
        // These endpoints accept plain text, never rich HTML. Remove complete
        // markup and then any unmatched angle brackets so malformed tags cannot
        // survive canonicalization. Contextual output encoding is still applied
        // by the client for both new and legacy database records.
        return value
            .replace(/<(script|style|template|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/[<>]/g, '')
            .trim();
    }
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
    }
    return value;
}

export function sanitizePlainTextBody(req, _res, next) {
    if (req.body && typeof req.body === 'object') req.body = sanitizeValue(req.body);
    next();
}

export { sanitizeValue as sanitizePlainTextValue };
