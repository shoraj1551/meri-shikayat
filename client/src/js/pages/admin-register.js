/**
 * Admin Registration Page
 */

import { adminService } from '../api/admin.service.js';

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
                    
                    <form id="adminRegisterForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="firstName" class="form-input" required minlength="2" />
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input type="text" id="lastName" class="form-input" required minlength="2" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="email">Official Email *</label>
                            <input type="email" id="email" class="form-input" required />
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" class="form-input" required pattern="[0-9]{10}" maxlength="10" />
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
                            <input type="password" id="password" class="form-input" required minlength="8" placeholder="Min 8 characters" />
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password *</label>
                            <input type="password" id="confirmPassword" class="form-input" required />
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>
                        <div id="successMessage" class="success-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block admin-btn">
                            Submit Request
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

    // Handle form submission
    const form = document.getElementById('adminRegisterForm');
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

        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const submitBtn = form.querySelector('button[type="submit"]');

        // Validation
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

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
                successMessage.innerHTML = `
                    <strong>Registration Successful!</strong><br>
                    Your account is pending approval from a Super Admin.<br>
                    You will be notified once your account is active.
                `;
                successMessage.style.display = 'block';
                submitBtn.textContent = 'Request Submitted';
            }
        } catch (error) {
            errorMessage.textContent = error.response?.data?.message || 'Registration failed. Please try again.';
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
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
