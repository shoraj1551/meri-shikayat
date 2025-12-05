} from '../utils/form-utils.js';

export function renderAdminRegisterPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page admin-theme">
            <div class="auth-container" style="max-width: 600px;">
                <div class="auth-card admin-card">
                    <div class="auth-header-actions">
                        <div class="admin-badge-header">ADMIN PORTAL</div>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/register')" title="Switch to User Registration">
                            <i class="icon">👤</i> User Register
                        </button>
                    </div>
                    <h2 class="auth-title">Request Admin Access</h2>
                    <p class="auth-subtitle">Register for an administrative account. Approval required.</p>
                    
                    <form id="adminRegisterForm" class="auth-form" autocomplete="on">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="firstName" class="form-input" autocomplete="given-name" required minlength="2" />
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input type="text" id="lastName" class="form-input" autocomplete="family-name" required minlength="2" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="email">Official Email *</label>
                            <input type="email" id="email" class="form-input" autocomplete="email" required />
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" class="form-input" autocomplete="tel" required pattern="[0-9]{10}" maxlength="10" />
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="department">Department</label>
                                <input type="text" id="department" class="form-input" placeholder="e.g. IT, Operations" />
                            </div>
                            <div class="form-group">
                                <label for="designation">Designation</label>
                                <input type="text" id="designation" class="form-input" placeholder="e.g. Manager" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="password">Password *</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="password" class="form-input" autocomplete="new-password" required minlength="8" placeholder="Create a strong password" />
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
                                <input type="password" id="confirmPassword" class="form-input" autocomplete="new-password" required />
                                <button type="button" class="password-toggle" id="toggleConfirmPassword" tabindex="-1" title="Show password">
                                    <span class="toggle-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a></span>
                            </label>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>
                        <div id="successMessage" class="success-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block admin-btn" id="registerBtn">
                            <span class="btn-text">Submit Request</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Submitting...
                            </span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        Already have an account? 
                        <a href="/admin/login" class="auth-link admin-link">Login here</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Initialize form enhancements
    initFloatingLabels('adminRegisterForm');
    initFocusAnimations('adminRegisterForm');
    initPasswordToggle('password', 'togglePassword');
    initPasswordToggle('confirmPassword', 'toggleConfirmPassword');
    initPasswordStrength('password', 'passwordStrength');
    initPasswordRequirements('password', 'passwordRequirements');

    // Handle form submission
    const form = document.getElementById('adminRegisterForm');
    const registerBtn = document.getElementById('registerBtn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoader = registerBtn.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const phone = document.getElementById('phone').value.trim();
        const department = document.getElementById('department').value.trim();
        const designation = document.getElementById('designation').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
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
            hideError('successMessage');
            registerBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const adminData = {
                firstName,
                lastName,
                email,
                phone,
                password,
                department,
                designation
            };

            const response = await adminService.register(adminData);

            if (response.success) {
                form.reset();
                showSuccess('successMessage', '<strong>Registration Successful!</strong><br>Your account is pending approval from a Super Admin.<br>You will be notified once your account is active.');
                btnText.textContent = 'Request Submitted';
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
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
