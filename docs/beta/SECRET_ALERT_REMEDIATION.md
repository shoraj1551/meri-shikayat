# MongoDB alert remediation

The current source replaces credential-shaped MongoDB examples with REPLACE_WITH_MONGODB_URI_FROM_SECRET_MANAGER. Supply an actual connection string only through protected deployment environment variables; this placeholder cannot connect to a database.

This removes unsafe examples from current files, not Git history. A repository scan is a regression check, not proof that all secrets are absent.

Operator actions still required:

1. Review each GitHub alert location and historical commit privately. Never copy the detected value into an issue, chat or log.
2. Treat any real exposed Atlas database credential as compromised. Rotate/revoke it in Atlas, update affected Vercel environment scopes securely, redeploy and verify connectivity. Coordinate this change to avoid an outage.
3. Review Atlas access/audit evidence and limit the database user's permissions. Do not connect with a leaked credential merely to test whether it works.
4. Resolve genuine alerts as revoked only after revocation is verified. Mark placeholder alerts as false positives only after confirming the complete value was never a real credential.
5. Historical redaction requires a separately coordinated history rewrite and clone/fork cleanup. Do not force-push or assume deleting the current line revokes the secret.

Three unreferenced frontend backup copies were removed: client/src/js/utils/pwa.js.bak, client/src/styles/main.css.bak and client/src/styles/main.css.backup. Active source files remain. The copies can be recovered from Git history. Reports, deployment configuration, database backup scripts and planning documents are preserved.

The existing test:tooling CI job now runs a regression check over tracked text files and reports only offending filenames. Two synthetic credential-shaped test strings are assembled at runtime to preserve their rejection/redaction coverage without publishing credential-shaped examples.

No Atlas/Vercel secrets were changed, GitHub alerts dismissed, history rewritten or deployment settings changed by this cleanup.
