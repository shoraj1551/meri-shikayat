// Supply fresh test-only secrets before ESM modules import token configuration.
const { randomBytes } = require('node:crypto');
const { appendFileSync } = require('node:fs');
if (!process.env.GITHUB_ENV) {
    throw new Error('prepare-ci-env runs only inside GitHub Actions with GITHUB_ENV set.');
}
for (const key of ['JWT_SECRET', 'SESSION_SECRET']) {
    const value = randomBytes(64).toString('hex');
    console.log(`::add-mask::${value}`);
    appendFileSync(process.env.GITHUB_ENV, `${key}=${value}\n`);
}
