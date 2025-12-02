/**
 * Admin Login Page
 */

import { adminService } from '../api/admin.service.js';

export function renderAdminLoginPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page admin-theme">
            <div class="auth-container">
                <div class="auth-card admin-card">
                    <div class="auth-header-actions">
                        <div class="admin-badge-header">ADMIN PORTAL</div>
                        <button class="role-toggle-btn" onclick="window.router.navigate('/login')" title="Switch to User Login">
                            <i class="icon">👤</i> User Login
                        </button>
                    </div>
                    <h2 class="auth-title">Admin Login</h2>
                    <p class="auth-subtitle">Secure access for authorized personnel only</p>
                    
                    <form id="adminLoginForm" class="auth-form">
                        <div class="form-group">
                            <label for="identifier">Email or Phone</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                class="form-input" 
                                placeholder="Enter email or phone"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-input" 
                                    placeholder="Enter your password"
                                    required
                                />
                                <button type="button" class="password-toggle" id="togglePassword" tabindex="-1">
                                    👁️
                                </button>
                            </div>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block admin-btn">
                            Login to Dashboard
                        </button>
                    </form>

                    <p class="auth-footer">
                        New admin? 
                        <a href="/admin/register" class="auth-link admin-link">Request Access</a>
                    </p>
                    
                    <div class="admin-footer-link">
                        <a href="/login" class="text-muted">Return to User Login</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Handle Password Toggle
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    let hideTimeout;

    toggleBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent focus loss
        passwordInput.type = 'text';
        toggleBtn.textContent = '🔒';

        // Auto hide after 1 second (as requested)
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }, 1000);
    });

    // Also handle click for mobile/touch or if mousedown doesn't fire as expected
    toggleBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        // Optional: Immediately hide on release if we want "hold to view" behavior
        // But user asked for "option to see... and hide again", auto-hide is safer
    });

    // Handle form submission
    const form = document.getElementById('adminLoginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            errorMessage.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Authenticating...';

            const response = await adminService.login({ identifier, password });

            if (response.success) {
                // Redirect to admin dashboard
                window.router.navigate('/admin/dashboard');
            }
        } catch (error) {
            errorMessage.textContent = error.response?.data?.message || 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login to Dashboard';
        }
    });

    // Handle links
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.router.navigate(href);
        });
    });
}
