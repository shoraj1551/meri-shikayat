const { randomBytes } = require('node:crypto');
// setupFiles run before ESM test imports. Never load .env or .env.test here.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.NO_UPDATE_NOTIFIER = '1';
process.env.JWT_SECRET = randomBytes(64).toString('hex');
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '30d';
process.env.JWT_EXPIRE = '7d';
process.env.REDIS_REQUIRED = 'false';
for (const key of ['JWT_SECRET_PREVIOUS', 'EMAIL_USER', 'EMAIL_PASSWORD', 'SMTP_PASSWORD',
    'FAST2SMS_API_KEY', 'TWILIO_AUTH_TOKEN', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY',
    'REDIS_PASSWORD', 'REDIS_URL']) delete process.env[key];
// Unit tests cannot accidentally pick up a configured application database.
if (process.env.MS_TEST_MODE !== 'integration') process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unit_no_database';
