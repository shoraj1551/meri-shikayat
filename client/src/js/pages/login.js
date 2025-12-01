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

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            errorMessage.style.display = 'none';
            const response = await authService.login({ email, password });

            if (response.success) {
                window.router.navigate('/dashboard');
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
