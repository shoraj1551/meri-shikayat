# B04 — Isolated API test harness

Date: 2026-09-05

Branch: `codex/api-test-harness`, based on B03 commit `c1b4bfa`.

Status: **In validation** — implementation and local database-free checks pass; real MongoDB/Redis integration, cross-worker isolation and driver teardown still require execution.

## Outcome

The old test setup could inherit an application `MONGODB_URI` and delete every collection after a test. That path has been removed. Tests now have an explicit environment, separate discovery/commands, disposable database identities and ownership-checked cleanup.

No application database was connected to or cleared during this work. No deployment, remote push or PR was made. Docker was checked again: this session still receives permission denied for its named pipe, despite the engine running.

## Commands from the repository root

Use B02's pinned Node 24.19.0 and npm 11.11.0.

| Command | Scope / prerequisites |
| --- | --- |
| `npm run test:api` | Safe default: 53 Jest unit tests, then 31 native validation/fixture/harness tests. No database service needed. |
| `npm run test:harness --workspace server` | Native harness/fixture safety tests, excluding the legacy validation utility suite. |
| `npm run test:coverage --workspace server` | All database-free API checks; Jest LCOV/HTML coverage in `server/coverage/unit/`. Native checks are not included in that LCOV. |
| `npm run test:watch --workspace server` | Watch the Jest-only unit portion. |
| `npm run test:api:isolated` | Creates fresh MongoDB and Redis Docker containers on random loopback-only ports, runs integration tests, then removes its own containers/anonymous volumes. Requires accessible Docker. |
| `npm run test:api:integration` | Runs the real-service tests against explicitly supplied disposable loopback services. Never use application services. |
| `npm run test:bootstrap` | B03's separate HTTP/process lifecycle checks. |
| `npm run test:tooling` | B02's build/toolchain checks. |

For CI or already-created **disposable** services, supply:

```text
TEST_MONGODB_BASE_URI=mongodb://127.0.0.1:27017/
TEST_REDIS_BASE_URI=redis://127.0.0.1:6379/0
```

The Mongo base must have no database name. Ports must be explicit; only literal loopback hosts are accepted. Credentials, query options, multi-host/SRV connections, remote hosts and production-like database names are rejected. An inherited `MONGODB_URI` makes the integration launcher fail before connecting; unset it only in the dedicated test terminal, without changing production configuration. No `.env` or `.env.test` file is loaded.

The Docker helper uses no host-mounted database volumes. Its uniquely named containers are disposable, and their test data is intentionally removed after the run. Existing containers, databases, Docker images and application files are not removed. If teardown fails, the command reports failure and the owned resource prefix; it does not silently pass.

## Test architecture

- `scripts/run-api-tests.cjs` composes unit/harness/integration stages and propagates failures. Unit tests are the default. Integration tests run in separate Node test-file processes with concurrency two.
- `server/jest.config.js` discovers only Jest-compatible unit suites, initializes secrets before ESM imports, restores mocks/timers and excludes operational scripts.
- `server/test/harness/environment.cjs` creates a strong throwaway JWT secret, fixes test configuration, removes provider credentials and disables a legacy SMS package's update notifier.
- `server/test/harness/identity.mjs` derives exact database names and Redis prefixes from a random run ID, worker identity and suite hash. Operations validate the current run and target, not merely a name containing “test”.
- `integration.mjs` connects only to its allocated database, claims an ownership marker, creates the real app, clears only owned collections between tests, and drops its owned database before disconnecting.
- `scoped-redis.mjs` exposes namespaced fixture operations. Cleanup checks the lease and prefix; it never uses FLUSHDB or FLUSHALL.
- Pure unit TCP connections are forbidden. Fake connections/Redis maps are used to test the cleanup guards themselves; API integration tests do not mock authentication, controllers, Mongoose models, audit writes or rate-limit middleware.

Real API tests use a test-only trusted-proxy setting and a distinct synthetic client IP per test so existing singleton in-memory limiter counters cannot leak between cases. Rate limiting remains active and a five-failure login-limit assertion is included. This fixture does not change production proxy trust.

Application Redis is deliberately disconnected in these API tests; real Redis is exercised through the namespaced isolation fixture. These checks do **not** certify distributed application rate limiting, which remains B11.

## Safety and teardown

Database names have the shape `ms_test_<run>_w<worker>_s<suite>`. Redis prefixes have the matching `ms_test:<run>:w<worker>:s<suite>:` shape.

Before cleanup, the harness verifies test mode, the current run ID, exact namespace derivation, loopback host/port, the connected database name and a matching ownership document with a random lease. A database with existing collections cannot be claimed. The ownership collection is preserved between tests. The old `clearDatabase()` helper now requires this identity and cannot bypass the guard.

