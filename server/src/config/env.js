/**
 * Environment Configuration Loader
 * MUST be imported first before any other modules
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server root
const result = dotenv.config({ path: join(__dirname, '../../.env') });

if (result.error && result.error.code !== 'ENOENT') {
    console.error('❌ Error loading .env file:', result.error.message);
    console.error('   Make sure .env file exists in the server directory');
} else if (!result.error) {
    console.log('✅ Environment variables loaded successfully');
}

// Export for verification
export const isEnvLoaded = !result.error;
