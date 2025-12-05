import { authService } from '../api/auth.service.js';
import {
    initPasswordToggle,
    initPasswordStrength,
    initPasswordRequirements,
    isValidEmail,
    isValidPhone,
    showError,
    hideError
} from '../utils/form-utils.js';

export function renderRegisterPage() {
    const app = document.getElementById('app');

    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0];

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container" style="max-width: 600px;">
                <div class="auth-card">
                    <div class="auth-header-actions">
                        <a href="/" class="auth-back-link">← Back to Home</a>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/admin/register')" title="Switch to Admin Registration">
                            <i class="icon">🛡️</i> Admin Register
                        </button>
                    </div>
                    <h2 class="auth-title">Create Your Account</h2>
                    <p class="auth-subtitle">Join Meri Shikayat to register your complaints</p>
                    
                    <form id="registerForm" class="auth-form" autocomplete="on">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    class="form-input" 
                                    placeholder="Enter your first name"
                                    autocomplete="given-name"
                                    required
                                    minlength="2"
                                    maxlength="50"
                                />
                            </div>

                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    class="form-input" 
                                    placeholder="Enter your last name"
                                    autocomplete="family-name"
                                    required
                                    minlength="2"
                                    maxlength="50"
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="dateOfBirth">Date of Birth *</label>
                            <input 
                                type="date" 
                                id="dateOfBirth" 
                                name="dateOfBirth" 
                                class="form-input" 
                                autocomplete="bday"
                                required
                                max="${maxDate}"
                            />
                            <small class="form-hint">You must be at least 13 years old</small>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-input" 
                                placeholder="your@email.com"
                                autocomplete="email"
                            />
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                class="form-input" 
                                placeholder="10-digit phone number"
                                autocomplete="tel"
                                pattern="[0-9]{10}"
                                maxlength="10"
                            />
                            <small class="form-hint">At least one contact method (email or phone) is required</small>
                        </div>

                        <div class="form-group">
                            <label for="password">Password *</label>
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
                            <div class="password-requirements">
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

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                            </label>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                            <span class="btn-text">Create Account</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Creating account...
                            </span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        Already have an account? 
                        <a href="/login" class="auth-link">Login here</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Initialize form enhancements
    // Floating labels disabled due to alignment issues
    // initFloatingLabels('registerForm');
    // initFocusAnimations('registerForm');
    initPasswordToggle('password', 'togglePassword');
    initPasswordToggle('confirmPassword', 'toggleConfirmPassword');
    initPasswordStrength('password', 'passwordStrength');
    initPasswordRequirements('password', 'passwordRequirements');

    // Handle form submission
    const form = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoader = registerBtn.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const email = document.getElementById('email').value.trim().toLowerCase();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!email && !phone) {
            showError('errorMessage', 'Please provide at least one contact method (email or phone)');
            return;
        }

        if (email && !isValidEmail(email)) {
            showError('errorMessage', 'Please provide a valid email address');
            return;
        }

        if (phone && !isValidPhone(phone)) {
            showError('errorMessage', 'Please provide a valid 10-digit phone number');
            return;
        }

        if (password !== confirmPassword) {
            showError('errorMessage', 'Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            showError('errorMessage', 'You must agree to the Terms & Conditions');
            return;
        }

        try {
            hideError('errorMessage');
            registerBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const userData = {
                firstName,
                lastName,
                dateOfBirth,
                email: email || undefined,
                phone: phone || undefined,
                password
            };

            const response = await authService.register(userData);

            if (response.success) {
                // Redirect to location setup
                window.router.navigate('/location-setup');
            }
        } catch (error) {
            showError('errorMessage', error.response?.data?.message || 'Registration failed. Please try again.');
            registerBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

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
