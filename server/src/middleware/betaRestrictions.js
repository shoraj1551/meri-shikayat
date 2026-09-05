// These features are deliberately unavailable in beta. No invitation/env override.
export const disabledBetaPaths = [
    '/api/v1/auth/register/super-admin',
    '/api/v1/complaints/guest',
    '/api/v1/complaints/:complaintId/claim'
];
export function betaFeatureUnavailable(req, res) {
    return res.status(403).set('Cache-Control', 'no-store').json({
        success: false,
        code: 'BETA_FEATURE_DISABLED',
        message: 'This feature is unavailable during beta. Sign in to submit a new complaint; privileged access requires operator provisioning.'
    });
}
export function rejectPrivilegedRegistrationFields(req, res, next) {
    const body = req.body || {};
    const reserved = ['role', 'status', 'permissions', 'adminProfile', 'approvedBy', 'approvedAt', 'isSuperAdmin'];
    if (reserved.some(key => Object.hasOwn(body, key)) || body.userType === 'super_admin') {
        return res.status(403).json({ success: false, code: 'PRIVILEGED_FIELDS_FORBIDDEN',
            message: 'Privilege and approval fields cannot be supplied during public registration.' });
    }
    next();
}
