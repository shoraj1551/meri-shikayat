const configuredBaseUrl = import.meta.env?.VITE_API_URL || globalThis.window?.API_BASE_URL || '/api/v1';
const configuredSocketUrl = import.meta.env?.VITE_SOCKET_URL || configuredBaseUrl;

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');
export const SOCKET_URL = configuredSocketUrl.replace(/\/+$/, '');

export function apiUrl(path = '') {
    return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

export function apiOrigin(pageOrigin = globalThis.window?.location?.origin) {
    try {
        return new URL(API_BASE_URL, pageOrigin).origin;
    } catch {
        return pageOrigin;
    }
}
