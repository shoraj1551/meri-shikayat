/**
 * Verification Service
 * API calls for email and phone verification
 */

import apiClient from './client.js';

export const verificationService = {
    /**
     * Send OTP to email
     */
    async sendEmailOTP() {
        const response = await apiClient.post('/verification/send-email-otp');
        return response.data;
    },

    /**
     * Verify email with OTP
     */
    async verifyEmail(otp) {
        const response = await apiClient.post('/verification/verify-email', { otp });
        return response.data;
    },

    /**
     * Send OTP to phone
     */
    async sendPhoneOTP() {
        const response = await apiClient.post('/verification/send-phone-otp');
        return response.data;
    },

    /**
     * Verify phone with OTP
     */
    async verifyPhone(otp) {
        const response = await apiClient.post('/verification/verify-phone', { otp });
        return response.data;
    },

    /**
     * Get verification status
     */
    async getStatus() {
        const response = await apiClient.get('/verification/status');
        return response.data;
    }
};
