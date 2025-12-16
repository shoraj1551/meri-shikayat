/**
 * SMS Service
 * Handles sending SMS using Fast2SMS
 */

import fast2sms from 'fast-two-sms';

/**
 * Send OTP via SMS
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Response object
 */
export async function sendOTPSMS(phone, otp) {
    // Check if SMS is configured
    if (!process.env.FAST2SMS_API_KEY) {
        console.log(`📱 SMS not configured. OTP for ${phone}: ${otp}`);
        return { success: true, messageId: 'demo-mode' };
    }

    try {
        const message = `Your Meri Shikayat verification OTP is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

        const response = await fast2sms.sendMessage({
            authorization: process.env.FAST2SMS_API_KEY,
            message: message,
            numbers: [phone]
        });

        if (response.return) {
            console.log('✅ SMS sent successfully:', response.message_id);
            return {
                success: true,
                messageId: response.message_id,
                response: response
            };
        } else {
            console.error('❌ SMS sending failed:', response);
            throw new Error(response.message || 'Failed to send SMS');
        }
    } catch (error) {
        console.error('❌ Error sending SMS:', error);
        throw new Error('Failed to send SMS: ' + error.message);
    }
}

/**
 * Send verification success SMS
 * @param {string} phone - 10-digit phone number
 * @param {string} firstName - User's first name
 */
export async function sendVerificationSuccessSMS(phone, firstName) {
    if (!process.env.FAST2SMS_API_KEY) {
        console.log(`📱 SMS not configured. Verification success for ${phone}`);
        return { success: true, messageId: 'demo-mode' };
    }

    try {
        const message = `Hi ${firstName}, your phone number has been successfully verified on Meri Shikayat. Welcome aboard!`;

        const response = await fast2sms.sendMessage({
            authorization: process.env.FAST2SMS_API_KEY,
            message: message,
            numbers: [phone]
        });

        console.log('✅ Verification success SMS sent');
        return { success: true, messageId: response.message_id };
    } catch (error) {
        console.error('❌ Error sending verification SMS:', error);
        // Don't throw error for confirmation messages
        return { success: false };
    }
}

/**
 * Test SMS configuration
 */
export async function testSMSConfig() {
    if (!process.env.FAST2SMS_API_KEY) {
        console.warn('⚠️  SMS service not configured. Set FAST2SMS_API_KEY in .env');
        return false;
    }

    console.log('✅ SMS service is configured');
    return true;
}
