# B05 — Privileged and guest entry hardening

Status: In validation. Branch: `codex/beta-entry-hardening`. Date: 2026-09-05.

## Implemented

- All methods on public super-admin registration, guest complaint creation and complaint claiming return 403 BETA_FEATURE_DISABLED, before database access, authentication and upload processing. Controller and router guards also deny these operations.
- Public registration rejects client-supplied role, status, permissions, approval and super-admin fields. Ordinary citizen registration and pending staff registration remain available.
- Removed the public super-admin selector and signup form. Complaint submission requires sign-in and does not fall back to guest creation.
- Retired both legacy seed entry points: one reset an admin password to a known value; the other deleted collections and seeded fixed-password accounts. Both now exit unsuccessfully without connecting. No existing database records were changed or deleted.
- Added a read-only inventory command and separate transactional privileged-account provisioning command. Neither is exposed through HTTP.

## Restricted operator workflow — validation required before use

Do not provision production accounts until replica-set commit/rollback tests below pass and the operator approves the target database and evidence review.

Use a trusted operator machine with explicitly injected MONGODB_URI from a secret manager; no dotenv is loaded. Use a read-only database credential for inventory and a separately restricted credential for provisioning. Database RBAC and access control are the authorization boundary. The supplied operator name, ticket and SHA-256 digest are accountability/integrity metadata, not authentication or a digital signature. Keep application runtime credentials from writing the provisioning audit collection where deployment RBAC permits.

From the repository root:

```text
node server/src/scripts/privilegedAccess.js audit
node server/src/scripts/privilegedAccess.js provision --apply
```

The first command writes JSON inventory to stdout. Protect the report: it includes record IDs, roles, status, guest ownership flags and a known seed-identity flag, but no passwords, tokens, contact details or complaint text. Review source evidence securely using those IDs. Reports exceeding 10,000 records in any category fail instead of silently truncating.

The second command reads a JSON object from stdin, limited to 2 MiB. Supply it through a secure operator input mechanism; do not put credentials in command arguments, shell history, source control or this report.

Input shape:

```json
{
  "audit": "<the complete unmodified audit JSON object>",
  "approval": {
    "operator": "<operator identifier>",
    "ticket": "<approved change/evidence reference>",
    "auditSha256": "<audit.sha256>",
    "review": [
      {
        "key": "<User:id, Admin:id or Complaint:id from the report>",
        "decision": "verified",
        "reason": "<evidence reference and disposition; no secrets>"
      }
    ]
  },
  "account": {
    "store": "<User or Admin>",
    "firstName": "<first name>",
    "lastName": "<last name>",
    "email": "<unique operator email>",
    "phone": "<unique Indian mobile number>",
    "password": "<unique random 20–72 character ASCII password>"
  }
}
```

Replace placeholders; audit must be an object, not a string. Password must contain uppercase, lowercase, digits and a supported symbol (@$!%*?&), with no whitespace. Use a password manager.

Every inventory record requires exactly one reviewed disposition. Mark unresolved/suspicious records hold, preserve evidence, and resolve through a separately approved remediation process; hold blocks provisioning. Do not mark a complaint verified merely because someone knows its ID. Verification records the review outcome and does not transfer ownership.

Audit must be under 24 hours old, hash-matching, approved and unchanged against the current inventory. Explicitly choose User or legacy Admin: they still have different authentication paths until B06. The command refuses email/phone collisions across both stores; it never resets, promotes, merges or revokes existing identities.

Provisioning requires MongoDB transaction support (replica set). Account creation uses the actual model password-hashing hook and writes its audit record in the same transaction, using snapshot reads and majority writes. Unsupported transactions fail; there is no non-atomic fallback. The tool serializes its own provisioning attempts, not arbitrary application writes. Run during a controlled administrative change window; B10 still owns index verification and cross-store identity races remain a B06 concern.

Audit entries contain target ID/store, operator, ticket, reviewed dispositions and report digest, not account credentials. No audit TTL is installed. Retention, restricted access and backup policy require operator configuration.

## Verification

Passed locally:
- API suite: 53 Jest tests plus 39 native tests.
- Bootstrap/HTTP suite: 28 tests.
- Tooling suite: 11 tests.
- Total: 131 tests. Web production build verified 10 HTML asset references and 18 compressed assets.
- Lockfile unchanged; whitespace check clean.

HTTP regression tests cover default/configured invitation values, anonymous and signed-token requests, disabled claim methods, multipart upload rejection without file writes and privilege injection across registration families. These dependency-free tests do not establish a real authenticated database identity.

Added one real-service test using a registered citizen and legacy guest fixture, verifying denied requests leave identities and guest ownership unchanged and inventory reads preserve the record. It has NOT run. Together with B04, 23 real-service cases remain pending.

Required before closing B05:
1. Run `npm run test:api:isolated` with accessible Docker engine and verify all 23 cases and guarded cleanup. This session cannot access Docker's engine pipe; earlier B02/B03 container checks also remain pending.
2. Add and run dedicated disposable replica-set provisioning tests: successful User and Admin creation with hashed passwords and matching audit records; duplicate refusal; stale/held audit refusal; forced audit-write failure rolling back account creation; concurrent provisioning behavior; unsupported transaction refusal. Pure input tests do not prove database atomicity.
3. Perform an authorized existing-account and legacy-guest inventory review, preserve evidence, and resolve suspicious/default-seeded identities. No live inventory or provisioning was performed in this task.
4. Complete B01 credential rotation/operator baseline and B04 service validation.

Public complaint lookup still exposes legacy complaint details; B09 owns its authorization/privacy changes. Existing credentials and tokens were not rotated or revoked. B05 does not certify beta readiness for 500 users.

## Next story

B06: canonical identity, consistent token claims and session revocation, with migration safeguards and contract tests. Start with an identity/consumer map and an explicit migration design; do not silently merge User and Admin records.

