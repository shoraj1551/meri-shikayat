# B02 — Reproducible installation and build foundation

Status: implemented and committed locally; Windows validation passed; Linux/container validation blocked by environment/integration access.
Working branch: codex/beta-foundation. Baseline source: 65d80f6.
This story does not certify beta readiness or repair B03/B04 application behavior.

## Toolchain

| Component | Selection | Verification |
| --- | --- | --- |
| Node | 24.19.0, exact | Local install/build and native image smoke passed |
| npm | 11.11.0, exact | Clean workspace install with lockfile v3 passed |
| Web | Existing Vite 5.4.21 from lockfile | 201 modules compiled; generated assets/compression verified |
| API | Existing Express/Mongoose/Jest dependencies, locked | 130 source files pass syntax checks; native image runtime smoke passed |
| Native mobile | Separate Android/iOS app planned in B15 | Not installed or certified by B02; select SDK and validate both platforms there |

Node 24 is used as the shared runtime baseline. No mobile SDK compatibility claim is made until B15.
Source references: [Node releases](https://nodejs.org/en/about/previous-releases),
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci),
[Expo SDK reference](https://docs.expo.dev/versions/latest/).

## Setup and repeatable commands

Select Node from `.node-version`, then install the pinned npm:

```sh
npm install --global npm@11.11.0
npm ci
npm run check:toolchain
npm run test:tooling
npm run build-client
```

Always install from the repository root. One root package-lock.json covers client and server.
Do not generate server/client lockfiles. After intentionally changing dependencies, run npm install
with the pinned toolchain, review the manifest and lockfile diff, and validate npm ci again.

For the server test launcher:

```sh
npm test --workspace server -- --runTestsByPath src/__tests__/utils/pagination.test.js --runInBand
```

That selected existing suite currently has 10 passing and 3 failing cases because the ESM tests
reference jest without importing it. This is a B04 baseline finding, not a passing test result.
Do not run the entire integration suite against any existing database before B04's isolated
test database guard is installed.

The API is plain JavaScript without a compilation build. Image construction, source syntax,
dependency loading and eventual B03 startup checks are distinct forms of validation.

## What changed

- Exact Node/npm pins and an actionable preinstall guard; root lockfile is now version-controlled.
- Workspace-aware install/build/test commands; Jest resolves from the server workspace rather
  than assuming server/node_modules exists.
- Web production build loads the plain JavaScript Vite config natively under Node. This avoids
  esbuild walking inaccessible ancestor directories merely to bundle configuration on Windows;
  the same plugins, root, minifier and production options remain in use.
- Post-build verification checks generated HTML asset references and decompresses emitted
  gzip/Brotli assets to confirm their content matches the original files.
- API production/development Dockerfiles use root manifests/lockfile, explicit Node/npm versions
  and the root build context. The production runtime copies the server dependency workspace.
- Docker ignore rules exclude local env files, dependencies, uploads and diagnostic outputs.
- Compose requires an explicit random JWT_SECRET rather than an insecure fallback.
- GitHub Actions now includes clean Windows/Linux install/build jobs and both API image builds.
  Existing application test/lint/security behavior outside B02 remains tracked by B04/B28/B33.
- CI generates fresh masked JWT/session secrets before importing test modules.

## Validation evidence

| Check | Result |
| --- | --- |
| Fresh source snapshot, no pre-existing node_modules, npm ci | Passed; 1,000 packages installed |
| Lockfile unchanged after clean installation/build | Passed |
| Tooling regression suite | 11/11 passed in working checkout |
| Clean-snapshot tooling suite before four runtime checks were added | 7/7 passed |
| Standard npm run build-client | Passed in working checkout and clean snapshot |
| Built HTML/compression integrity | 10 generated asset references; 18 compressed assets verified |
| Syntax checks for server/src JavaScript | 130 files checked; no syntax failures |
| Selected existing pagination suite | 10 pass, 3 fail (ESM jest import; B04) |
| Full application integration/E2E/load tests | Not run by B02 |
| Docker build locally | Blocked by task access to Windows Docker named pipes |
| Linux clean install and image builds | Pending; GitHub branch creation returned HTTP 403, so CI could not be started |

Lockfile SHA-256 at validation:
`94bd9f35d68db7df16991c87c3f91cfbe55e4bd6bd4b7949de70cb59dbef84d5`.

## Container verification

From the repository root, on a machine/runner with Docker engine access:

```sh
docker build -f server/Dockerfile -t meri-shikayat-api:b02 .
docker build -f server/Dockerfile.dev -t meri-shikayat-api:b02-dev .
```

Building an image is not proof that the production API listens. The known production
bootstrap guard is B03 and is deliberately recorded rather than silently marked fixed here.

For local Compose, generate a random 128-character hexadecimal JWT secret in your environment
and run `docker compose up --build`. Do not reuse CI secrets or commit credentials.
The development image must be rebuilt after dependency changes; only server/src is bind-mounted.

## Follow-up and completion rule

B02 can close when its clean Linux install and both image builds pass in addition to the Windows
evidence. B03 extracts testable app creation and fixes production startup; B04 repairs/isolate-tests
the legacy suite. Both need separate regression evidence.

Local implementation commit: e23db2e (followed by this evidence update).
Docker Desktop is running, but this task cannot access docker_engine or dockerDesktopLinuxEngine.
The permission request tool cannot represent the named-pipe path; granting Docker configuration
read access did not resolve the engine connection.
Git push also lacked a usable credential, and the connected GitHub app rejected branch creation
with HTTP 403 (Resource not accessible by integration). No remote branch or draft PR was created.
Run the container commands above from a normal terminal with Docker access, or provide a GitHub
connection with write access to this repository so the configured Linux CI checks can run.

Existing dependency warnings (including Multer 1.x, archived csurf and ESLint 8) remain explicit
upgrade/security backlog items. Pinning a dependency does not make it secure.