Redis ownership is claimed with NX and a one-hour TTL. Fixture keys also have TTLs. Cleanup refuses missing/changed ownership and only deletes matching keys. Teardown attempts both datastore cleanups and disconnects even after failures.

The real isolation test starts two child workers concurrently, writes the same logical keys to each, verifies independent values, clears worker one, confirms worker two is unchanged, then requires both children to exit naturally with status zero. **That real-service test has not run here.** Database-free suites did exit without the earlier forced-worker-exit warning; no force-exit success flag was introduced.

Automatic model collection/index creation is disabled before connection to prevent initialization racing ownership claims. Collections are explicitly created after the claim. Index correctness and conflicting legacy index definitions remain B10; this harness is not index-migration validation.

## Repairs to existing tests

The 21 existing API scenarios were rewritten against the real app factory and retained as current-contract checks; a separate cross-worker isolation test brings the real-service total to **22**. They are not being skipped to obtain a green unit result.

| Stale assumption | Current tested contract |
| --- | --- |
| Hand-built `/api/auth` apps | Actual app factory and `/api/v1` mounts |
| Default listening app import / nonexistent connectDB exports | Explicit app/lifecycle harness |
| `body.user` or `body.data.user` after registration | Top-level `token` and `data` user fields |
| Login payload uses `email` | Login payload uses `identifier` |
| `/auth/profile` | `/auth/me` |
| PATCH complaint status | PUT `/admin/complaints/:id/status` |
| Unified User admin fixture authenticates at legacy Admin routes | Actual Admin model and its current bearer-token contract |
| Ordinary User token yields 403 at Admin route | Current middleware yields 401 because it finds no Admin |
| Registration sanitizes HTML names | Mounted validator rejects them with 400; the separate legacy utility still has sanitizer tests |
| Complaint category is required | Current model permits omission; the mismatch remains an explicit B11 validation decision |

Fixture checks against the real mounted validators and Mongoose validation run without a database. Token helpers now use the API's actual `id` claim; the token service's separate `userId` contract is still visible and belongs to B06. No token policy was changed.

Jest globals/import paths were repaired. The previously empty expired-token test now advances time and checks rejection. The test expecting distinct same-second access tokens now advances the issuance clock; refresh-token randomness remains tested.

A real circuit-breaker leak was fixed: its deadline timer is cleared after success, failure or timeout. Regression tests assert no timer remains. This was the only production behavior change in B04.

The old always-true placeholder test remains in source but is not counted as a quality gate. Operational login/readiness scripts are also excluded from automated unit discovery.

## Local results

| Check | Evidence |
| --- | --- |
| API unit/validation/fixture/harness | **84 passed**: 53 Jest + 31 native |
| B03 bootstrap suite | **23 passed** |
| B02 tooling suite | **11 passed** |
| Distinct passing automated tests | **118**; repeat coverage runs are not counted twice |
| Deliberately failing regression | Real pagination assertion expects 999 instead of 2; the normal API launcher returns 1. Harness verifies the assertion failure, not merely missing test discovery. |
| Unit coverage generation | Passed. Baseline Jest-only overall statement coverage: **4.07%**. This is not whole-product coverage or beta readiness. |
| Web build | Passed; 10 HTML references and 18 compressed assets verified |
| JavaScript syntax | 168 files checked, plus checks on subsequently edited helpers/guards |
| Workflow/manifests and whitespace | Parsed / checked |
| Lockfile | Unchanged from B02, SHA-256 `94bd9f35d68db7df16991c87c3f91cfbe55e4bd6bd4b7949de70cb59dbef84d5` |
| 22 real-service integration/isolation checks | **Pending — Docker named-pipe access denied** |
| GitHub Actions execution/publication | **Pending — local changes only** |

The first safe baseline exposed ESM Jest globals, bad token-service imports, incorrect fake-clock handling, a leaked circuit-breaker timer and Jest 29's inability to require the installed ESM htmlparser2 through sanitize-html. Validation and API integration use Node's native runner so the actual dependency code runs; no sanitizer mock or dependency downgrade was added.

CI now runs database-free API checks on Linux and Windows, then an independent Linux job with disposable MongoDB/Redis services for API and worker isolation. Failing test stages block downstream builds. The existing soft lint/security-scan policies remain outside this story.

## Required next action

Run `npm run test:api:isolated` from a Docker-enabled terminal with the pinned toolchain, and review all 22 results plus cleanup/exit status. Fix any integration failures before marking B04 complete. B02/B03 container acceptance is still pending too.

After those gates pass, the next implementation story is **B05 — close unsafe privileged and guest entry paths**. None of the results above authorize a 500-user beta launch yet.
