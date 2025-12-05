import {
    initPasswordToggle,
    initPasswordStrength,
    initPasswordRequirements
} from '../utils/form-utils.js';

export function renderForgotPasswordResetPage() {
    const app = document.getElementById('app');

    const otpVerified = sessionStorage.getItem('otpVerified');
    if (!otpVerified) {
        window.router.navigate('/forgot-password');
        return;
    }

    const identifier = sessionStorage.getItem('resetIdentifier');

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <h2 class="auth-title">Reset Your Password</h2>
                    <p class="auth-subtitle">Enter your new password for <strong>${identifier}</strong></p>
                    
                    <form id="resetPasswordForm" class="auth-form">
                        <div class="form-group">
                            <label for="password">New Password *</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-input" 
                                    placeholder="Create a strong password"
                                    autocomplete="new-password"
                                    required
                                    minlength="8"
                                />
                                <button type="button" class="password-toggle" id="togglePassword" tabindex="-1" title="Show password">
                                    <span class="toggle-icon">👁️</span>
                                </button>
                            </div>
                            <div id="passwordStrength" style="display: none; margin-top: 8px;">
                                <div class="password-strength">
                                    <div class="password-strength-bar"></div>
                                </div>
                                <div class="password-strength-text"></div>
                            </div>
                            <div class="password-requirements" id="passwordRequirements">
                                <small>Password must contain:</small>
                                <ul>
                                    <li>At least 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One number</li>
                                    <li>One special character</li>
                                </ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password *</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    class="form-input" 
                                    placeholder="Re-enter your password"
                                    autocomplete="new-password"
                                    required
                                />
                                <button type="button" class="password-toggle" id="toggleConfirmPassword" tabindex="-1" title="Show password">
                                    <span class="toggle-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block" id="resetBtn">
                            <span class="btn-text">Reset Password</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Resetting...
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Initialize password features
    initPasswordToggle('password', 'togglePassword');
    initPasswordToggle('confirmPassword', 'toggleConfirmPassword');
    initPasswordStrength('password', 'passwordStrength');
    initPasswordRequirements('password', 'passwordRequirements');

    // Handle form submission
    const form = document.getElementById('resetPasswordForm');
    const resetBtn = document.getElementById('resetBtn');
    const btnText = resetBtn.querySelector('.btn-text');
    const btnLoader = resetBtn.querySelector('.btn-loader');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMsg = document.getElementById('errorMessage');

        errorMsg.style.display = 'none';

        // Validate passwords match
        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match';
            errorMsg.style.display = 'block';
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            errorMsg.textContent = 'Password must be at least 8 characters';
            errorMsg.style.display = 'block';
            return;
        }

        // Show loading
        resetBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Simulate password reset
        setTimeout(() => {
            // Clear session data
            sessionStorage.removeItem('resetIdentifier');
            sessionStorage.removeItem('resetOTP');
            sessionStorage.removeItem('otpExpiry');
            sessionStorage.removeItem('otpVerified');

            // Show success and redirect
            alert('✅ Password reset successful!\n\nYou can now login with your new password.');
            window.router.navigate('/login');
        }, 1500);
    });
}
