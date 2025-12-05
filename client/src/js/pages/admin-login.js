
import { adminService } from '../api/admin.service.js';
import {
    initPasswordToggle,
    initIdentifierValidation,
    isValidEmail,
    isValidPhone,
    showError,
    hideError
} from '../utils/form-utils.js';

export function renderAdminLoginPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page admin-theme">
            <div class="auth-container">
                <div class="auth-card admin-card">
                    <div class="auth-header-actions">
                        <div class="admin-badge-header">ADMIN PORTAL</div>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/login')" title="Switch to User Login">
                            <i class="icon">👤</i> User Login
                        </button>
                    </div>
                    <h2 class="auth-title">Admin Login</h2>
                    <p class="auth-subtitle">Secure access for authorized personnel only</p>
                    
                    <form id="adminLoginForm" class="auth-form" autocomplete="on">
                        <div class="form-group">
                            <label for="identifier">Email or Phone</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                class="form-input" 
                                placeholder="Enter email or phone"
                                autocomplete="username"
                                required
                            />
                            <span class="input-icon success-icon" style="display: none;">✓</span>
                            <span class="input-icon error-icon" style="display: none;">✗</span>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-input" 
                                    placeholder="Enter your password"
                                    autocomplete="current-password"
                                    required
                                />
                                <button type="button" class="password-toggle" id="togglePassword" tabindex="-1" title="Show password">
                                    <span class="toggle-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-row" style="justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe" name="rememberMe">
                                <span>Remember me</span>
                            </label>
                            <a href="/forgot-password" class="forgot-password-link">Forgot Password?</a>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block admin-btn" id="adminLoginBtn">
                            <span class="btn-text">Login to Dashboard</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Authenticating...
                            </span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        New admin? 
                        <a href="/admin/register" class="auth-link admin-link">Request Access</a>
                    </p>
                    
                    <div class="admin-footer-link">
                        <a href="/login" class="text-muted">Return to User Login</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize form enhancements
    initPasswordToggle('password', 'togglePassword');
    initIdentifierValidation('identifier');

    // Handle form submission
    const form = document.getElementById('adminLoginForm');
    const submitBtn = document.getElementById('adminLoginBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    let isOtpStep = false;
    let adminId = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifierInput = document.getElementById('identifier');
        const passwordInput = document.getElementById('password');

        try {
            hideError('errorMessage');
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            if (!isOtpStep) {
                // Step 1: Login with credentials
                const identifier = identifierInput.value.trim().toLowerCase();
                const password = passwordInput.value;
                const rememberMe = document.getElementById('rememberMe').checked;

                const response = await adminService.login({ identifier, password, rememberMe });

                if (response.success && response.requireOtp) {
                    // Switch to OTP step
                    isOtpStep = true;
                    adminId = response.adminId;

                    // Hide credentials fields
                    form.querySelector('.form-group:nth-child(1)').style.display = 'none';
                    form.querySelector('.form-group:nth-child(2)').style.display = 'none';
                    form.querySelector('.form-row').style.display = 'none';

                    // Show OTP field
                    let otpGroup = document.getElementById('otpGroup');
                    if (!otpGroup) {
                        otpGroup = document.createElement('div');
                        otpGroup.id = 'otpGroup';
                        otpGroup.className = 'form-group';
                        otpGroup.style.animation = 'slideIn 0.3s ease';
                        otpGroup.innerHTML = `
                            <label for="otp">Enter OTP</label>
                            <input 
                                type="text" 
                                id="otp" 
                                name="otp" 
                                class="form-input" 
                                placeholder="Enter 6-digit OTP"
                                maxlength="6"
                                autocomplete="one-time-code"
                                required
                            />
                            <p class="form-hint">Check your server console for the OTP (Simulation)</p>
                        `;
                        const errorMsg = document.getElementById('errorMessage');
                        form.insertBefore(otpGroup, errorMsg);
                    }

                    btnText.textContent = 'Verify OTP';
                    submitBtn.disabled = false;
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';
                    document.getElementById('otp').focus();
                }
            } else {
                // Step 2: Verify OTP
                btnText.textContent = 'Verifying...';
                const otp = document.getElementById('otp').value.trim();

                const response = await adminService.verifyOtp(adminId, otp);

                if (response.success) {
                    window.location.href = '/admin/dashboard';
                }
            }
        } catch (error) {
            showError('errorMessage', error.response?.data?.message || 'Authentication failed. Please try again.');
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            btnText.textContent = isOtpStep ? 'Verify OTP' : 'Login to Dashboard';
        }
    });

    // Handle links
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.router.navigate(href);
        });
    });
}
