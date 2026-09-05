# B03 — Testable API bootstrap and lifecycle

Date: 2026-09-05

Branch: `codex/api-bootstrap` (based on local `codex/beta-foundation`)

Status: **In validation. Implementation and local tests pass; real-container verification remains pending.**

## Outcome

The API no longer starts network connections or registers process shutdown handlers when its entrypoint is imported. Executing `server/src/index.js` now starts the HTTP/Socket.IO server in production as well as development. Vercel uses a separate lazy handler.

B02's Docker and GitHub access limitations remain open. The owner approved proceeding with B03 despite those verification limitations. No production deployment or remote PR has been made.

## Components and behavior

| Component | Responsibility |
| --- | --- |
| `server/src/app.js` | Async `createApp(options)`: middleware, health endpoints, existing API routes and error handlers. Does not connect dependencies or listen. |
| `server/src/routes/index.js` | Existing router mount registry, loaded when creating the app. |
| `server/src/runtime/dependencies.js` | MongoDB/Redis lifecycle and readiness adapters. Controllers still use existing Mongoose models; this is not a repository-layer rewrite. |
| `server/src/runtime/server.js` | Explicit connect → create app → attach Socket.IO → listen; idempotent, bounded shutdown and executable-owned process handlers. |
| `server/src/runtime/socket.js` | Socket.IO attachment. Existing room behavior retained; authorization hardening is B09. |
| `server/src/index.js` | CLI-only startup guard, environment loading before configuration-dependent modules, nonzero exit on startup failure. Named factory/runtime exports are safe to import. |
| `server/src/serverless.js` | Separate lazy Vercel handler, shared initialization promise with retry on failure, on-demand database connection, no listener or Socket.IO. |

The app parses request bodies **before** MongoDB-key sanitization. Global rate-limit state is separate for each app instance. Existing upload paths remain relative to the process working directory to match the existing upload writers; start through the server workspace script, which runs in `server/`.

The executable waits for MongoDB. Redis startup is bounded to two seconds: optional Redis can fall back; `REDIS_REQUIRED=true` makes startup fail if Redis is unavailable. Validation throws errors rather than terminating serverless/test processes. Injected deployment environment variables do not require a local `.env` file.

## Health contract

| Route | Meaning |
| --- | --- |
| `GET /api/v1/health/live` | 200 while the process can answer HTTP. No dependency connection attempt. |
| `GET /api/v1/health/ready` | 200 only while not draining, MongoDB is ready, and Redis is ready when required. Otherwise 503. |
| `GET /api/v1/health` | Compatibility URL for liveness. |
| `GET /api/health` | Deprecated compatibility URL for liveness, with deprecation headers. |

Responses use `Cache-Control: no-store`. They expose generic service/dependency states, not hostnames, database names, connection strings or tokens. Health probes bypass application request-rate limits. Database loss prevents ordinary versioned API requests from reaching controllers.

On the serverless adapter, liveness avoids database connection attempts; readiness and ordinary requests connect on demand. Required Redis is also connected on demand. Optional Redis is not initialized by that adapter, so memory-only rate limits remain a limitation until B11. Vercel does **not** host Socket.IO with this adapter.

## Shutdown contract

SIGTERM/SIGINT mark the runtime as draining, stop accepting HTTP connections, close idle connections and Socket.IO/Engine.IO transports (including incomplete namespace handshakes), let active HTTP responses finish, then close MongoDB and Redis. New app requests receive 503 during draining; readiness becomes 503.

The default shutdown budget is ten seconds. Stalled TCP connections are destroyed at the deadline. Normal signal shutdown exits 0; timeout, dependency-close failure or fatal process error exits 1. Calling `stop()` repeatedly returns the same promise. An embedding caller must act on a timeout result; the executable exits, but `stop()` does not itself kill an embedding process or forcibly cancel a hung dependency driver.

## Run and test

Use pinned Node 24.19.0 and npm 11.11.0 from B02. From the repository root:

```sh
npm ci
npm run test:tooling
npm run test:bootstrap
npm run build-client
npm start --workspace server
```

For production, set `NODE_ENV=production`, a valid `MONGODB_URI`, a strong generated `JWT_SECRET`, allowed `CORS_ORIGIN`, and optional `PORT` (default 5000) / `HOST` (default 0.0.0.0). Configure Redis and set `REDIS_REQUIRED=true` when deployment requires it. Do not copy test secrets into production.

Factory example for isolated lifecycle/routing tests:

```js
import { createApp } from './server/src/app.js';
const app = await createApp({
    database: { isReady: () => true },
    redis: { isReady: () => false },
    routes: [] // Use explicit fixture routers; omit only when testing real routes.
});
```

Tests that previously imported the default listening app from `index.js` must await `createApp` instead. Repair of the legacy Jest imports, database isolation and destructive cleanup fixtures is B04. Those integration suites were deliberately not run against configured databases.

## Verification evidence

| Check | Result |
| --- | --- |
| `npm run test:bootstrap` | **23/23 passed** locally on Windows with Node 24.19.0. |
| `npm run test:tooling` | **11/11 passed** via the pinned npm runner. |
| `npm run build-client` | Passed; 10 HTML asset references and 18 compressed assets verified. |
| JavaScript syntax checks | 152 source/test/tool files passed. |
| Workflow YAML and deployment JSON parsing | Passed. |
| Lockfile integrity | Unchanged from B02: SHA-256 `94bd9f35d68db7df16991c87c3f91cfbe55e4bd6bd4b7949de70cb59dbef84d5`. |
| Actual production container + Mongo/Redis | **Pending**: this session cannot access Docker's named pipe. |
| Native Linux SIGTERM | **Pending**. Windows test uses a child process with the registered SIGTERM event; CI uses the actual POSIX signal. |
| GitHub CI / branch publication | **Not run / not published**; existing GitHub write-access limitation remains. |

Tests exercise import-time network/listener guards, actual router construction without network I/O, health/readiness under outages and drain, parsing/sanitization, isolated global rate limits, real unauthenticated/invalid auth requests, production-mode ephemeral-port HTTP/Socket.IO, active-response drain, stalled-response cutoff, incomplete WebSocket handshakes, failed startup rollback, dependency-close errors and timeouts, signal/fatal handlers, invalid production CLI configuration, bounded Redis startup, and serverless initialization/failure recovery. Database and Redis state are simulated in this suite; it makes no real database writes.

A first local test run exposed two test-fixture mistakes (Windows URL decoding and a plain handler where Socket.IO expects an Express app); both were corrected before the passing runs. The tooling suite also correctly required execution through npm rather than direct `node --test`; the documented npm command passes.

## Remaining container acceptance check

A disposable smoke script is wired into the CI container job:

```sh
docker build -f server/Dockerfile -t meri-shikayat-api:verify .
docker build -f server/Dockerfile.dev -t meri-shikayat-api:dev-verify .
npm run test:container
```

The smoke script creates a uniquely named private Docker network, fresh MongoDB/Redis containers and the production API image. It uses a random throwaway JWT secret, no host-mounted data or exposed host ports, tests custom PORT 5081, required-dependency outages/recovery and real SIGTERM, then removes only its own containers/anonymous volumes/network. It does not remove the built images. This script has been syntax-checked, **not executed** here. Passing it is required before closing B03.

## Boundaries and next story

This is backend foundation work, not the web/mobile split (B13) and not beta-launch approval. Existing auth/privilege risks, Socket.IO room authorization, legacy test defects, distributed rate-limit issues, duplicate Mongoose index warnings and the configured email transport issue remain in their planned stories.

**Next: B04 — repair and isolate the API test harness**, beginning with a hard guard against real-database cleanup and deterministic test configuration. Keep B02/B03 container acceptance open until it can be executed.
