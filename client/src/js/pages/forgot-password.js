export function renderForgotPasswordPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header-actions">
                        <a href="/login" class="auth-back-link">← Back to Login</a>
                    </div>
                    <h2 class="auth-title">Reset Your Password</h2>
                    <p class="auth-subtitle">Enter your email or phone number to receive password reset instructions</p>
                    
                    <form id="forgotPasswordForm" class="auth-form" autocomplete="on">
                        <div class="form-group">
                            <label for="identifier">Email or Phone Number</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                class="form-input" 
                                placeholder="your@email.com or 10-digit phone"
                                autocomplete="username"
                                required
                            />
                            <small class="form-hint">We'll send you instructions to reset your password</small>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>
                        <div id="successMessage" class="success-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block" id="resetBtn">
                            <span class="btn-text">Send Reset Instructions</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Sending...
                            </span>
                        </button>
                    </form>

                    <p class="auth-footer">
                        Remember your password? 
                        <a href="/login" class="auth-link">Login here</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Handle form submission
    const form = document.getElementById('forgotPasswordForm');
    const resetBtn = document.getElementById('resetBtn');
    const btnText = resetBtn.querySelector('.btn-text');
    const btnLoader = resetBtn.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier').value.trim();
        const errorMsg = document.getElementById('errorMessage');
        const successMsg = document.getElementById('successMessage');

        // Hide previous messages
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';

        // Show loading state
        resetBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Simulate API call (replace with actual API when ready)
        setTimeout(() => {
            // Success message
            successMsg.innerHTML = `
                <strong>Instructions Sent!</strong><br>
                If an account exists with <strong>${identifier}</strong>, you will receive password reset instructions shortly.<br>
                Please check your email or phone.
            `;
            successMsg.style.display = 'block';

            // Reset button
            resetBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';

            // Clear form
            form.reset();

            // Redirect to login after 5 seconds
            setTimeout(() => {
                window.router.navigate('/login');
            }, 5000);
        }, 1500);
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
