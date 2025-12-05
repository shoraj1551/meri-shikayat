
import { authService } from '../api/auth.service.js';
import {
    initPasswordToggle,
    initIdentifierValidation,
    isValidEmail,
    isValidPhone,
    showError,
    hideError
} from '../utils/form-utils.js';

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
                    <h2 class="auth-title">Login to Meri Shikayat</h2>
                    <p class="auth-subtitle">Enter your credentials to access your account</p>
                    
                    <form id="loginForm" class="auth-form" autocomplete="on">
                        <div class="form-group">
                            <label for="identifier">Email or Phone Number</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                class="form-input" 
                                placeholder="your@email.com or 10-digit phone"
                                autocomplete="username"
                                required
                            />
                            <small class="form-hint">Enter your email or 10-digit phone number</small>
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

                        <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                            <span class="btn-text">Login</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Logging in...
                            </span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        Don't have an account? 
                        <a href="/register" class="auth-link">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Initialize form enhancements
    initPasswordToggle('password', 'togglePassword');
    initIdentifierValidation('identifier');

    // Handle form submission
    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = identifierInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Client-side validation
        if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
            showError('errorMessage', 'Please provide a valid email or 10-digit phone number');
            identifierInput.focus();
            return;
        }

        try {
            // Show loading state
            hideError('errorMessage');
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const response = await authService.login({ identifier, password, rememberMe });

            if (response.success) {
                if (!response.data.isLocationSet) {
                    window.router.navigate('/location-setup');
                } else {
                    window.router.navigate('/dashboard');
                }
            }
        } catch (error) {
            showError('errorMessage', error.response?.data?.message || 'Login failed. Please try again.');

            // Reset button state
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Add event listener for register link
    app.querySelector('a[href="/register"]').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/register');
    });

    // Add event listener for forgot password link
    app.querySelector('.forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/forgot-password');
    });

    // Add event listener for back link
    app.querySelector('.auth-back-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/');
    });
}
