# Vercel pilot deployment preparation

The CI workflow retains Windows/Linux clean installs, frontend builds, API tests, real MongoDB/Redis integration tests and container startup checks. Docker Hub publication and echo-only staging/production deployment jobs have been removed. Container verification remains useful for a later cloud migration.

This change does not deploy an application. The actual Vercel project connection and one-project versus two-project layout still require confirmation. No Vercel environment variables, production branch, domains or secrets were changed.

Before rollout:

1. Publish the cleanup and pilot CI commits and inspect the new CI run.
2. Confirm Vercel project name(s), root directories, connected repository and production branch. Share project/deployment URLs, not credentials.
3. Confirm genuine leaked MongoDB credentials are rotated and updated in the appropriate Vercel environment scopes.
4. Validate the selected project layout against repository routing and build configuration before changing it.
5. Verify the deployed commit, homepage, static assets, SPA deep links and API liveness/readiness. Then use approved test accounts for registration/login, complaint submission, ownership checks and uploads.
6. Explicitly validate durable upload storage and realtime behavior; local filesystem persistence and the standalone Socket.IO server must not be assumed to work on the serverless entry point.

A green GitHub workflow is not proof that Vercel deployed or that production smoke tests passed. Existing optional lint/security jobs are not strengthened by this change. Keep B05 provisioning review and transaction validation open.
