/**
 * Admin, Contractor, and Super Admin Registration Forms
 * Additional forms for multi-role registration system
 */

import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

// Helper function to show approval pending screen
export function showApprovalPending(userType, userName) {
    const app = document.getElementById('app');

    const typeInfo = {
        admin: {
            icon: '🛡️',
            title: 'Admin',
            timeline: '1-2 business days'
        },
        contractor: {
            icon: '🏗️',
            title: 'Contractor',
            timeline: '2-3 business days'
        }
    };

    const info = typeInfo[userType];

    app.innerHTML = `
        <div class="auth-page multi-role-register">
            <div class="auth-container" style="max-width: 800px;">
                <div class="auth-card">
                    <div class="approval-pending-container">
                        <div class="pending-icon">${info.icon}</div>
                        <h2 class="pending-title">Registration Submitted!</h2>
                        <p class="pending-message">
                            Thank you, <strong>${userName}</strong>! Your ${info.title} registration has been submitted successfully.
                        </p>

                        <div class="pending-steps">
                            <h3>What happens next:</h3>
                            <ol>
                                <li><strong>Document Verification</strong> - We'll verify your submitted documents and credentials</li>
                                <li><strong>Admin Review</strong> - A Super Admin will review your application</li>
                                <li><strong>Email Notification</strong> - You'll receive an email once your account is approved</li>
                            </ol>
                        </div>

                        <div class="pending-timeline">
                            <strong>⏱️ Estimated Review Time:</strong> ${info.timeline}
                        </div>

                        <div class="pending-actions">
                            <button class="btn btn-primary" onclick="window.router.navigate('/')">
                                Return to Home
                            </button>
                            <button class="btn btn-secondary" onclick="window.router.navigate('/login')">
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper functions for form handling
export function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.innerHTML = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Back to role selection handler
export function attachBackButton(callback) {
    const backBtn = document.getElementById('backToRoleSelection');
    if (backBtn) {
        backBtn.addEventListener('click', callback);
    }
}

// Handle links
export function attachLinkHandlers(app) {
    app.querySelectorAll('a').forEach(link => {
        if (!link.hasAttribute('target')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                window.router.navigate(href);
            });
        }
    });
}
