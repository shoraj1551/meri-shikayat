import { authService } from '../api/auth.service.js';
import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

let selectedRole = null;

export function renderLoginPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page multi-role-register">
            <div class="auth-container" style="max-width: 1200px;">
                <!-- Role Selection Step -->
                <div class="auth-card" id="roleSelectionStep">
                    <div class="auth-header-actions">
                        <a href="/" class="auth-back-link">← Back to Home</a>
                    </div>
                    
                    <div class="role-selector-container">
                        <h2 class="role-selector-title">Welcome Back!</h2>
                        <p class="role-selector-subtitle">Choose your account type to login</p>
                        
                        <div class="role-cards-grid">
                            <!-- General User Card -->
                            <div class="role-card" data-role="general_user">
                                <div class="role-card-icon">👤</div>
                                <h3 class="role-card-title">General User</h3>
                                <p class="role-card-description">Login to file and track your complaints</p>
                                <ul class="role-card-features">
                                    <li>✓ File complaints</li>
                                    <li>✓ Track status</li>
                                    <li>✓ Community feed</li>
                                </ul>
                                <div class="role-card-badge instant">Instant Access</div>
                            </div>

                            <!-- Admin Card -->
                            <div class="role-card" data-role="admin">
                                <div class="role-card-icon">🛡️</div>
                                <h3 class="role-card-title">Admin</h3>
                                <p class="role-card-description">Access admin dashboard and manage complaints</p>
                                <ul class="role-card-features">
                                    <li>✓ Manage complaints</li>
                                    <li>✓ Assign tasks</li>
                                    <li>✓ View analytics</li>
                                </ul>
                                <div class="role-card-badge approval">Admin Portal</div>
                            </div>

                            <!-- Contractor Card -->
                            <div class="role-card" data-role="contractor">
                                <div class="role-card-icon">🏗️</div>
                                <h3 class="role-card-title">Contractor</h3>
                                <p class="role-card-description">Access assigned jobs and update progress</p>
                                <ul class="role-card-features">
                                    <li>✓ View assignments</li>
                                    <li>✓ Update progress</li>
                                    <li>✓ Track earnings</li>
                                </ul>
                                <div class="role-card-badge verification">Work Portal</div>
                            </div>

                            <!-- Super Admin Card -->
                            <div class="role-card super-admin-card" data-role="super_admin">
                                <div class="role-card-icon">⭐</div>
                                <h3 class="role-card-title">Super Admin</h3>
                                <p class="role-card-description">Full system access and control</p>
                                <ul class="role-card-features">
                                    <li>✓ Full access</li>
                                    <li>✓ System settings</li>
                                    <li>✓ User management</li>
                                </ul>
                                <div class="role-card-badge invitation">Master Control</div>
                            </div>
                        </div>

                        <div class="role-selector-note">
                            <span class="note-icon">ℹ️</span>
                            <span><strong>Note:</strong> Select your account type to access the appropriate dashboard and features.</span>
                        </div>
                    </div>

                    <p class="auth-footer">
                        Don't have an account? 
                        <a href="/register" class="auth-link">Register here</a>
                    </p>
                </div>

                <!-- Login Form Step (Hidden Initially) -->
                <div class="auth-card" id="loginFormStep" style="display: none;">
                    <div class="auth-header-actions">
                        <button class="auth-back-link" id="backToRoleSelection">← Change Account Type</button>
                    </div>
                    
                    <div class="auth-header">
                        <div class="selected-role-badge" id="selectedRoleBadge"></div>
                        <h2 class="auth-title" id="loginTitle">Login</h2>
                        <p class="auth-subtitle" id="loginSubtitle">Enter your credentials to continue</p>
                    </div>

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

    initializeLoginListeners();
}

