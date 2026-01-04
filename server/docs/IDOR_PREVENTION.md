# IDOR Prevention Guide
## Insecure Direct Object Reference (IDOR) Vulnerability Prevention

### Overview
This document describes how IDOR vulnerabilities have been prevented in Meri Shikayat through comprehensive authorization checks.

---

## What is IDOR?

**Insecure Direct Object Reference (IDOR)** occurs when an application exposes a reference to an internal object (like a database ID) without proper authorization checks.

### Example Attack
```
User A's complaint ID: 507f1f77bcf86cd799439011
User B tries: GET /api/complaints/507f1f77bcf86cd799439011
Without authorization → User B sees User A's complaint ❌
```

---

## Defense Strategy

### Layer 1: Authentication (Already Implemented)
**Middleware:** `protect` from `auth.js`

Ensures user is logged in before accessing any protected endpoint.

```javascript
router.use(protect); // All routes require authentication
```

### Layer 2: Authorization (NEW - Task 1.4)
**Middleware:** Authorization checks from `authorization.js`

Ensures user can only access resources they own or are authorized to access.

```javascript
router.get('/complaints/:id', 
    protect,                    // Layer 1: Is user logged in?
    canAccessComplaint,         // Layer 2: Can user access THIS complaint?
    getComplaint
);
```

---

## Authorization Middleware

### 1. canAccessComplaint
**Purpose:** Prevent users from viewing other users' complaints

**Rules:**
- ✅ User can access their own complaints
- ✅ Admins can access all complaints
- ✅ Guest complaints can be viewed by anyone (read-only)
- ❌ User A cannot access User B's complaints

**Usage:**
```javascript
router.get('/complaints/:id', protect, canAccessComplaint, getComplaint);
```

### 2. canModifyComplaint
**Purpose:** Prevent users from modifying other users' complaints

**Rules:**
- ✅ User can modify their own complaints
- ✅ Admins can modify all complaints
- ❌ User A cannot modify User B's complaints

**Usage:**
```javascript
router.put('/complaints/:id', protect, canModifyComplaint, updateComplaint);
router.delete('/complaints/:id', protect, canModifyComplaint, deleteComplaint);
```

### 3. canAccessUserProfile
**Purpose:** Prevent profile enumeration and unauthorized access

**Rules:**
- ✅ User can access their own profile
- ✅ Admins can access all profiles
- ❌ User A cannot access User B's profile

**Usage:**
```javascript
router.get('/users/:userId', protect, canAccessUserProfile, getUserProfile);
```

### 4. canModifyUserProfile
**Purpose:** Prevent unauthorized profile modifications

**Rules:**
- ✅ User can modify their own profile
- ✅ Super admins can modify all profiles
- ✅ Regular admins can modify user profiles (not other admins)
- ❌ User A cannot modify User B's profile

**Usage:**
```javascript
router.put('/users/:userId', protect, canModifyUserProfile, updateUserProfile);
```

### 5. preventProfileEnumeration
**Purpose:** Prevent attackers from discovering valid user IDs

**Defense:**
- Returns 404 "User not found" instead of 403 "Forbidden"
- Prevents attackers from knowing if a user ID exists
- Logs enumeration attempts for security monitoring

**Usage:**
```javascript
router.get('/users/:userId', protect, preventProfileEnumeration, getUserProfile);
```

### 6. canAccessResource (Generic)
**Purpose:** Reusable authorization for any resource type

**Usage:**
```javascript
// For comments
router.get('/comments/:id', 
    protect, 
    canAccessResource('Comment', 'id', 'user'),
    getComment
);

// For posts
router.get('/posts/:id',
    protect,
    canAccessResource('Post', 'id', 'author'),
    getPost
);
```

---

## Implementation Examples

### Example 1: Complaint Routes
```javascript
import { canAccessComplaint, canModifyComplaint } from '../middleware/authorization.js';

// View complaint - requires ownership or admin
router.get('/complaints/:id', 
    protect, 
    canAccessComplaint, 
    getComplaint
);

// Update complaint - requires ownership or admin
router.put('/complaints/:id',
    protect,
    canModifyComplaint,
    updateComplaint
);

// Delete complaint - requires ownership or admin
router.delete('/complaints/:id',
    protect,
    canModifyComplaint,
    deleteComplaint
);
```

