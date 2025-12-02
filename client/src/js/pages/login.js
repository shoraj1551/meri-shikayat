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
                    <h2 class="auth-title">Login to Meri Shikayat</h2>
                    <p class="auth-subtitle">Enter your credentials to access your account</p>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="identifier">Email or Phone Number</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                class="form-input" 
                                placeholder="your@email.com or 10-digit phone"
                                required
                            />
                            <small class="form-hint">Enter your email or 10-digit phone number</small>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="form-input" 
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block">
                            Login
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

    // Handle form submission
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Client-side validation
        const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
        const isPhone = /^[0-9]{10}$/.test(identifier);

        if (!isEmail && !isPhone) {
            errorMessage.textContent = 'Please provide a valid email or 10-digit phone number';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            errorMessage.style.display = 'none';
            const response = await authService.login({ identifier, password });

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
        }
    });

    // Add event listener for register link
    app.querySelector('a[href="/register"]').addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/register');
    });
}
