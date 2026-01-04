/**
 * Contact Information Service
 * Loads contact info from centralized config file
 */

let contactInfo = null;

/**
 * Load contact information from config file
 */
export async function loadContactInfo() {
    if (contactInfo) {
        return contactInfo;
    }

    try {
        const response = await fetch('/src/config/contact-info.json');
        contactInfo = await response.json();
        return contactInfo;
    } catch (error) {
        console.error('Failed to load contact info:', error);
        // Fallback to default values
        return {
            contact: {
                email: {
                    primary: 'support@merishikayat.in',
                    support: 'help@merishikayat.in',
                    admin: 'admin@merishikayat.in'
                },
                phone: {
                    primary: '+91 123 456 7890',
                    helpline: '+91 987 654 3210',
                    tollfree: '1800-123-4567'
                },
                address: {
                    line1: 'Meri Shikayat Office',
                    line2: '123 Civic Center',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                    country: 'India'
                },
                social: {
                    facebook: 'https://facebook.com/merishikayat',
                    twitter: 'https://twitter.com/merishikayat',
                    instagram: 'https://instagram.com/merishikayat',
                    linkedin: 'https://linkedin.com/company/merishikayat'
                },
                hours: {
                    weekdays: '9:00 AM - 6:00 PM',
                    saturday: '10:00 AM - 4:00 PM',
                    sunday: 'Closed'
                }
            }
        };
    }
}

/**
 * Get contact info (cached)
 */
export function getContactInfo() {
    return contactInfo;
}

/**
 * Get primary email
 */
export function getPrimaryEmail() {
    return contactInfo?.contact?.email?.primary || 'support@merishikayat.in';
}

/**
 * Get primary phone
 */
export function getPrimaryPhone() {
    return contactInfo?.contact?.phone?.primary || '+91 123 456 7890';
}

/**
 * Get all emails
 */
export function getAllEmails() {
    return contactInfo?.contact?.email || {};
}

/**
 * Get all phones
 */
export function getAllPhones() {
    return contactInfo?.contact?.phone || {};
}

/**
 * Get address
 */
export function getAddress() {
    return contactInfo?.contact?.address || {};
}

/**
 * Get social media links
 */
export function getSocialLinks() {
    return contactInfo?.contact?.social || {};
}

/**
 * Get office hours
 */
export function getOfficeHours() {
    return contactInfo?.contact?.hours || {};
}