### Example 2: Profile Routes
```javascript
import { canAccessUserProfile, canModifyUserProfile } from '../middleware/authorization.js';

// View profile - own profile or admin
router.get('/users/:userId/profile',
    protect,
    canAccessUserProfile,
    getUserProfile
);

// Update profile - own profile or admin
router.put('/users/:userId/profile',
    protect,
    canModifyUserProfile,
    updateUserProfile
);
```

---

## Testing IDOR Prevention

### Test 1: User Cannot Access Another User's Complaint
```bash
# User A login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"userA@test.com","password":"password"}'
# Save token as USER_A_TOKEN

# User B login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"userB@test.com","password":"password"}'
# Save token as USER_B_TOKEN

# User B creates a complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  -F "title=Test" \
  -F "description=Test"
# Save complaint ID as USER_B_COMPLAINT_ID

# User A tries to access User B's complaint
curl http://localhost:5000/api/complaints/$USER_B_COMPLAINT_ID \
  -H "Authorization: Bearer $USER_A_TOKEN"

# Expected: 403 Forbidden
# {
#   "success": false,
#   "message": "You do not have permission to access this complaint"
# }
```

### Test 2: User Can Access Own Complaint
```bash
# User A creates a complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -F "title=My Complaint" \
  -F "description=Test"
# Save complaint ID as USER_A_COMPLAINT_ID

# User A accesses own complaint
curl http://localhost:5000/api/complaints/$USER_A_COMPLAINT_ID \
  -H "Authorization: Bearer $USER_A_TOKEN"

# Expected: 200 OK with complaint data
```

### Test 3: Admin Can Access Any Complaint
```bash
# Admin login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@test.com","password":"password"}'
# Save token as ADMIN_TOKEN

# Admin accesses User B's complaint
curl http://localhost:5000/api/admin/complaints/$USER_B_COMPLAINT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 200 OK with complaint data
```

### Test 4: User Cannot Modify Another User's Complaint
```bash
# User A tries to update User B's complaint
curl -X PUT http://localhost:5000/api/complaints/$USER_B_COMPLAINT_ID \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked"}'

# Expected: 403 Forbidden
```

### Test 5: Profile Enumeration Prevention
```bash
# User A tries to access User B's profile
curl http://localhost:5000/api/users/$USER_B_ID/profile \
  -H "Authorization: Bearer $USER_A_TOKEN"

# Expected: 404 Not Found (not 403 Forbidden)
# This prevents User A from knowing if User B exists
```

---

## Audit Logging

All authorization failures are logged for security monitoring:

```javascript
logger.warn('Unauthorized complaint access attempt', {
    userId: 'user_a_id',
    userRole: 'general_user',
    complaintId: 'complaint_id',
    complaintOwner: 'user_b_id',
    method: 'GET',
    ip: '192.168.1.100'
});
```

### Monitoring Alerts
Set up alerts for:
- Multiple authorization failures from same IP
- Attempts to access sequential IDs (enumeration)
- Unusual access patterns
- Privilege escalation attempts

---

## Best Practices

### ✅ DO
- Always check ownership before allowing access
- Use authorization middleware on ALL sensitive endpoints
- Log all authorization failures
- Return generic errors for enumeration prevention
- Test authorization with different user roles

### ❌ DON'T
- Don't trust client-side checks
- Don't expose internal IDs in URLs if possible
- Don't return detailed error messages
- Don't skip authorization checks for "internal" endpoints
- Don't assume authentication = authorization

---

## Current Implementation Status

### ✅ Protected Endpoints
- [x] Complaint viewing (canAccessComplaint)
- [x] Complaint modification (canModifyComplaint)
- [x] User profile access (canAccessUserProfile)
- [x] User profile modification (canModifyUserProfile)
- [x] Admin complaint management (protectAdmin)
- [x] Profile enumeration prevention

### ✅ Authorization Checks
- [x] Ownership verification
- [x] Role-based access control
- [x] Admin permission checks
- [x] Guest complaint handling
- [x] Audit logging

---

## Security Checklist

- [x] All complaint endpoints have authorization
- [x] All profile endpoints have authorization
- [x] Admin endpoints require admin role
- [x] Authorization failures are logged
- [x] Profile enumeration prevented
- [x] Generic error messages for unauthorized access
- [x] Ownership checks before data access
- [x] Role-based access control implemented

---

## References

- [OWASP IDOR](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

**Last Updated:** December 17, 2025  
**Maintained By:** Security Team
