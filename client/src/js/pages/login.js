import { authService } from '../api/auth.service.js';
import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

export function renderLoginPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header-actions">
                        <a href="/" class="auth-back-link">← Back to Home</a>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/admin/login')" title="Switch to Admin Login">
                            <i class="icon">🛡️</i> Admin Login
                        </button>
                    </div>
                    <h2 class="auth-title">Welcome Back!</h2>
                    <p class="auth-subtitle">Login to access your account and manage complaints</p>
                    
                    <form id="loginForm" class="auth-form" autocomplete="on">
                        <div class="form-group">
                            <label for="identifier">
                                Email or Phone Number *
                                <span class="tooltip-trigger" data-tooltip="Enter the email or phone number you used to register" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">👤</span>
                                <input 
                                    type="text" 
                                    id="identifier" 
                                    name="identifier" 
                                    class="form-input" 
                                    placeholder="yourname@example.com or 9876543210"
                                    autocomplete="username"
                                    required
                                />
                                <span class="validation-icon"></span>
                            </div>
                            <small class="form-hint-enhanced">
                                <span class="hint-icon">💡</span>
                                <span><strong>Example:</strong> rahul@gmail.com or 9876543210</span>
                            </small>
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label for="password">
                                Password *
                                <span class="tooltip-trigger" data-tooltip="Enter your account password" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">🔒</span>
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
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-row" style="justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe" name="rememberMe">
                                <span>Remember me</span>
                                <span class="tooltip-trigger" data-tooltip="Stay logged in on this device" data-tooltip-position="top" style="margin-left: 0.25rem;">?</span>
                            </label>
                            <a href="/forgot-password" class="forgot-password-link">Forgot Password?</a>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block btn-cta-main" id="loginBtn">
                            Login to Your Account
                        </button>
                    </form>

                    <p class="auth-footer">
                        Don't have an account? 
                        <a href="/register" class="auth-link">Register here</a>
                    </p>

                    <div class="auth-footer" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                        <small style="color: #999;">
                            🔒 Your data is secure and encrypted
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize tooltips
    if (window.tooltip) {
        window.tooltip.initializeTooltips();
    }

    // Initialize form validator
    const form = document.getElementById('loginForm');
    const validator = new FormValidator(form);

    // Get form elements
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // Real-time validation
    identifierInput.addEventListener('blur', () => {
        const value = identifierInput.value.trim();
        if (value) {
            // Check if it's email or phone
            const isEmail = value.includes('@');
            if (isEmail) {
                validator.validateEmail(identifierInput);
            } else {
                validator.validatePhone(identifierInput);
            }
        }
    });

    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value) {
            validator.validateRequired(passwordInput, 'Password');
        }
    });

    // Password toggle
    document.getElementById('togglePassword').addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = identifierInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate identifier
        const isEmail = identifier.includes('@');
        let isValid = false;

        if (isEmail) {
            isValid = validator.validateEmail(identifierInput);
        } else {
            isValid = validator.validatePhone(identifierInput);
        }

        const isPasswordValid = validator.validateRequired(passwordInput, 'Password');

        if (!isValid || !isPasswordValid) {
            showError('Please fix the errors above before logging in');
            return;
        }

        try {
            hideError();
            Loading.buttonLoading(loginBtn, 'Logging in...');

            const response = await authService.login({ identifier, password, rememberMe });

            if (response.success) {
                // Store authentication token based on Remember Me preference
                const token = response.token || 'demo-token-' + Date.now();
                const userData = response.data || { identifier, role: 'user' };

                if (rememberMe) {
                    // Remember Me checked: Use localStorage (persists across sessions)
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    // Remember Me unchecked: Use sessionStorage (clears on browser close)
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('user', JSON.stringify(userData));
                }

                // Show success message
                showSuccess();

                // Navigate based on user setup status
                setTimeout(() => {
                    if (!response.data.isLocationSet) {
                        window.router.navigate('/location-setup');
                    } else {
                        window.router.navigate('/dashboard');
                    }
                }, 1500);
            }
        } catch (error) {
            Loading.buttonReset(loginBtn);
            const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';

            // Enhanced error messages
            if (errorMsg.includes('not found') || errorMsg.includes('Invalid')) {
                showError('Invalid email/phone or password. Please check your credentials and try again. <a href="/forgot-password">Forgot your password?</a>');
            } else if (errorMsg.includes('locked') || errorMsg.includes('suspended')) {
                showError('Your account has been temporarily locked. Please contact support or try again later.');
            } else {
                showError(errorMsg + ' Need help? <a href="/contact">Contact support</a>');
            }
        }
    });

    // Helper functions
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.innerHTML = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.style.display = 'none';
    }

    function showSuccess() {
        const form = document.getElementById('loginForm');
        form.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✓</div>
                <h3>Login Successful!</h3>
                <p>Welcome back! Redirecting to your dashboard...</p>
                <div class="loading-state">
                    <span class="spinner"></span>
                    <span>Loading your account...</span>
                </div>
            </div>
        `;
    }

    // Handle links
    app.querySelectorAll('a').forEach(link => {
        if (!link.hasAttribute('target')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                window.router.navigate(href);
            });
        }
    });
}
