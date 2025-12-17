/**
 * RBAC Middleware Tests
 * Tests for role-based access control
 */

import { hasPermission, requirePermission, requireRole, ROLES, PERMISSIONS } from '../../../src/middleware/rbac.js';

describe('RBAC Middleware', () => {
    describe('hasPermission', () => {
        it('should allow super admin all permissions', () => {
            const user = { id: '1', role: ROLES.SUPER_ADMIN };
            expect(hasPermission(user, 'complaint:delete:any')).toBe(true);
            expect(hasPermission(user, 'user:delete:any')).toBe(true);
            expect(hasPermission(user, 'admin:create')).toBe(true);
        });

        it('should allow admin to update complaints', () => {
            const user = { id: '1', role: ROLES.ADMIN };
            expect(hasPermission(user, 'complaint:update:any')).toBe(true);
        });

        it('should deny user from deleting any complaint', () => {
            const user = { id: '1', role: ROLES.USER };
            expect(hasPermission(user, 'complaint:delete:any')).toBe(false);
        });

        it('should allow user to update own complaint', () => {
            const user = { id: '1', role: ROLES.USER };
            expect(hasPermission(user, 'complaint:update:own')).toBe(true);
        });

        it('should return false for non-existent permission', () => {
            const user = { id: '1', role: ROLES.ADMIN };
            expect(hasPermission(user, 'non:existent:permission')).toBe(false);
        });

        it('should return false for user without role', () => {
            const user = { id: '1' };
            expect(hasPermission(user, 'complaint:read')).toBe(false);
        });
    });

    describe('requirePermission middleware', () => {
        it('should call next() if user has permission', () => {
            const req = { user: { id: '1', role: ROLES.ADMIN } };
            const res = {};
            const next = jest.fn();

            const middleware = requirePermission('complaint:update:any');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 403 if user lacks permission', () => {
            const req = { user: { id: '1', role: ROLES.USER }, ip: '127.0.0.1', path: '/test' };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            const middleware = requirePermission('admin:create');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if no user', () => {
            const req = { ip: '127.0.0.1', path: '/test' };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            const middleware = requirePermission('complaint:read');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('requireRole middleware', () => {
        it('should allow user with correct role', () => {
            const req = { user: { id: '1', role: ROLES.ADMIN } };
            const res = {};
            const next = jest.fn();

            const middleware = requireRole(ROLES.ADMIN);
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should allow user with one of multiple roles', () => {
            const req = { user: { id: '1', role: ROLES.MODERATOR } };
            const res = {};
            const next = jest.fn();

            const middleware = requireRole([ROLES.ADMIN, ROLES.MODERATOR]);
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should deny user with wrong role', () => {
            const req = { user: { id: '1', role: ROLES.USER }, ip: '127.0.0.1', path: '/admin' };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            const middleware = requireRole(ROLES.ADMIN);
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
