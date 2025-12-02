/**
 * Register page component
 */

import { authService } from '../api/auth.service.js';

export function renderRegisterPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <h2 class="auth-title">Create Your Account</h2>
                    <p class="auth-subtitle">Join Meri Shikayat to register your complaints</p>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    class="form-input" 
                                    placeholder="Enter your first name"
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
                                required
                                max="${new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}"
                            />
                            <small class="form-hint">You must be at least 13 years old</small>
                        </div>

                        <div class="form-group">
                            <label for="email">Email (Optional)</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-input" 
                                placeholder="your@email.com"
                            />
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number (Optional)</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                class="form-input" 
                                placeholder="10-digit phone number"
                                pattern="[0-9]{10}"
                                maxlength="10"
                            />
                            <small class="form-hint">At least one contact method (email or phone) is required</small>
                        </div>

                        <div class="form-group">
                            <label for="password">Password *</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="form-input" 
                                placeholder="At least 6 characters"
                                required
                                minlength="6"
                            />
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password *</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                class="form-input" 
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block">
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

    // Handle form submission
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMessage = document.getElementById('errorMessage');

        // Client-side validation
        if (!email && !phone) {
            errorMessage.textContent = 'Please provide either email or phone number';
            errorMessage.style.display = 'block';
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }

        // Validate age (13+)
        const age = Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 13) {
            errorMessage.textContent = 'You must be at least 13 years old to register';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            errorMessage.style.display = 'none';

            const userData = {
                firstName,
                lastName,
                dateOfBirth,
                password
            };

            // Add email if provided
            if (email) userData.email = email;

            // Add phone if provided
            if (phone) userData.phone = phone;

            const response = await authService.register(userData);

            if (response.success) {
                // Redirect to location setup page
                window.router.navigate('/location-setup');
            }
        } catch (error) {
            errorMessage.textContent = error.response?.data?.message || 'Registration failed. Please try again.';
            errorMessage.style.display = 'block';
        }
    });

    // Add event listener for login link
    app.querySelector('a[href="/login"]').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/login');
    });
}