function initializeLoginListeners() {
    // Role selection
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            roleCards.forEach(c => c.classList.remove('active'));

            // Add active class to clicked card
            card.classList.add('active');

            // Get selected role
            selectedRole = card.dataset.role;

            // Show login form after a short delay for visual feedback
            setTimeout(() => {
                showLoginForm(selectedRole);
            }, 300);
        });

        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Login as ${card.querySelector('.role-card-title').textContent}`);

        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Back to role selection
    const backBtn = document.getElementById('backToRoleSelection');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showRoleSelection();
        });
    }

    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const toggleIcon = togglePassword.querySelector('.toggle-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.textContent = '🙈';
                togglePassword.title = 'Hide password';
            } else {
                passwordInput.type = 'password';
                toggleIcon.textContent = '👁️';
                togglePassword.title = 'Show password';
            }
        });
    }

    // Form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Initialize tooltips
    initializeTooltips();
}

function showLoginForm(role) {
    const roleSelectionStep = document.getElementById('roleSelectionStep');
    const loginFormStep = document.getElementById('loginFormStep');
    const selectedRoleBadge = document.getElementById('selectedRoleBadge');
    const loginTitle = document.getElementById('loginTitle');
    const loginSubtitle = document.getElementById('loginSubtitle');

    // Hide role selection, show login form
    roleSelectionStep.style.display = 'none';
    loginFormStep.style.display = 'block';

    // Update badge and titles based on role
    const roleInfo = {
        general_user: {
            icon: '👤',
            title: 'General User Login',
            subtitle: 'Login to access your account and manage complaints',
            badge: 'General User'
        },
        admin: {
            icon: '🛡️',
            title: 'Admin Login',
            subtitle: 'Access admin dashboard and manage system',
            badge: 'Admin'
        },
        contractor: {
            icon: '🏗️',
            title: 'Contractor Login',
            subtitle: 'Access your assigned jobs and update progress',
            badge: 'Contractor'
        },
        super_admin: {
            icon: '⭐',
            title: 'Super Admin Login',
            subtitle: 'Full system access and control',
            badge: 'Super Admin'
        }
    };

    const info = roleInfo[role];
    selectedRoleBadge.innerHTML = `<span class="role-icon-small">${info.icon}</span> ${info.badge}`;
    loginTitle.textContent = info.title;
    loginSubtitle.textContent = info.subtitle;

    // Scroll to top
    window.scrollTo(0, 0);
}

function showRoleSelection() {
    const roleSelectionStep = document.getElementById('roleSelectionStep');
    const loginFormStep = document.getElementById('loginFormStep');

    roleSelectionStep.style.display = 'block';
    loginFormStep.style.display = 'none';
    selectedRole = null;

    // Remove active class from all cards
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(c => c.classList.remove('active'));

    // Clear form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }

    // Clear errors
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

async function handleLogin(e) {
    e.preventDefault();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Clear previous errors
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Basic validation
    if (!identifier || !password) {
        errorMessage.textContent = 'Please fill in all required fields';
        errorMessage.style.display = 'block';
        return;
    }

    if (!selectedRole) {
        errorMessage.textContent = 'Please select an account type';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        // Show loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = Loading.spinner('Logging in...');

        // Attempt login
        const response = await authService.login(identifier, password, selectedRole);

        // Store user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Show success message
        errorMessage.className = 'success-message';
        errorMessage.textContent = '✓ Login successful! Redirecting...';
        errorMessage.style.display = 'block';

        // Redirect based on user type
        setTimeout(() => {
            const userType = response.data.userType;
            if (userType === 'admin' || userType === 'super_admin') {
                window.router.navigate('/admin/dashboard');
            } else if (userType === 'contractor') {
                window.router.navigate('/contractor/dashboard');
            } else {
                window.router.navigate('/dashboard');
            }
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);

        // Show error message
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message || 'Login failed. Please check your credentials and try again.';
        errorMessage.style.display = 'block';

        // Reset button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login to Your Account';
    }
}

function initializeTooltips() {
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');

    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            const tooltipText = trigger.dataset.tooltip;
            const position = trigger.dataset.tooltipPosition || 'top';

            const tooltip = document.createElement('div');
            tooltip.className = `tooltip tooltip-${position}`;
            tooltip.textContent = tooltipText;
            tooltip.id = 'active-tooltip';

            document.body.appendChild(tooltip);

            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            if (position === 'top') {
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + 'px';
                tooltip.style.top = rect.top - tooltipRect.height - 8 + 'px';
            }

            setTimeout(() => tooltip.classList.add('show'), 10);
        });

        trigger.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById('active-tooltip');
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.remove(), 200);
            }
        });
    });
}
