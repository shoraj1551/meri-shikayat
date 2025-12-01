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
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                class="form-input" 
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-input" 
                                placeholder="your@email.com"
                                required
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
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="form-input" 
                                placeholder="At least 6 characters"
                                minlength="6"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
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

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMessage = document.getElementById('errorMessage');

        // Validate password match
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            errorMessage.style.display = 'none';
            const response = await authService.register({ name, email, phone, password });

            if (response.success) {
                window.router.navigate('/dashboard');
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
