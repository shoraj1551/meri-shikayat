/**
 * Verify Account Page
 * Email and Phone OTP Verification
 */

import { verificationService } from '../api/verification.service.js';
import { createOTPInput, addOTPStyles } from '../components/otp-input.js';

let emailOTPComponent = null;
let phoneOTPComponent = null;
let verificationData = null;

export async function renderVerifyAccountPage() {
    const app = document.getElementById('app');

    // Add OTP styles
    addOTPStyles();

    // Show loading
    app.innerHTML = `
        <div class="container">
            <div class="loading-spinner">Loading...</div>
        </div>
    `;

    try {
        // Fetch verification status
        const response = await verificationService.getStatus();
        verificationData = response.data;

        app.innerHTML = generateVerificationHTML();
        initializeEventListeners();
    } catch (error) {
        console.error('Error loading verification page:', error);
        app.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h3>😕 Error Loading Verification</h3>
                    <p>Please try again or contact support.</p>
                    <button class="btn btn-primary" onclick="window.router.navigate('/dashboard')">Go to Dashboard</button>
                </div>
            </div>
        `;
    }
}

function generateVerificationHTML() {
    const { email, phone, verificationStatus, requiresBoth, userType } = verificationData;

    const emailVerified = verificationStatus.email;
    const phoneVerified = verificationStatus.phone;
    const allVerified = requiresBoth ? (emailVerified && phoneVerified) : (emailVerified || phoneVerified);

    return `
        <div class="verify-account-page">
            <div class="container">
                <div class="verify-header">
                    <button class="back-btn" onclick="window.router.navigate('/dashboard')">
                        ← Back to Dashboard
                    </button>
                    <h1>🔐 Verify Your Account</h1>
                    <p class="verify-subtitle">
                        ${requiresBoth
            ? 'Please verify both your email and phone number to activate your account.'
            : 'Please verify your email or phone number to activate your account.'}
                    </p>
                </div>

                ${allVerified ? `
                    <div class="success-card">
                        <div class="success-icon">✅</div>
                        <h2>Account Verified!</h2>
                        <p>Your account has been successfully verified.</p>
                        <button class="btn btn-primary" onclick="window.router.navigate('/dashboard')">
                            Go to Dashboard
                        </button>
                    </div>
                ` : `
                    <div class="verification-cards">
                        ${email ? `
                            <div class="verification-card ${emailVerified ? 'verified' : ''}">
                                <div class="card-header">
                                    <div class="icon-badge">📧</div>
                                    <div>
                                        <h3>Email Verification</h3>
                                        <p class="masked-value">${email}</p>
                                    </div>
                                    ${emailVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                                </div>

                                ${!emailVerified ? `
                                    <div class="card-body">
                                        <div id="email-otp-section" class="otp-section hidden">
                                            <p class="instruction">Enter the 6-digit OTP sent to your email</p>
                                            <div id="email-otp-input"></div>
                                            <div id="email-error" class="error-text hidden"></div>
                                            <div class="otp-actions">
                                                <button id="verify-email-btn" class="btn btn-primary" disabled>
                                                    Verify Email
                                                </button>
                                                <button id="resend-email-btn" class="btn btn-outline" disabled>
                                                    Resend OTP <span id="email-timer"></span>
                                                </button>
                                            </div>
                                        </div>
                                        <button id="send-email-otp-btn" class="btn btn-primary btn-block">
                                            Send OTP to Email
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${phone ? `
                            <div class="verification-card ${phoneVerified ? 'verified' : ''}">
                                <div class="card-header">
                                    <div class="icon-badge">📱</div>
                                    <div>
                                        <h3>Phone Verification</h3>
                                        <p class="masked-value">${phone}</p>
                                    </div>
                                    ${phoneVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                                </div>

                                ${!phoneVerified ? `
                                    <div class="card-body">
                                        <div id="phone-otp-section" class="otp-section hidden">
                                            <p class="instruction">Enter the 6-digit OTP sent to your phone</p>
                                            <div id="phone-otp-input"></div>
                                            <div id="phone-error" class="error-text hidden"></div>
                                            <div class="otp-actions">
                                                <button id="verify-phone-btn" class="btn btn-primary" disabled>
                                                    Verify Phone
                                                </button>
                                                <button id="resend-phone-btn" class="btn btn-outline" disabled>
                                                    Resend OTP <span id="phone-timer"></span>
                                                </button>
                                            </div>
                                        </div>
                                        <button id="send-phone-otp-btn" class="btn btn-primary btn-block">
                                            Send OTP to Phone
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>

                    ${!requiresBoth && !allVerified ? `
                        <div class="info-box">
                            <strong>ℹ️ Note:</strong> As a general user, you only need to verify one contact method (email or phone).
                            You can skip the other if you prefer.
                        </div>
                    ` : ''}
                `}
            </div>
        </div>
    `;
}

function initializeEventListeners() {
    const { verificationStatus } = verificationData;

    // Email verification
    if (!verificationStatus.email) {
        const sendEmailBtn = document.getElementById('send-email-otp-btn');
        if (sendEmailBtn) {
            sendEmailBtn.addEventListener('click', handleSendEmailOTP);
        }
    }

    // Phone verification
    if (!verificationStatus.phone) {
        const sendPhoneBtn = document.getElementById('send-phone-otp-btn');
        if (sendPhoneBtn) {
            sendPhoneBtn.addEventListener('click', handleSendPhoneOTP);
        }
    }
}

async function handleSendEmailOTP() {
    const btn = document.getElementById('send-email-otp-btn');
    const section = document.getElementById('email-otp-section');
    const errorDiv = document.getElementById('email-error');

    try {
        btn.disabled = true;
        btn.textContent = 'Sending...';
        errorDiv.classList.add('hidden');

        const response = await verificationService.sendEmailOTP();

        // Hide send button, show OTP section
        btn.classList.add('hidden');
        section.classList.remove('hidden');

        // Create OTP input
        emailOTPComponent = createOTPInput('email-otp-input', (otp) => {
            document.getElementById('verify-email-btn').disabled = false;
        });

        // Setup verify button
        document.getElementById('verify-email-btn').addEventListener('click', handleVerifyEmail);

        // Setup resend button with timer
        startResendTimer('email', 120); // 2 minutes

        showToast('success', response.message || 'OTP sent to your email!');
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Send OTP to Email';
        showError(errorDiv, error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
}

async function handleSendPhoneOTP() {
    const btn = document.getElementById('send-phone-otp-btn');
    const section = document.getElementById('phone-otp-section');
    const errorDiv = document.getElementById('phone-error');

    try {
        btn.disabled = true;
        btn.textContent = 'Sending...';
        errorDiv.classList.add('hidden');

        const response = await verificationService.sendPhoneOTP();

        // Hide send button, show OTP section
        btn.classList.add('hidden');
        section.classList.remove('hidden');

        // Create OTP input
        phoneOTPComponent = createOTPInput('phone-otp-input', (otp) => {
            document.getElementById('verify-phone-btn').disabled = false;
        });

        // Setup verify button
        document.getElementById('verify-phone-btn').addEventListener('click', handleVerifyPhone);

        // Setup resend button with timer
        startResendTimer('phone', 120); // 2 minutes

        showToast('success', response.message || 'OTP sent to your phone!');
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Send OTP to Phone';
        showError(errorDiv, error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
}

async function handleVerifyEmail() {
    const btn = document.getElementById('verify-email-btn');
    const errorDiv = document.getElementById('email-error');
    const otp = emailOTPComponent.getValue();

    if (otp.length !== 6) {
        showError(errorDiv, 'Please enter a valid 6-digit OTP');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        errorDiv.classList.add('hidden');
        emailOTPComponent.disable();

        const response = await verificationService.verifyEmail(otp);

        showToast('success', '✅ Email verified successfully!');

        // Reload page to show updated status
        setTimeout(() => {
            renderVerifyAccountPage();
        }, 1500);
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Verify Email';
        emailOTPComponent.enable();
        emailOTPComponent.clear();

        const message = error.response?.data?.message || 'Verification failed. Please try again.';
        const attemptsLeft = error.response?.data?.attemptsLeft;
        showError(errorDiv, attemptsLeft ? `${message} (${attemptsLeft} attempts left)` : message);
    }
}

async function handleVerifyPhone() {
    const btn = document.getElementById('verify-phone-btn');
    const errorDiv = document.getElementById('phone-error');
    const otp = phoneOTPComponent.getValue();

    if (otp.length !== 6) {
        showError(errorDiv, 'Please enter a valid 6-digit OTP');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        errorDiv.classList.add('hidden');
        phoneOTPComponent.disable();

        const response = await verificationService.verifyPhone(otp);

        showToast('success', '✅ Phone verified successfully!');

        // Reload page to show updated status
        setTimeout(() => {
            renderVerifyAccountPage();
        }, 1500);
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Verify Phone';
        phoneOTPComponent.enable();
        phoneOTPComponent.clear();

        const message = error.response?.data?.message || 'Verification failed. Please try again.';
        const attemptsLeft = error.response?.data?.attemptsLeft;
        showError(errorDiv, attemptsLeft ? `${message} (${attemptsLeft} attempts left)` : message);
    }
}

function startResendTimer(type, seconds) {
    const resendBtn = document.getElementById(`resend-${type}-btn`);
    const timerSpan = document.getElementById(`${type}-timer`);
    let remaining = seconds;

    resendBtn.disabled = true;

    const interval = setInterval(() => {
        remaining--;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerSpan.textContent = `(${mins}:${secs.toString().padStart(2, '0')})`;

        if (remaining <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            timerSpan.textContent = '';

            // Setup resend handler
            resendBtn.addEventListener('click', () => {
                if (type === 'email') {
                    handleSendEmailOTP();
                } else {
                    handleSendPhoneOTP();
                }
            });
        }
    }, 1000);
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

function showToast(type, message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
