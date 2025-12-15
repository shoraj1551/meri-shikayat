import { authService } from '../api/auth.service.js';
import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

export function renderRegisterPage() {
    const app = document.getElementById('app');

    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0];

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container" style="max-width: 650px;">
                <div class="auth-card">
                    <!-- Progress Steps -->
                    <div class="progress-steps">
                        <div class="progress-step active">
                            <span class="progress-step-number">1</span>
                            <span>Create Account</span>
                        </div>
                        <div class="progress-step">
                            <span class="progress-step-number">2</span>
                            <span>Set Location</span>
                        </div>
                        <div class="progress-step">
                            <span class="progress-step-number">3</span>
                            <span>Get Started</span>
                        </div>
                    </div>

                    <div class="auth-header-actions">
                        <a href="/" class="auth-back-link">← Back to Home</a>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/admin/register')" title="Switch to Admin Registration">
                            <i class="icon">🛡️</i> Admin Register
                        </button>
                    </div>
                    <h2 class="auth-title">Create Your Account</h2>
                    <p class="auth-subtitle">Join Meri Shikayat to make your community better</p>
                    
                    <form id="registerForm" class="auth-form" autocomplete="on">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">
                                    First Name *
                                    <span class="tooltip-trigger" data-tooltip="Your legal first name as it appears on ID" data-tooltip-position="top">?</span>
                                </label>
                                <div class="input-wrapper">
                                    <span class="input-icon">👤</span>
                                    <input 
                                        type="text" 
                                        id="firstName" 
                                        name="firstName" 
                                        class="form-input" 
                                        placeholder="e.g., Rahul"
                                        autocomplete="given-name"
                                        required
                                        minlength="2"
                                        maxlength="50"
                                    />
                                    <span class="validation-icon"></span>
                                </div>
                                <div class="field-error" role="alert"></div>
                            </div>

                            <div class="form-group">
                                <label for="lastName">
                                    Last Name *
                                    <span class="tooltip-trigger" data-tooltip="Your family name or surname" data-tooltip-position="top">?</span>
                                </label>
                                <div class="input-wrapper">
                                    <span class="input-icon">👤</span>
                                    <input 
                                        type="text" 
                                        id="lastName" 
                                        name="lastName" 
                                        class="form-input" 
                                        placeholder="e.g., Sharma"
                                        autocomplete="family-name"
                                        required
                                        minlength="2"
                                        maxlength="50"
                                    />
                                    <span class="validation-icon"></span>
                                </div>
                                <div class="field-error" role="alert"></div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="dateOfBirth">
                                Date of Birth *
                                <span class="tooltip-trigger" data-tooltip="We need this to verify you're at least 13 years old to use our service" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">📅</span>
                                <input 
                                    type="date" 
                                    id="dateOfBirth" 
                                    name="dateOfBirth" 
                                    class="form-input" 
                                    autocomplete="bday"
                                    required
                                    max="${maxDate}"
                                />
                                <span class="validation-icon"></span>
                            </div>
                            <small class="form-hint-enhanced">
                                <span class="hint-icon">💡</span>
                                <span><strong>Example:</strong> 1990-03-15 (You must be 13+ years old)</span>
                            </small>
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label for="email">
                                Email Address
                                <span class="tooltip-trigger" data-tooltip="We'll send complaint updates and important notifications to this email" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">📧</span>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    class="form-input" 
                                    placeholder="yourname@example.com"
                                    autocomplete="email"
                                />
                                <span class="validation-icon"></span>
                            </div>
                            <small class="form-hint-enhanced">
                                <span class="hint-icon">💡</span>
                                <span><strong>Example:</strong> rahul.sharma@gmail.com</span>
                            </small>
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label for="phone">
                                Phone Number
                                <span class="tooltip-trigger" data-tooltip="We'll send SMS updates about your complaints to this number" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">📱</span>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone" 
                                    class="form-input" 
                                    placeholder="9876543210"
                                    autocomplete="tel"
                                    pattern="[6-9][0-9]{9}"
                                    maxlength="10"
                                />
                                <span class="validation-icon"></span>
                            </div>
                            <small class="form-hint-enhanced">
                                <span class="hint-icon">💡</span>
                                <span><strong>Note:</strong> At least one contact method (email or phone) is required</span>
                            </small>
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label for="password">
                                Password *
                                <span class="tooltip-trigger" data-tooltip="Create a strong password to keep your account secure" data-tooltip-position="top">?</span>
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">🔒</span>
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
                            <div class="password-strength"></div>
                            <small class="form-hint-enhanced">
                                <span class="hint-icon">🔐</span>
                                <span>Must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&)</span>
                            </small>
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">
                                Confirm Password *
                            </label>
                            <div class="input-wrapper">
                                <span class="input-icon">🔒</span>
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
                            <div class="field-error" role="alert"></div>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                            </label>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block btn-cta-main" id="registerBtn">
                            Create Account
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

    // Initialize tooltips
    if (window.tooltip) {
        window.tooltip.initializeTooltips();
    }

    // Initialize form validator
    const form = document.getElementById('registerForm');
    const validator = new FormValidator(form);

    // Get form elements
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const registerBtn = document.getElementById('registerBtn');

    // Real-time validation
    firstName.addEventListener('blur', () => {
        if (firstName.value.trim()) {
            validator.validateRequired(firstName, 'First name');
        }
    });

    lastName.addEventListener('blur', () => {
        if (lastName.value.trim()) {
            validator.validateRequired(lastName, 'Last name');
        }
    });

    dateOfBirth.addEventListener('blur', () => {
        if (dateOfBirth.value) {
            validator.validateRequired(dateOfBirth, 'Date of birth');
        }
    });

    email.addEventListener('blur', () => {
        if (email.value.trim()) {
            validator.validateEmail(email);
        }
    });

    phone.addEventListener('blur', () => {
        if (phone.value.trim()) {
            validator.validatePhone(phone);
        }
    });

    password.addEventListener('input', () => {
        if (password.value) {
            validator.validatePassword(password, true);
        }
    });

    confirmPassword.addEventListener('blur', () => {
        if (confirmPassword.value && password.value) {
            if (confirmPassword.value !== password.value) {
                validator.setError(confirmPassword, 'Passwords do not match');
            } else {
                validator.clearError(confirmPassword);
            }
        }
    });

    // Password toggle
    document.getElementById('togglePassword').addEventListener('click', () => {
        const type = password.type === 'password' ? 'text' : 'password';
        password.type = type;
    });

    document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
        const type = confirmPassword.type === 'password' ? 'text' : 'password';
        confirmPassword.type = type;
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const isFirstNameValid = validator.validateRequired(firstName, 'First name');
        const isLastNameValid = validator.validateRequired(lastName, 'Last name');
        const isDOBValid = validator.validateRequired(dateOfBirth, 'Date of birth');

        // At least one contact method required
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();

        if (!emailValue && !phoneValue) {
            showError('Please provide at least one contact method (email or phone)');
            return;
        }

        let isEmailValid = true;
        let isPhoneValid = true;

        if (emailValue) {
            isEmailValid = validator.validateEmail(email);
        }

        if (phoneValue) {
            isPhoneValid = validator.validatePhone(phone);
        }

        const isPasswordValid = validator.validatePassword(password, false);

        let isConfirmPasswordValid = true;
        if (confirmPassword.value !== password.value) {
            validator.setError(confirmPassword, 'Passwords do not match');
            isConfirmPasswordValid = false;
        }

        const agreeTerms = document.getElementById('agreeTerms').checked;
        if (!agreeTerms) {
            showError('You must agree to the Terms & Conditions to create an account');
            return;
        }

        if (!isFirstNameValid || !isLastNameValid || !isDOBValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
            showError('Please fix the errors above before submitting');
            return;
        }

        try {
            hideError();
            Loading.buttonLoading(registerBtn, 'Creating account...');

            const userData = {
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                dateOfBirth: dateOfBirth.value,
                email: emailValue || undefined,
                phone: phoneValue || undefined,
                password: password.value
            };

            const response = await authService.register(userData);

            if (response.success) {
                // Show success message
                showSuccess();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.router.navigate('/location-setup');
                }, 2000);
            }
        } catch (error) {
            Loading.buttonReset(registerBtn);
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';

            // Enhanced error messages
            if (errorMsg.includes('email') && errorMsg.includes('exists')) {
                showError('This email is already registered. Try <a href="/login">logging in</a> or use <a href="/forgot-password">Forgot Password</a> to recover your account.');
            } else if (errorMsg.includes('phone') && errorMsg.includes('exists')) {
                showError('This phone number is already registered. Try <a href="/login">logging in</a> instead.');
            } else {
                showError(errorMsg);
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
        const form = document.getElementById('registerForm');
        form.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✓</div>
                <h3>Account Created Successfully!</h3>
                <p>Welcome to Meri Shikayat! Let's set up your location next.</p>
                <div class="loading-state">
                    <span class="spinner"></span>
                    <span>Redirecting to location setup...</span>
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
