export function renderForgotPasswordVerifyPage() {
    const app = document.getElementById('app');

    const identifier = sessionStorage.getItem('resetIdentifier');
    if (!identifier) {
        window.router.navigate('/forgot-password');
        return;
    }

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header-actions">
                        <a href="/forgot-password" class="auth-back-link">← Back</a>
                    </div>
                    <h2 class="auth-title">Verify OTP</h2>
                    <p class="auth-subtitle">Enter the 6-digit code sent to <strong>${identifier}</strong></p>
                    
                    <form id="verifyOtpForm" class="auth-form">
                        <div class="form-group">
                            <label for="otp">Enter OTP</label>
                            <input 
                                type="text" 
                                id="otp" 
                                name="otp" 
                                class="form-input" 
                                placeholder="000000"
                                maxlength="6"
                                pattern="[0-9]{6}"
                                autocomplete="one-time-code"
                                required
                                style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;"
                            />
                        </div>

                        <div class="otp-timer" id="otpTimer">
                            <span class="timer-icon">⏱️</span>
                            <span class="timer-text">OTP expires in <strong id="timerCount">5:00</strong></span>
                        </div>

                        <div id="errorMessage" class="error-message" style="display: none;"></div>

                        <button type="submit" class="btn btn-primary btn-block" id="verifyBtn">
                            <span class="btn-text">Verify OTP</span>
                            <span class="btn-loader" style="display: none;">
                                <span class="spinner"></span> Verifying...
                            </span>
                        </button>

                        <button type="button" class="btn-resend-otp" id="resendOtpBtn" disabled>
                            <span class="resend-icon">🔄</span> Resend OTP
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Start OTP timer
    const expiryTime = parseInt(sessionStorage.getItem('otpExpiry'));
    let timeLeft = Math.floor((expiryTime - Date.now()) / 1000);

    if (timeLeft <= 0) {
        document.getElementById('timerCount').textContent = 'Expired';
        document.getElementById('timerCount').style.color = '#ef4444';
        document.getElementById('resendOtpBtn').disabled = false;
        document.getElementById('resendOtpBtn').style.opacity = '1';
    } else {
        const timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timerCount').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('timerCount').textContent = 'Expired';
                document.getElementById('timerCount').style.color = '#ef4444';
                document.getElementById('resendOtpBtn').disabled = false;
                document.getElementById('resendOtpBtn').style.opacity = '1';
            }
        }, 1000);
    }

    // Handle OTP verification
    const form = document.getElementById('verifyOtpForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnLoader = verifyBtn.querySelector('.btn-loader');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const enteredOtp = document.getElementById('otp').value.trim();
        const correctOtp = sessionStorage.getItem('resetOTP');
        const errorMsg = document.getElementById('errorMessage');

        errorMsg.style.display = 'none';

        if (enteredOtp !== correctOtp) {
            errorMsg.textContent = 'Invalid OTP. Please try again.';
            errorMsg.style.display = 'block';
            return;
        }

        // Check if OTP expired
        if (timeLeft <= 0) {
            errorMsg.textContent = 'OTP has expired. Please request a new one.';
            errorMsg.style.display = 'block';
            return;
        }

        // Show loading
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // OTP verified, navigate to reset password
        setTimeout(() => {
            sessionStorage.setItem('otpVerified', 'true');
            window.router.navigate('/forgot-password-reset');
        }, 500);
    });

    // Handle resend OTP
    document.getElementById('resendOtpBtn').addEventListener('click', () => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('resetOTP', newOtp);
        sessionStorage.setItem('otpExpiry', (Date.now() + 5 * 60 * 1000).toString());

        console.log('🔐 New OTP:', newOtp);
        alert(`New OTP sent!\nOTP: ${newOtp}\n\nIn production, this would be sent to ${identifier}`);

        // Reload page to restart timer
        window.router.navigate('/forgot-password-verify');
    });

    // Handle links
    app.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.router.navigate(link.getAttribute('href'));
        });
    });
}
