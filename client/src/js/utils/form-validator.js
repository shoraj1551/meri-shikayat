/**
 * Form Validation Utilities
 * Enhanced validation with helpful error messages and inline feedback
 */

export class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};
    }

    /**
     * Validate email with helpful feedback
     */
    validateEmail(input) {
        const value = input.value.trim();
        const fieldName = input.name || 'email';

        if (!value) {
            return this.setError(input, 'Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return this.setError(input, 'Please enter a valid email address (e.g., name@example.com)');
        }

        this.clearError(input);
        return true;
    }

    /**
     * Validate password with strength indicator
     */
    validatePassword(input, showStrength = true) {
        const value = input.value;

        if (!value) {
            return this.setError(input, 'Password is required');
        }

        if (value.length < 8) {
            return this.setError(input, 'Password must be at least 8 characters long');
        }

        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        if (!hasUppercase) {
            return this.setError(input, 'Password must contain at least one uppercase letter');
        }

        if (!hasLowercase) {
            return this.setError(input, 'Password must contain at least one lowercase letter');
        }

        if (!hasNumber) {
            return this.setError(input, 'Password must contain at least one number');
        }

        if (!hasSpecial) {
            return this.setError(input, 'Password must contain at least one special character (@$!%*?&)');
        }

        this.clearError(input);

        // Show strength indicator
        if (showStrength) {
            this.showPasswordStrength(input, value);
        }

        return true;
    }

    /**
     * Show password strength indicator
     */
    showPasswordStrength(input, password) {
        let strength = 0;
        let strengthText = '';
        let strengthClass = '';

        // Calculate strength
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        // Determine strength level
        if (strength <= 2) {
            strengthText = 'Weak';
            strengthClass = 'strength-weak';
        } else if (strength <= 4) {
            strengthText = 'Medium';
            strengthClass = 'strength-medium';
        } else {
            strengthText = 'Strong';
            strengthClass = 'strength-strong';
        }

        // Find or create strength indicator
        let indicator = input.parentElement.querySelector('.password-strength');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'password-strength';
            input.parentElement.appendChild(indicator);
        }

        indicator.className = `password-strength ${strengthClass}`;
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${(strength / 5) * 100}%"></div>
            </div>
            <span class="strength-text">${strengthText}</span>
        `;
    }

    /**
     * Validate phone number
     */
    validatePhone(input) {
        const value = input.value.trim();

        if (!value) {
            return this.setError(input, 'Phone number is required');
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
            return this.setError(input, 'Please enter a valid 10-digit mobile number starting with 6-9');
        }

        this.clearError(input);
        return true;
    }

    /**
     * Validate required field
     */
    validateRequired(input, fieldLabel) {
        const value = input.value.trim();

        if (!value) {
            return this.setError(input, `${fieldLabel} is required`);
        }

        this.clearError(input);
        return true;
    }

    /**
     * Set error message for input
     */
    setError(input, message) {
        this.errors[input.name] = message;

        // Add error class to input
        input.classList.add('input-error');
        input.classList.remove('input-success');

        // Find or create error message element
        let errorElement = input.parentElement.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            input.parentElement.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Update validation icon
        this.updateValidationIcon(input, false);

        return false;
    }

    /**
     * Clear error for input
     */
    clearError(input) {
        delete this.errors[input.name];

        input.classList.remove('input-error');
        input.classList.add('input-success');

        const errorElement = input.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        // Update validation icon
        this.updateValidationIcon(input, true);
    }

    /**
     * Update validation icon
     */
    updateValidationIcon(input, isValid) {
        let icon = input.parentElement.querySelector('.validation-icon');
        if (!icon) {
            icon = document.createElement('span');
            icon.className = 'validation-icon';
            input.parentElement.appendChild(icon);
        }

        if (isValid) {
            icon.textContent = '✓';
            icon.className = 'validation-icon validation-success';
        } else {
            icon.textContent = '✗';
            icon.className = 'validation-icon validation-error';
        }
    }

    /**
     * Check if form is valid
     */
    isValid() {
        return Object.keys(this.errors).length === 0;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }
}

// Add validation styles
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .input-error {
        border-color: #F44336 !important;
        background-color: #fff5f5 !important;
    }

    .input-success {
        border-color: #4CAF50 !important;
    }

    .field-error {
        color: #F44336;
        font-size: 13px;
        margin-top: 4px;
        display: none;
        animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .validation-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        font-weight: bold;
    }

    .validation-success {
        color: #4CAF50;
    }

    .validation-error {
        color: #F44336;
    }

    .password-strength {
        margin-top: 8px;
        font-size: 13px;
    }

    .strength-bar {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 4px;
    }

    .strength-fill {
        height: 100%;
        transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-weak .strength-fill {
        background-color: #F44336;
    }

    .strength-medium .strength-fill {
        background-color: #ff9800;
    }

    .strength-strong .strength-fill {
        background-color: #4CAF50;
    }

    .strength-text {
        font-weight: 600;
    }

    .strength-weak .strength-text {
        color: #F44336;
    }

    .strength-medium .strength-text {
        color: #ff9800;
    }

    .strength-strong .strength-text {
        color: #4CAF50;
    }

    .input-wrapper {
        position: relative;
    }

    .input-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        pointer-events: none;
    }

    .input-wrapper input {
        padding-left: 40px;
    }
`;

document.head.appendChild(validationStyles);

export default FormValidator;
