/**
 * Login page component
 */

import { authService } from '../api/auth.service.js';

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


    // Password toggle functionality
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.querySelector('.toggle-icon').textContent = type === 'password' ? '👁️' : '🔒';
        toggleBtn.title = type === 'password' ? 'Show password' : 'Hide password';
    });

    // Real-time validation for identifier
    const identifierInput = document.getElementById('identifier');
    const successIcon = document.querySelector('.success-icon');
    const errorIcon = document.querySelector('.error-icon');

    identifierInput.addEventListener('input', () => {
        const value = identifierInput.value.trim();
        const isEmail = /^\S+@\S+\.\S+$/.test(value);
        const isPhone = /^[0-9]{10}$/.test(value);

        if (value.length === 0) {
            successIcon.style.display = 'none';
            errorIcon.style.display = 'none';
            identifierInput.classList.remove('valid', 'invalid');
        } else if (isEmail || isPhone) {
            successIcon.style.display = 'block';
            errorIcon.style.display = 'none';
            identifierInput.classList.add('valid');
            identifierInput.classList.remove('invalid');
        } else {
            successIcon.style.display = 'none';
            errorIcon.style.display = 'block';
            identifierInput.classList.add('invalid');
            identifierInput.classList.remove('valid');
        }
    });

    // Handle form submission
    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = identifierInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorMessage = document.getElementById('errorMessage');

        // Client-side validation
        const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
        const isPhone = /^[0-9]{10}$/.test(identifier);

        if (!isEmail && !isPhone) {
            errorMessage.textContent = 'Please provide a valid email or 10-digit phone number';
            errorMessage.style.display = 'block';
            identifierInput.focus();
            return;
        }

        try {
            // Show loading state
            errorMessage.style.display = 'none';
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const response = await authService.login({ identifier, password, rememberMe });

            if (response.success) {
                // Check if location is set
                if (!response.data.isLocationSet) {
                    // Redirect to location setup
                    window.router.navigate('/location-setup');
                } else {
                    // Redirect to dashboard
                    window.router.navigate('/dashboard');
                }
            }
        } catch (error) {
            errorMessage.textContent = error.response?.data?.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';

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
