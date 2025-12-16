/**
 * Main Multi-Role Registration Page
 * Orchestrates the registration flow for all user types
 */

import RoleSelector from '../components/role-selector.js';
import { authService } from '../api/auth.service.js';
import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

export function renderMultiRoleRegisterPage() {
    const app = document.getElementById('app');

    // State
    let currentStep = 1;
    let selectedRole = null;
    let formData = {};

    // Initialize
    showRoleSelection();

    function showRoleSelection() {
        const roleSelector = new RoleSelector((role) => {
            selectedRole = role;
            currentStep = 2;
            showRegistrationForm(role);  // Immediately show form
        });

        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 1200px;">
                    <div class="auth-card">
                        <div class="auth-header-actions">
                            <a href="/" class="auth-back-link">← Back to Home</a>
                        </div>
                        
                        <div class="progress-indicator">
                            <div class="progress-step active">
                                <span class="progress-step-number">1</span>
                                <span>Select Role</span>
                            </div>
                            <div class="progress-step">
                                <span class="progress-step-number">2</span>
                                <span>Basic Info</span>
                            </div>
                            <div class="progress-step">
                                <span class="progress-step-number">3</span>
                                <span>Complete</span>
                            </div>
                        </div>

                        ${roleSelector.render()}

                        <p class="auth-footer">
                            Already have an account? 
                            <a href="/login" class="auth-link">Login here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Attach role selector event listeners
        roleSelector.attachEventListeners();

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

    function showContinueButton() {
        const container = document.getElementById('continueButtonContainer');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function showRegistrationForm(role) {
        // Update progress indicator
        updateProgressIndicator(2);

        // Render appropriate form based on role
        switch (role) {
            case 'general_user':
                renderGeneralUserForm();
                break;
            case 'admin':
                renderAdminForm();
                break;
            case 'contractor':
                renderContractorForm();
                break;
            case 'super_admin':
                renderSuperAdminForm();
                break;
            default:
                showRoleSelection();
        }
    }

    function updateProgressIndicator(step) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }

    function renderGeneralUserForm() {
        const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0];

        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 650px;">
                    <div class="auth-card">
                        <div class="auth-header-actions">
                            <button class="auth-back-link" id="backToRoleSelection">← Change Role</button>
                        </div>

                        <div class="progress-indicator">
                            <div class="progress-step active">
                                <span class="progress-step-number">1</span>
                                <span>Select Role</span>
                            </div>
                            <div class="progress-step active">
                                <span class="progress-step-number">2</span>
                                <span>Basic Info</span>
                            </div>
                            <div class="progress-step">
                                <span class="progress-step-number">3</span>
                                <span>Complete</span>
                            </div>
                        </div>

                        <div class="selected-role-badge">
                            <span class="role-icon">👤</span>
                            <span>Registering as: <strong>General User</strong></span>
                        </div>

                        <h2 class="auth-title">Create Your Account</h2>
                        <p class="auth-subtitle">Join Meri Shikayat to make your community better</p>
                        
                        <form id="registerForm" class="auth-form" autocomplete="on">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name *</label>
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
                                    <label for="lastName">Last Name *</label>
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
                                <label for="dateOfBirth">Date of Birth *</label>
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
                                    <span>You must be 13+ years old</span>
                                </small>
                                <div class="field-error" role="alert"></div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email Address</label>
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
                                <div class="field-error" role="alert"></div>
                            </div>

                            <div class="form-group">
                                <label for="phone">Phone Number</label>
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
                                <label for="password">Password *</label>
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
                                <div class="password-strength" id="passwordStrength">
                                    <div class="password-strength-bar"></div>
                                </div>
                                <div class="password-requirements" id="passwordRequirements" style="display: none;">
                                    <div class="password-requirement" data-req="length">
                                        <span class="password-requirement-icon">○</span>
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div class="password-requirement" data-req="uppercase">
                                        <span class="password-requirement-icon">○</span>
                                        <span>One uppercase letter</span>
                                    </div>
                                    <div class="password-requirement" data-req="lowercase">
                                        <span class="password-requirement-icon">○</span>
                                        <span>One lowercase letter</span>
                                    </div>
                                    <div class="password-requirement" data-req="number">
                                        <span class="password-requirement-icon">○</span>
                                        <span>One number</span>
                                    </div>
                                    <div class="password-requirement" data-req="special">
                                        <span class="password-requirement-icon">○</span>
                                        <span>One special character</span>
                                    </div>
                                </div>
                                <div class="field-error" role="alert"></div>
                            </div>

                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password *</label>
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

        // Attach form handlers
        attachGeneralUserFormHandlers();
    }

    function attachGeneralUserFormHandlers() {
        // Back to role selection
        const backBtn = document.getElementById('backToRoleSelection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentStep = 1;
                selectedRole = null;
                showRoleSelection();
            });
        }

        // Form validation and submission
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
            const value = password.value;
            const strengthBar = document.querySelector('#passwordStrength .password-strength-bar');
            const requirementsDiv = document.getElementById('passwordRequirements');

            if (value) {
                // Show requirements
                requirementsDiv.style.display = 'block';

                // Check requirements
                const requirements = {
                    length: value.length >= 8,
                    uppercase: /[A-Z]/.test(value),
                    lowercase: /[a-z]/.test(value),
                    number: /[0-9]/.test(value),
                    special: /[^A-Za-z0-9]/.test(value)
                };

                // Update requirement indicators
                Object.keys(requirements).forEach(req => {
                    const reqElement = document.querySelector(`[data-req="${req}"]`);
                    if (requirements[req]) {
                        reqElement.classList.add('met');
                        reqElement.querySelector('.password-requirement-icon').textContent = '✓';
                    } else {
                        reqElement.classList.remove('met');
                        reqElement.querySelector('.password-requirement-icon').textContent = '○';
                    }
                });

                // Calculate strength
                const metCount = Object.values(requirements).filter(Boolean).length;
                let strengthClass = 'weak';
                if (metCount >= 5) strengthClass = 'strong';
                else if (metCount >= 3) strengthClass = 'medium';

                // Update strength bar
                strengthBar.className = `password-strength-bar ${strengthClass}`;

                // Validate
                if (metCount >= 5) {
                    validator.clearError(password);
                }
            } else {
                requirementsDiv.style.display = 'none';
                strengthBar.className = 'password-strength-bar';
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

                // Call new multi-role registration endpoint
                const response = await fetch('/api/auth/register/general-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (data.success) {
                    // Store token
                    localStorage.setItem('token', data.token);

                    // Show success
                    showSuccess();

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.router.navigate('/location-setup');
                    }, 2000);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                Loading.buttonReset(registerBtn);
                const errorMsg = error.message || 'Registration failed. Please try again.';
                showError(errorMsg);
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

    // ========================================
    // ADMIN REGISTRATION FORM
    // ========================================
    function renderAdminForm() {
        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 700px;">
                    <div class="auth-card">
                        <div class="auth-header-actions">
                            <button class="auth-back-link" id="backToRoleSelection">← Change Role</button>
                        </div>

                        <div class="progress-indicator">
                            <div class="progress-step active">
                                <span class="progress-step-number">1</span>
                                <span>Select Role</span>
                            </div>
                            <div class="progress-step active">
                                <span class="progress-step-number">2</span>
                                <span>Basic Info</span>
                            </div>
                            <div class="progress-step">
                                <span class="progress-step-number">3</span>
                                <span>Complete</span>
                            </div>
                        </div>

                        <div class="selected-role-badge">
                            <span class="role-icon">🛡️</span>
                            <span>Registering as: <strong>Admin</strong></span>
                        </div>

                        <h2 class="auth-title">Admin Registration</h2>
                        <p class="auth-subtitle">Your account will be reviewed before activation</p>
                        
                        <form id="registerForm" class="auth-form">
                            <!-- Personal Information -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">👤</span>
                                    Personal Information
                                </h3>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="firstName">First Name *</label>
                                        <input type="text" id="firstName" class="form-input" required minlength="2" maxlength="50">
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="lastName">Last Name *</label>
                                        <input type="text" id="lastName" class="form-input" required minlength="2" maxlength="50">
                                        <div class="field-error"></div>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="email">Official Email *</label>
                                        <input type="email" id="email" class="form-input" required placeholder="your.name@department.gov.in">
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Phone Number *</label>
                                        <input type="tel" id="phone" class="form-input" required pattern="[6-9][0-9]{9}" maxlength="10">
                                        <div class="field-error"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Department Information -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">🏢</span>
                                    Department Information
                                </h3>

                                <div class="form-group">
                                    <label>Select Department *</label>
                                    <p class="form-section-description" style="margin-top: 0.5rem;">Choose the department you work for</p>
                                    <div class="department-cards-grid" id="departmentCardsGrid">
                                        <div class="department-card" data-dept="municipal">
                                            <div class="department-card-icon">🏛️</div>
                                            <div class="department-card-name">Municipal Corporation</div>
                                        </div>
                                        <div class="department-card" data-dept="police">
                                            <div class="department-card-icon">👮</div>
                                            <div class="department-card-name">Police Department</div>
                                        </div>
                                        <div class="department-card" data-dept="pwd">
                                            <div class="department-card-icon">🏗️</div>
                                            <div class="department-card-name">Public Works (PWD)</div>
                                        </div>
                                        <div class="department-card" data-dept="water">
                                            <div class="department-card-icon">💧</div>
                                            <div class="department-card-name">Water Supply</div>
                                        </div>
                                        <div class="department-card" data-dept="electricity">
                                            <div class="department-card-icon">⚡</div>
                                            <div class="department-card-name">Electricity Board</div>
                                        </div>
                                        <div class="department-card" data-dept="sanitation">
                                            <div class="department-card-icon">🧹</div>
                                            <div class="department-card-name">Sanitation</div>
                                        </div>
                                        <div class="department-card" data-dept="health">
                                            <div class="department-card-icon">🏥</div>
                                            <div class="department-card-name">Health Department</div>
                                        </div>
                                        <div class="department-card" data-dept="education">
                                            <div class="department-card-icon">📚</div>
                                            <div class="department-card-name">Education</div>
                                        </div>
                                        <div class="department-card" data-dept="transport">
                                            <div class="department-card-icon">🚌</div>
                                            <div class="department-card-name">Transport</div>
                                        </div>
                                        <div class="department-card" data-dept="fire">
                                            <div class="department-card-icon">🚒</div>
                                            <div class="department-card-name">Fire Department</div>
                                        </div>
                                        <div class="department-card" data-dept="environment">
                                            <div class="department-card-icon">🌳</div>
                                            <div class="department-card-name">Environment</div>
                                        </div>
                                        <div class="department-card" data-dept="revenue">
                                            <div class="department-card-icon">💰</div>
                                            <div class="department-card-name">Revenue</div>
                                        </div>
                                    </div>
                                    <input type="hidden" id="department" name="department" required>
                                    <div class="field-error" id="departmentError"></div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="designation">Designation *</label>
                                        <input type="text" id="designation" class="form-input" required placeholder="e.g., Assistant Engineer">
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="employeeId">Employee ID *</label>
                                        <input type="text" id="employeeId" class="form-input" required placeholder="e.g., EMP12345">
                                        <div class="field-error"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Security -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">🔒</span>
                                    Security
                                </h3>

                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" class="form-input" required minlength="8">
                                    <small class="form-hint-enhanced">
                                        <span class="hint-icon">🔐</span>
                                        <span>Must be 8+ characters with uppercase, lowercase, number, and special character</span>
                                    </small>
                                    <div class="field-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password *</label>
                                    <input type="password" id="confirmPassword" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="agreeTerms" required>
                                    <span>I confirm that the information provided is accurate and I agree to the <a href="/terms" target="_blank">Terms & Conditions</a></span>
                                </label>
                            </div>

                            <div id="errorMessage" class="error-message" style="display: none;"></div>

                            <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                                Submit Admin Registration
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        attachAdminFormHandlers();
    }

    function attachAdminFormHandlers() {
        const backBtn = document.getElementById('backToRoleSelection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentStep = 1;
                selectedRole = null;
                showRoleSelection();
            });
        }

        // Department card selection
        const departmentCards = document.querySelectorAll('.department-card');
        const departmentInput = document.getElementById('department');
        let selectedDepartment = null;

        departmentCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove selected class from all cards
                departmentCards.forEach(c => c.classList.remove('selected'));

                // Add selected class to clicked card
                card.classList.add('selected');

                // Update hidden input
                selectedDepartment = card.dataset.dept;
                departmentInput.value = selectedDepartment;

                // Clear error
                document.getElementById('departmentError').textContent = '';
            });
        });

        const form = document.getElementById('registerForm');
        const registerBtn = document.getElementById('registerBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                department: document.getElementById('department').value,
                designation: document.getElementById('designation').value.trim(),
                employeeId: document.getElementById('employeeId').value.trim()
            };

            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate department selection
            if (!formData.department) {
                document.getElementById('departmentError').textContent = 'Please select a department';
                document.getElementById('departmentError').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            if (formData.password !== confirmPassword) {
                showFormError('Passwords do not match');
                return;
            }

            if (!document.getElementById('agreeTerms').checked) {
                showFormError('You must agree to the terms and conditions');
                return;
            }

            try {
                Loading.buttonLoading(registerBtn, 'Submitting...');

                const response = await fetch('/api/auth/register/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    showApprovalPendingScreen('admin', formData.firstName);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                Loading.buttonReset(registerBtn);
                showFormError(error.message || 'Registration failed');
            }
        });

        app.querySelectorAll('a').forEach(link => {
            if (!link.hasAttribute('target')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.router.navigate(link.getAttribute('href'));
                });
            }
        });
    }

    // ========================================
    // CONTRACTOR REGISTRATION FORM
    // ========================================
    function renderContractorForm() {
        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 700px;">
                    <div class="auth-card">
                        <div class="auth-header-actions">
                            <button class="auth-back-link" id="backToRoleSelection">← Change Role</button>
                        </div>

                        <div class="progress-indicator">
                            <div class="progress-step active">
                                <span class="progress-step-number">1</span>
                                <span>Select Role</span>
                            </div>
                            <div class="progress-step active">
                                <span class="progress-step-number">2</span>
                                <span>Basic Info</span>
                            </div>
                            <div class="progress-step">
                                <span class="progress-step-number">3</span>
                                <span>Complete</span>
                            </div>
                        </div>

                        <div class="selected-role-badge">
                            <span class="role-icon">🏗️</span>
                            <span>Registering as: <strong>Contractor</strong></span>
                        </div>

                        <h2 class="auth-title">Contractor Registration</h2>
                        <p class="auth-subtitle">Your account will be verified before activation</p>
                        
                        <form id="registerForm" class="auth-form">
                            <!-- Personal Information -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">👤</span>
                                    Personal Information
                                </h3>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="firstName">First Name *</label>
                                        <input type="text" id="firstName" class="form-input" required>
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="lastName">Last Name *</label>
                                        <input type="text" id="lastName" class="form-input" required>
                                        <div class="field-error"></div>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="email">Email *</label>
                                        <input type="email" id="email" class="form-input" required>
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Phone *</label>
                                        <input type="tel" id="phone" class="form-input" required pattern="[6-9][0-9]{9}" maxlength="10">
                                        <div class="field-error"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Company Information -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">🏢</span>
                                    Company Information
                                </h3>

                                <div class="form-group">
                                    <label for="companyName">Company Name *</label>
                                    <input type="text" id="companyName" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="registrationNumber">Registration Number *</label>
                                        <input type="text" id="registrationNumber" class="form-input" required>
                                        <div class="field-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="gstNumber">GST Number</label>
                                        <input type="text" id="gstNumber" class="form-input" placeholder="22AAAAA0000A1Z5">
                                        <div class="field-error"></div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Specialization *</label>
                                    <p class="form-section-description" style="margin-top: 0.5rem;">Select all services you provide (multiple allowed)</p>
                                    <div class="specialization-grid" id="specializationGrid">
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-sanitation" name="specialization" value="sanitation">
                                            <label for="spec-sanitation" class="specialization-label">
                                                <span class="specialization-icon">🧹</span>
                                                <span>Sanitation & Waste</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-road" name="specialization" value="road_repair">
                                            <label for="spec-road" class="specialization-label">
                                                <span class="specialization-icon">🛣️</span>
                                                <span>Road Repair</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-electrical" name="specialization" value="electrical">
                                            <label for="spec-electrical" class="specialization-label">
                                                <span class="specialization-icon">⚡</span>
                                                <span>Electrical Works</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-plumbing" name="specialization" value="plumbing">
                                            <label for="spec-plumbing" class="specialization-label">
                                                <span class="specialization-icon">🔧</span>
                                                <span>Plumbing</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-construction" name="specialization" value="construction">
                                            <label for="spec-construction" class="specialization-label">
                                                <span class="specialization-icon">🏗️</span>
                                                <span>Construction</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-landscaping" name="specialization" value="landscaping">
                                            <label for="spec-landscaping" class="specialization-label">
                                                <span class="specialization-icon">🌳</span>
                                                <span>Landscaping</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-painting" name="specialization" value="painting">
                                            <label for="spec-painting" class="specialization-label">
                                                <span class="specialization-icon">🎨</span>
                                                <span>Painting</span>
                                            </label>
                                        </div>
                                        <div class="specialization-checkbox">
                                            <input type="checkbox" id="spec-carpentry" name="specialization" value="carpentry">
                                            <label for="spec-carpentry" class="specialization-label">
                                                <span class="specialization-icon">🪚</span>
                                                <span>Carpentry</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="field-error" id="specializationError"></div>
                                </div>
                            </div>

                            <!-- Security -->
                            <div class="form-section">
                                <h3 class="form-section-title">
                                    <span class="form-section-icon">🔒</span>
                                    Security
                                </h3>

                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" class="form-input" required minlength="8">
                                    <div class="field-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password *</label>
                                    <input type="password" id="confirmPassword" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="agreeTerms" required>
                                    <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a></span>
                                </label>
                            </div>

                            <div id="errorMessage" class="error-message" style="display: none;"></div>

                            <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                                Submit Contractor Registration
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        attachContractorFormHandlers();
    }

    function attachContractorFormHandlers() {
        const backBtn = document.getElementById('backToRoleSelection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentStep = 1;
                selectedRole = null;
                showRoleSelection();
            });
        }

        const form = document.getElementById('registerForm');
        const registerBtn = document.getElementById('registerBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect selected specializations from checkboxes
            const specializationCheckboxes = document.querySelectorAll('input[name="specialization"]:checked');
            const selectedSpecializations = Array.from(specializationCheckboxes).map(cb => cb.value);

            // Validate at least one specialization selected
            if (selectedSpecializations.length === 0) {
                document.getElementById('specializationError').textContent = 'Please select at least one specialization';
                document.getElementById('specializationError').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                companyName: document.getElementById('companyName').value.trim(),
                registrationNumber: document.getElementById('registrationNumber').value.trim(),
                gstNumber: document.getElementById('gstNumber').value.trim() || undefined,
                specialization: selectedSpecializations,
                serviceAreas: []
            };

            const confirmPassword = document.getElementById('confirmPassword').value;

            if (formData.password !== confirmPassword) {
                showFormError('Passwords do not match');
                return;
            }

            if (!document.getElementById('agreeTerms').checked) {
                showFormError('You must agree to the terms and conditions');
                return;
            }

            try {
                Loading.buttonLoading(registerBtn, 'Submitting...');

                const response = await fetch('/api/auth/register/contractor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    showApprovalPendingScreen('contractor', formData.firstName);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                Loading.buttonReset(registerBtn);
                showFormError(error.message || 'Registration failed');
            }
        });

        app.querySelectorAll('a').forEach(link => {
            if (!link.hasAttribute('target')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.router.navigate(link.getAttribute('href'));
                });
            }
        });
    }

    // ========================================
    // SUPER ADMIN REGISTRATION FORM
    // ========================================
    function renderSuperAdminForm() {
        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 600px;">
                    <div class="auth-card">
                        <div class="auth-header-actions">
                            <button class="auth-back-link" id="backToRoleSelection">← Change Role</button>
                        </div>

                        <div class="selected-role-badge" style="background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);">
                            <span class="role-icon">⭐</span>
                            <span>Registering as: <strong>Super Admin</strong></span>
                        </div>

                        <h2 class="auth-title">Super Admin Registration</h2>
                        <p class="auth-subtitle">Invitation code required</p>
                        
                        <form id="registerForm" class="auth-form">
                            <div class="form-group">
                                <label for="invitationCode">Invitation Code *</label>
                                <div class="invitation-code-wrapper">
                                    <input type="text" id="invitationCode" class="form-input" required placeholder="Enter your invitation code" autocomplete="off">
                                    <div class="invitation-code-status" id="codeStatus" style="display: none;">
                                        <span class="code-spinner"></span>
                                    </div>
                                </div>
                                <small class="form-hint-enhanced">
                                    <span class="hint-icon">🔐</span>
                                    <span>Super Admin registration requires a valid invitation code</span>
                                </small>
                                <div class="field-error" id="invitationCodeError"></div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name *</label>
                                    <input type="text" id="firstName" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name *</label>
                                    <input type="text" id="lastName" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email">Email *</label>
                                    <input type="email" id="email" class="form-input" required>
                                    <div class="field-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone *</label>
                                    <input type="tel" id="phone" class="form-input" required pattern="[6-9][0-9]{9}" maxlength="10">
                                    <div class="field-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="password">Password *</label>
                                <input type="password" id="password" class="form-input" required minlength="8">
                                <div class="field-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password *</label>
                                <input type="password" id="confirmPassword" class="form-input" required>
                                <div class="field-error"></div>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="agreeTerms" required>
                                    <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a></span>
                                </label>
                            </div>

                            <div id="errorMessage" class="error-message" style="display: none;"></div>

                            <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                                Create Super Admin Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        attachSuperAdminFormHandlers();
    }

    function attachSuperAdminFormHandlers() {
        const backBtn = document.getElementById('backToRoleSelection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentStep = 1;
                selectedRole = null;
                showRoleSelection();
            });
        }

        // Invitation code validation
        const invitationCodeInput = document.getElementById('invitationCode');
        const codeStatus = document.getElementById('codeStatus');
        const codeError = document.getElementById('invitationCodeError');
        let isCodeValid = false;

        invitationCodeInput.addEventListener('input', () => {
            const code = invitationCodeInput.value.trim();

            if (code.length >= 8) {
                // Show spinner
                codeStatus.style.display = 'flex';
                codeStatus.innerHTML = '<span class="code-spinner"></span>';
                codeError.textContent = '';

                // Simulate validation (in real app, this would be an API call)
                setTimeout(() => {
                    // For demo: accept "SUPER_ADMIN_2024" or any code with "SUPER" in it
                    if (code === 'SUPER_ADMIN_2024' || code.toUpperCase().includes('SUPER')) {
                        isCodeValid = true;
                        codeStatus.innerHTML = '<span class="code-valid-icon">✓</span>';
                        invitationCodeInput.classList.add('valid');
                        invitationCodeInput.classList.remove('invalid');
                    } else {
                        isCodeValid = false;
                        codeStatus.innerHTML = '<span class="code-invalid-icon">✗</span>';
                        invitationCodeInput.classList.add('invalid');
                        invitationCodeInput.classList.remove('valid');
                        codeError.textContent = 'Invalid invitation code';
                    }
                }, 500);
            } else {
                codeStatus.style.display = 'none';
                invitationCodeInput.classList.remove('valid', 'invalid');
                isCodeValid = false;
            }
        });

        const form = document.getElementById('registerForm');
        const registerBtn = document.getElementById('registerBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                invitationCode: document.getElementById('invitationCode').value.trim(),
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value
            };

            const confirmPassword = document.getElementById('confirmPassword').value;

            if (formData.password !== confirmPassword) {
                showFormError('Passwords do not match');
                return;
            }

            if (!document.getElementById('agreeTerms').checked) {
                showFormError('You must agree to the terms and conditions');
                return;
            }

            try {
                Loading.buttonLoading(registerBtn, 'Creating account...');

                const response = await fetch('/api/auth/register/super-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    showSuperAdminSuccess(formData.firstName);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                Loading.buttonReset(registerBtn);
                showFormError(error.message || 'Registration failed');
            }
        });

        app.querySelectorAll('a').forEach(link => {
            if (!link.hasAttribute('target')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.router.navigate(link.getAttribute('href'));
                });
            }
        });
    }

    // Helper functions
    function showFormError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.innerHTML = message;
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function showApprovalPendingScreen(userType, userName) {
        const typeInfo = {
            admin: { icon: '🛡️', title: 'Admin', timeline: '1-2 business days' },
            contractor: { icon: '🏗️', title: 'Contractor', timeline: '2-3 business days' }
        };

        const info = typeInfo[userType];

        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 800px;">
                    <div class="auth-card">
                        <div class="approval-pending-container">
                            <div class="pending-icon">${info.icon}</div>
                            <h2 class="pending-title">Registration Submitted!</h2>
                            <p class="pending-message">
                                Thank you, <strong>${userName}</strong>! Your ${info.title} registration has been submitted.
                            </p>

                            <div class="pending-steps">
                                <h3>What happens next:</h3>
                                <ol>
                                    <li><strong>Document Verification</strong> - We'll verify your credentials</li>
                                    <li><strong>Admin Review</strong> - A Super Admin will review your application</li>
                                    <li><strong>Email Notification</strong> - You'll receive an email once approved</li>
                                </ol>
                            </div>

                            <div class="pending-timeline">
                                <strong>⏱️ Estimated Review Time:</strong> ${info.timeline}
                            </div>

                            <div class="pending-actions">
                                <button class="btn btn-primary" onclick="window.router.navigate('/')">Return to Home</button>
                                <button class="btn btn-secondary" onclick="window.router.navigate('/login')">Go to Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function showSuperAdminSuccess(userName) {
        app.innerHTML = `
            <div class="auth-page multi-role-register">
                <div class="auth-container" style="max-width: 600px;">
                    <div class="auth-card">
                        <div class="success-message">
                            <div class="success-icon">✓</div>
                            <h3>Super Admin Account Created!</h3>
                            <p>Welcome, <strong>${userName}</strong>! Your account is now active.</p>
                            <div class="loading-state">
                                <span class="spinner"></span>
                                <span>Redirecting to admin dashboard...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            window.router.navigate('/admin/dashboard');
        }, 2000);
    }
}
