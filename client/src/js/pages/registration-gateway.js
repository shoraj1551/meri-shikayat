/**
 * Registration Gateway - Screen 2
 * Just-in-time registration with complaint preview
 */

import { authService } from '../api/auth.service.js';
import { complaintService } from '../api/complaint.service.js';

export function renderRegistrationGatewayPage() {
    const app = document.getElementById('app');

    // Load pending complaint from sessionStorage
    const pendingComplaint = sessionStorage.getItem('pendingComplaint');
    if (!pendingComplaint) {
        // No complaint data, redirect back to form
        window.router.navigate('/file-complaint');
        return;
    }

    const complaint = JSON.parse(pendingComplaint);

    app.innerHTML = `
        <div class="registration-gateway-page">
            <div class="gateway-container">
                <div class="gateway-layout">
                    <!-- Complaint Preview Sidebar -->
                    <div class="complaint-preview-sidebar">
                        <div class="preview-card">
                            <h3 class="preview-header">Reviewing Complaint</h3>
                            
                            <div class="preview-category">
                                <span class="preview-category-icon">${getCategoryIcon(complaint.category)}</span>
                                <span class="preview-category-label">${getCategoryLabel(complaint.category)}</span>
                            </div>

                            <div class="preview-location">
                                <span class="preview-location-icon">📍</span>
                                ${truncateText(complaint.location?.address || 'Location not set', 50)}
                            </div>

                            <div class="preview-description">
                                ${truncateText(complaint.details, 150)}
                            </div>

                            ${complaint.media ? `
                                <div class="preview-media">
                                    <small style="color: var(--text-light);">
                                        ${complaint.media.type === 'image' ? '📷' : complaint.media.type === 'video' ? '📹' : '🎤'} 
                                        Media attached
                                    </small>
                                </div>
                            ` : ''}

                            <button class="preview-edit-btn" onclick="window.router.navigate('/file-complaint')">
                                ← Edit Complaint
                            </button>
                        </div>
                    </div>

                    <!-- Registration Form -->
                    <div class="registration-form-container">
                        <h1 class="gateway-title">Almost Done! Submit Your Complaint & Track Its Status.</h1>
                        <p class="gateway-subtitle">
                            Create an account in seconds to secure your complaint, receive real-time updates, 
                            and communicate directly with resolving authorities.
                        </p>

                        <!-- Social/Fast Login -->
                        <div class="social-login-section">
                            <div class="social-login-buttons">
                                <button class="social-login-btn google" id="googleLoginBtn">
                                    <span class="social-icon">🔵</span>
                                    Continue with Google
                                </button>
                                <button class="social-login-btn mobile" id="mobileOtpBtn">
                                    <span class="social-icon">📱</span>
                                    Continue with Mobile OTP
                                </button>
                            </div>
                        </div>

                        <div class="divider">OR</div>

                        <!-- Traditional Email/Password -->
                        <div class="traditional-registration">
                            <h3 class="form-section-header">Or, sign up with Email</h3>
                            
                            <form id="registrationForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">First Name *</label>
                                        <input 
                                            type="text" 
                                            id="firstName" 
                                            class="form-input" 
                                            required
                                            placeholder="John"
                                        >
                                        <span class="input-error" id="firstNameError"></span>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Last Name *</label>
                                        <input 
                                            type="text" 
                                            id="lastName" 
                                            class="form-input" 
                                            required
                                            placeholder="Doe"
                                        >
                                        <span class="input-error" id="lastNameError"></span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Email *</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        class="form-input" 
                                        required
                                        placeholder="john.doe@example.com"
                                    >
                                    <span class="input-error" id="emailError"></span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Phone (Optional)</label>
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        class="form-input" 
                                        placeholder="9876543210"
                                        pattern="[0-9]{10}"
                                    >
                                    <span class="input-error" id="phoneError"></span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Password *</label>
                                    <div class="password-input-wrapper">
                                        <input 
                                            type="password" 
                                            id="password" 
                                            class="form-input" 
                                            required
                                            minlength="6"
                                            placeholder="Minimum 6 characters"
                                        >
                                        <button type="button" class="password-toggle" id="passwordToggle">👁️</button>
                                    </div>
                                    <div class="password-strength">
                                        <div class="password-strength-bar" id="passwordStrengthBar"></div>
                                    </div>
                                    <span class="input-error" id="passwordError"></span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Confirm Password *</label>
                                    <div class="password-input-wrapper">
                                        <input 
                                            type="password" 
                                            id="confirmPassword" 
                                            class="form-input" 
                                            required
                                            minlength="6"
                                            placeholder="Re-enter password"
                                        >
                                        <button type="button" class="password-toggle" id="confirmPasswordToggle">👁️</button>
                                    </div>
                                    <span class="input-error" id="confirmPasswordError"></span>
                                </div>

                                <!-- Date of Birth (hidden field for backend compatibility) -->
                                <input type="hidden" id="dateOfBirth" value="2000-01-01">

                                <!-- Terms Acceptance -->
                                <div class="terms-acceptance">
                                    <div class="checkbox-wrapper">
                                        <input 
                                            type="checkbox" 
                                            id="termsCheckbox" 
                                            class="checkbox-input" 
                                            required
                                        >
                                        <label for="termsCheckbox" class="checkbox-label">
                                            I agree to the <a href="/terms" class="terms-link">Terms of Use</a> 
                                            and <a href="/privacy" class="terms-link">Privacy Policy</a>
                                        </label>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <div class="submit-section">
                                    <button type="submit" class="submit-btn" id="submitBtn">
                                        Submit Complaint & Create Account
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Alternative Login -->
                        <div class="alternative-login">
                            Already have an account? <a href="/login" class="login-link">Login here</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupEventListeners();
}

function setupEventListeners() {
    // Social Login Buttons (Placeholders)
    document.getElementById('googleLoginBtn').addEventListener('click', () => {
        alert('Google OAuth integration coming soon! Please use email registration for now.');
    });

    document.getElementById('mobileOtpBtn').addEventListener('click', () => {
        alert('Mobile OTP integration coming soon! Please use email registration for now.');
    });

    // Password Toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
    });

    confirmPasswordToggle.addEventListener('click', () => {
        const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
        confirmPasswordInput.type = type;
        confirmPasswordToggle.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Password Strength Indicator
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strengthBar = document.getElementById('passwordStrengthBar');

        let strength = 'weak';
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6) {
            strength = 'medium';
        }

        strengthBar.className = `password-strength-bar ${strength}`;
    });

    // Form Validation
    const form = document.getElementById('registrationForm');
    const inputs = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        terms: document.getElementById('termsCheckbox')
    };

    // Real-time validation
    inputs.email.addEventListener('blur', () => {
        const emailError = document.getElementById('emailError');
        if (!inputs.email.validity.valid) {
            emailError.textContent = 'Please enter a valid email address';
            inputs.email.classList.add('error');
        } else {
            emailError.textContent = '';
            inputs.email.classList.remove('error');
        }
    });

    inputs.phone.addEventListener('blur', () => {
        const phoneError = document.getElementById('phoneError');
        if (inputs.phone.value && !inputs.phone.validity.valid) {
            phoneError.textContent = 'Please enter a valid 10-digit phone number';
            inputs.phone.classList.add('error');
        } else {
            phoneError.textContent = '';
            inputs.phone.classList.remove('error');
        }
    });

    inputs.confirmPassword.addEventListener('blur', () => {
        const confirmError = document.getElementById('confirmPasswordError');
        if (inputs.password.value !== inputs.confirmPassword.value) {
            confirmError.textContent = 'Passwords do not match';
            inputs.confirmPassword.classList.add('error');
        } else {
            confirmError.textContent = '';
            inputs.confirmPassword.classList.remove('error');
        }
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (inputs.password.value !== inputs.confirmPassword.value) {
            alert('Passwords do not match!');
            return;
        }

        // Validate terms
        if (!inputs.terms.checked) {
            alert('Please accept the Terms of Use and Privacy Policy');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // Register user
            const registerData = {
                firstName: inputs.firstName.value,
                lastName: inputs.lastName.value,
                email: inputs.email.value,
                phone: inputs.phone.value || undefined,
                password: inputs.password.value,
                dateOfBirth: document.getElementById('dateOfBirth').value
            };

            const registerResponse = await authService.register(registerData);

            // Store token and user data
            localStorage.setItem('token', registerResponse.token);
            localStorage.setItem('user', JSON.stringify(registerResponse.data));

            // Submit complaint
            const pendingComplaint = JSON.parse(sessionStorage.getItem('pendingComplaint'));
            const formData = new FormData();

            formData.append('type', 'text');
            formData.append('title', getCategoryLabel(pendingComplaint.category));
            formData.append('description', pendingComplaint.details);
            formData.append('category', getCategoryLabel(pendingComplaint.category));

            if (pendingComplaint.location) {
                formData.append('location', JSON.stringify({
                    address: pendingComplaint.location.address,
                    coordinates: {
                        lat: pendingComplaint.location.lat,
                        lng: pendingComplaint.location.lng
                    },
                    pincode: '000000' // Placeholder
                }));
            }

            await complaintService.createComplaint(formData);

            // Clear pending complaint
            sessionStorage.removeItem('pendingComplaint');

            // Show success and redirect
            alert('✅ Account created and complaint submitted successfully!');
            window.router.navigate('/dashboard');

        } catch (error) {
            console.error('Registration/Submission error:', error);
            alert('❌ ' + (error.response?.data?.message || 'Registration failed. Please try again.'));
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });

    // Handle navigation links
    app.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.router.navigate(link.getAttribute('href'));
        });
    });
}

// Helper functions
function getCategoryIcon(categoryId) {
    const categories = {
        'pothole': '🚧',
        'trash': '🗑️',
        'water': '💧',
        'light': '💡',
        'safety': '⚠️',
        'other': '📋'
    };
    return categories[categoryId] || '📋';
}

function getCategoryLabel(categoryId) {
    const categories = {
        'pothole': 'Pothole',
        'trash': 'Trash/Waste',
        'water': 'Water Leak',
        'light': 'Street Light',
        'safety': 'Safety Issue',
        'other': 'Other'
    };
    return categories[categoryId] || 'Other';
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
